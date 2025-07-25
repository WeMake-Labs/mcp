#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { z } from "zod";

const DEFAULT_PATH = path.join(os.homedir(), ".wemake", "tasks.json");
const TASK_FILE_PATH = process.env.TASKS_FILE_PATH || DEFAULT_PATH;

interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  approved: boolean;
  completedDetails: string;
}

interface RequestEntry {
  requestId: string;
  originalRequest: string;
  splitDetails: string;
  tasks: Task[];
  completed: boolean; // marked true after all tasks done and request completion approved
}

interface TasksFile {
  requests: RequestEntry[];
}

// Zod Schemas
const RequestPlanningSchema = z.object({
  originalRequest: z.string(),
  splitDetails: z.string().optional(),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  )
});

const GetNextTaskSchema = z.object({
  requestId: z.string()
});

const MarkTaskDoneSchema = z.object({
  requestId: z.string(),
  taskId: z.string(),
  completedDetails: z.string().optional()
});

const ApproveTaskCompletionSchema = z.object({
  requestId: z.string(),
  taskId: z.string()
});

const ApproveRequestCompletionSchema = z.object({
  requestId: z.string()
});

const OpenTaskDetailsSchema = z.object({
  taskId: z.string()
});

const ListRequestsSchema = z.object({});

const AddTasksToRequestSchema = z.object({
  requestId: z.string(),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  )
});

const UpdateTaskSchema = z.object({
  requestId: z.string(),
  taskId: z.string(),
  title: z.string().optional(),
  description: z.string().optional()
});

const DeleteTaskSchema = z.object({
  requestId: z.string(),
  taskId: z.string()
});

// Tools with enriched English descriptions

const PLANNING_TOOL: Tool = {
  name: "planning",
  description: `Use planning to initiate a new task workflow.

MANDATORY PARAMETERS:
- originalRequest (string): The complete, unmodified user request
- tasks (array): List of task objects, each containing:
  - title (string): Concise task identifier (max 50 characters)
  - description (string): Detailed task specification including success criteria

OPTIONAL PARAMETERS:
- splitDetails (string): Additional context explaining the task decomposition rationale

EXECUTION PROTOCOL:

1. REQUEST ANALYSIS
   - Parse the user's original request comprehensively
   - Identify ALL discrete, actionable components
   - Ensure no implicit requirements are overlooked

2. TASK DECOMPOSITION
   - Create atomic tasks that can be independently executed
   - Each task MUST have clear completion criteria
   - Tasks should follow logical dependency order
   - Avoid task overlap or redundancy

3. WORKFLOW INITIALIZATION
   Upon successful execution, the system will:
   - Assign a unique requestId
   - Generate taskIds for each task
   - Display a progress table showing all tasks
   - Return confirmation that tasks are registered

CRITICAL WORKFLOW RULES:
- After using planning, you MUST immediately call get_next_task to retrieve the first task
- NEVER proceed to execute tasks without first retrieving them via get_next_task
- The workflow enforces a strict approval cycle: Plan → Execute → Mark Done → Await Approval → Next Task
- User approval is MANDATORY after each task completion before proceeding

OUTPUT STRUCTURE:
The tool returns a JSON response containing:
- status: "planned"
- requestId: Unique identifier for this request
- totalTasks: Number of tasks created
- tasks: Array of task objects with ids
- message: Confirmation with progress table

CONSTRAINT: You MUST NOT attempt to execute any tasks immediately after planning. The next required action is ALWAYS to call get_next_task.`,
  inputSchema: {
    type: "object",
    properties: {
      originalRequest: { type: "string" },
      splitDetails: { type: "string" },
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" }
          },
          required: ["title", "description"]
        }
      }
    },
    required: ["originalRequest", "tasks"]
  }
};

const GET_NEXT_TASK_TOOL: Tool = {
  name: "get_next_task",
  description: `Use get_next_task to retrieve the next pending task for execution.

MANDATORY PARAMETERS:
- requestId (string): The unique identifier of the active request

EXECUTION LOGIC:

1. TASK RETRIEVAL PROTOCOL
   The tool will return one of these states:
   
   a) "next_task": A pending task is available
      - Returns task details (id, title, description)
      - Displays current progress table
      - Task is ready for execution
   
   b) "all_tasks_done": All tasks completed but await final approval
      - No more tasks to execute
      - Request completion approval required
      - Progress table shows all tasks done
   
   c) "already_completed": Request was previously finalized
      - No action possible
      - Request is archived
   
   d) "error": Invalid requestId provided

2. CRITICAL APPROVAL ENFORCEMENT
   
   CONSTRAINT 1: After calling mark_task_done, you MUST NOT call get_next_task again until the user explicitly approves via approve_task_completion
   
   CONSTRAINT 2: If the same task is returned repeatedly, it indicates the previous task awaits approval - DO NOT proceed
   
   CONSTRAINT 3: When "all_tasks_done" status is returned:
   - DO NOT create new requests
   - DO NOT attempt any new actions
   - WAIT for user to call approve_request_completion

3. PROGRESS MONITORING
   Each response includes a comprehensive progress table showing:
   - Task IDs and titles
   - Completion status (✅ Done / 🔄 In Progress)
   - Approval status (✅ Approved / ⏳ Pending)

WORKFLOW POSITION:
This tool is called:
- Immediately after planning to get the first task
- After approve_task_completion to get the next task
- NEVER directly after mark_task_done

OUTPUT INTERPRETATION:
- If status is "next_task": Execute the provided task
- If status is "all_tasks_done": Request final approval from user
- For any other status: Handle the specific condition appropriately`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" }
    },
    required: ["requestId"]
  }
};

const MARK_TASK_DONE_TOOL: Tool = {
  name: "mark_task_done",
  description: `Use mark_task_done after successfully completing a task's requirements.

MANDATORY PARAMETERS:
- requestId (string): The request containing the task
- taskId (string): The specific task being marked complete

OPTIONAL PARAMETERS:
- completedDetails (string): Detailed documentation of how the task was completed, including:
  - Specific actions taken
  - Results achieved
  - Any relevant outputs or artifacts
  - Deviations from original plan (if any)

EXECUTION PROTOCOL:

1. COMPLETION VERIFICATION
   Before calling this tool, ensure:
   - Task requirements are fully satisfied
   - All success criteria are met
   - Any outputs are properly documented
   - No partial completions - task must be 100% done

2. STATUS UPDATE
   The tool will:
   - Set task status to "done"
   - Record completion details
   - Update progress table
   - Display current workflow state

3. APPROVAL CHECKPOINT ACTIVATION
   CRITICAL: After marking done, the workflow enters a mandatory approval state
   
   YOU MUST:
   - STOP all task progression immediately
   - NOT call get_next_task
   - WAIT for user approval via approve_task_completion
   - Inform the user that approval is required

4. COMPLETION DOCUMENTATION
   Use completedDetails to provide:
   - Summary of actions performed
   - Key results or outputs
   - Any issues encountered and resolutions
   - Verification that success criteria were met

ERROR CONDITIONS:
- "already_done": Task was previously marked complete
- "error": Invalid requestId or taskId

POST-EXECUTION REQUIREMENT:
After successful execution, you MUST:
1. Inform the user the task is complete
2. Explicitly request approval before proceeding
3. NOT attempt to retrieve the next task
4. Display the updated progress table showing the task as done but pending approval

WORKFLOW POSITION:
This tool is called:
- After successfully executing a task retrieved via get_next_task
- Before requesting user approval
- Never for the same task twice`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" },
      taskId: { type: "string" },
      completedDetails: { type: "string" }
    },
    required: ["requestId", "taskId"]
  }
};

const APPROVE_TASK_COMPLETION_TOOL: Tool = {
  name: "approve_task_completion",
  description: `Use approve_task_completion to approve a completed task only when all self-approval requirements are met: 1. All task objectives are fully achieved as per the task description, verified by cross-referencing actions taken. 2. Execution completed without any errors, exceptions, or failures, confirmed via logs or tests. 3. Results precisely match the predefined success criteria outlined in the task. 4. Comprehensive documentation is provided, including detailed steps, outcomes, rationale, and any deviations.

MANDATORY PARAMETERS:
- requestId (string): The request containing the completed task
- taskId (string): The specific task being approved

APPROVAL PROTOCOL:

1. PREREQUISITE VALIDATION
   The tool verifies:
   - Task exists in the specified request
   - Task is marked as done
   - Task has not been previously approved
   - Approval is pending

2. APPROVAL PROCESSING
   Upon invocation:
   - Task approval status changes to "approved"
   - Progress table updates to reflect approval
   - Workflow is unblocked for progression
   - Assistant can now call get_next_task

3. DECISION POINTS
   If requirements are not met:
   - Workflow remains blocked
   - May require task revision
   - May require task re-execution
   - May modify task requirements via update_task
   - May abandon task via delete_task

4. PROGRESS VISUALIZATION
   A comprehensive progress table displays:
   - All tasks with completion status
   - Current approval states
   - Clear indication of which task awaits approval

WORKFLOW IMPLICATIONS:
- Approval unlocks get_next_task for the assistant
- Without approval, no forward progress is possible
- Multiple approval cycles may occur if revisions are needed
- Approval is irreversible once granted

ASSISTANT BEHAVIOR:
When this tool is called:
1. Acknowledge the approval
2. Update internal workflow state
3. Proceed to get_next_task for next pending task
4. If no tasks remain, prepare for request completion approval

CONTROL:
This tool represents a critical control point where the assistant:
- Validates quality of work
- Ensures requirements are met
- Maintains oversight of the workflow
- Can halt or redirect execution as needed`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" },
      taskId: { type: "string" }
    },
    required: ["requestId", "taskId"]
  }
};

const APPROVE_REQUEST_COMPLETION_TOOL: Tool = {
  name: "approve_request_completion",
  description: `Use approve_request_completion to finalize a request only when all tasks are completed, approved, and self-approval requirements are met across the request: 1. All task objectives are fully achieved as per the task description, verified by cross-referencing actions taken. 2. Execution completed without any errors, exceptions, or failures, confirmed via logs or tests. 3. Results precisely match the predefined success criteria outlined in the task. 4. Comprehensive documentation is provided, including detailed steps, outcomes, rationale, and any deviations.

MANDATORY PARAMETERS:
- requestId (string): The request to be finalized

FINALIZATION PROTOCOL:

1. PREREQUISITE VERIFICATION
   The tool validates:
   - All tasks in the request are marked done
   - All completed tasks have been individually approved
   - Request is not already finalized
   - No pending tasks remain

2. COMPLETION PROCESSING
   Upon invocation:
   - Request status changes to "completed"
   - Workflow is formally closed
   - Request becomes read-only (no further modifications)
   - Final progress table is displayed

3. DECISION ALTERNATIVES
   If requirements are not met:
   - Request remains active
   - Can add new tasks via add_tasks_to_request
   - Can create supplementary tasks
   - Workflow continues with new task cycle

4. FINAL STATE VISUALIZATION
   A comprehensive final progress table shows:
   - All tasks with ✅ Done status
   - All tasks with ✅ Approved status
   - Request summary and completion metrics
   - Confirmation of successful closure

WORKFLOW TERMINATION:
- This represents the absolute end of a request lifecycle
- No further modifications possible after approval
- Request enters permanent archive state
- New requests must be created for additional work

ASSISTANT BEHAVIOR:
When this tool is called:
1. Acknowledge request completion
2. Provide final summary of accomplished work
3. Confirm no further actions possible on this request
4. Offer to create new request if additional needs arise

COMPLETION CRITERIA:
Approve when:
- Original request objectives are fully met
- All deliverables are satisfactory
- No additional tasks are needed
- Quality standards are achieved

POST-COMPLETION:
After approval, the request serves as:
- Historical record of work performed
- Reference for similar future requests
- Audit trail of approvals and completions`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" }
    },
    required: ["requestId"]
  }
};

const OPEN_TASK_DETAILS_TOOL: Tool = {
  name: "open_task_details",
  description: `Use open_task_details to inspect detailed information about any task.

MANDATORY PARAMETERS:
- taskId (string): The unique identifier of the task to inspect

RETRIEVAL PROTOCOL:

1. TASK LOOKUP
   The tool searches across all requests to find the specified task
   - No requestId needed - taskId is globally unique
   - Returns full task context including parent request
   - Works for tasks in any state (pending, done, approved)

2. INFORMATION PROVIDED
   Returns comprehensive task data:
   
   Task Details:
   - id: Unique task identifier
   - title: Task name
   - description: Full task specification
   - done: Completion status (true/false)
   - approved: Approval status (true/false)
   - completedDetails: Documentation of how task was completed
   
   Request Context:
   - requestId: Parent request identifier
   - originalRequest: Initial user request
   - splitDetails: Task decomposition rationale
   - completed: Request finalization status

3. USE CASES
   Invoke this tool when:
   - User asks about specific task status
   - Clarification needed on task requirements
   - Reviewing completion details
   - Debugging workflow issues
   - Verifying task dependencies

4. ERROR HANDLING
   - "task_not_found": Invalid taskId provided
   - Returns error message for non-existent tasks

OPERATIONAL NOTES:
- This is a read-only operation
- Does not affect workflow state
- Can be called at any time
- Useful for providing user with task clarity
- Helps maintain context in long workflows

TYPICAL WORKFLOW INTEGRATION:
1. User queries about a specific task
2. Assistant calls open_task_details with taskId
3. Assistant presents the detailed information
4. User makes informed decisions about task handling

OUTPUT UTILIZATION:
Use the returned data to:
- Answer user questions about task state
- Verify completion criteria were met
- Review approval history
- Understand task context within larger request`,
  inputSchema: {
    type: "object",
    properties: {
      taskId: { type: "string" }
    },
    required: ["taskId"]
  }
};

const LIST_REQUESTS_TOOL: Tool = {
  name: "list_requests",
  description: `Use list_requests to display all requests in the system.

PARAMETERS: None required (empty object {})

RETRIEVAL PROTOCOL:

1. SYSTEM-WIDE SCAN
   The tool aggregates data from all requests:
   - Active requests (in progress)
   - Completed requests (finalized)
   - Requests with mixed task states
   - All historical requests in the system

2. INFORMATION PROVIDED
   
   Summary Table Format:
   | Request ID | Original Request | Total Tasks | Completed | Approved |
   
   Each row contains:
   - requestId: Unique request identifier
   - originalRequest: First 30 characters of request (truncated if longer)
   - totalTasks: Number of tasks in request
   - completedTasks: Count of done tasks
   - approvedTasks: Count of approved tasks

3. USE CASES
   Invoke this tool when:
   - User needs workflow overview
   - Selecting which request to work on
   - Checking overall progress
   - Identifying stalled requests
   - Planning workload distribution

4. DATA INTERPRETATION
   Request States:
   - Active: completedTasks < totalTasks
   - Awaiting Approval: completedTasks = totalTasks but approvedTasks < totalTasks
   - Finalizable: All tasks done and approved
   - Completed: Request marked as finished

OPERATIONAL WORKFLOW:
1. User requests system overview
2. Assistant calls list_requests
3. Assistant presents formatted table
4. User identifies request of interest
5. Assistant can then use get_next_task with chosen requestId

DECISION SUPPORT:
The overview helps users:
- Prioritize which requests to focus on
- Identify bottlenecks (unapproved tasks)
- Track overall system utilization
- Plan new request creation
- Monitor completion rates

FOLLOW-UP ACTIONS:
Based on the list, typical next steps:
- Select a request to continue work
- Identify requests needing approval
- Create new requests for unaddressed needs
- Archive completed requests mentally`,
  inputSchema: {
    type: "object",
    properties: {}
  }
};

const ADD_TASKS_TO_REQUEST_TOOL: Tool = {
  name: "add_tasks_to_request",
  description: `Use add_tasks_to_request to extend an existing request with new tasks.

MANDATORY PARAMETERS:
- requestId (string): The target request to extend
- tasks (array): New task objects, each containing:
  - title (string): Concise task identifier
  - description (string): Detailed task specification

EXTENSION PROTOCOL:

1. REQUEST VALIDATION
   Before adding tasks, the tool verifies:
   - Request exists and is valid
   - Request is not already completed/finalized
   - Request can accept new tasks
   
   CONSTRAINT: Cannot add tasks to completed requests

2. TASK INTEGRATION
   New tasks will:
   - Receive unique taskIds
   - Be appended to existing task list
   - Appear in workflow queue after current tasks
   - Follow standard approval cycle

3. USE CASES
   Add tasks when:
   - User identifies additional requirements
   - Original scope was incomplete
   - Emergent needs arise during execution
   - Iterative refinement is needed
   - User rejects completion and wants more work

4. WORKFLOW CONTINUITY
   After adding tasks:
   - Progress table updates to show all tasks
   - New tasks enter pending state
   - Existing workflow continues normally
   - get_next_task will eventually reach new tasks

STRATEGIC CONSIDERATIONS:
- Maintains workflow momentum (no restart needed)
- Preserves completed work and approvals
- Enables agile scope adjustment
- Supports iterative development approach

TYPICAL SCENARIO:
1. All original tasks completed
2. User reviews and wants additional work
3. Instead of approving completion, user defines new tasks
4. Assistant calls add_tasks_to_request
5. Workflow continues with expanded scope

OUTPUT STRUCTURE:
Returns confirmation with:
- Number of tasks added
- Updated progress table
- New task details with assigned IDs
- Current workflow state

POST-EXECUTION:
After adding tasks:
- Continue current workflow normally
- New tasks will be retrieved via get_next_task
- Standard approval cycle applies to new tasks
- Request remains active until all tasks complete`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" },
      tasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" }
          },
          required: ["title", "description"]
        }
      }
    },
    required: ["requestId", "tasks"]
  }
};

const UPDATE_TASK_TOOL: Tool = {
  name: "update_task",
  description: `Use update_task to modify existing task details.

MANDATORY PARAMETERS:
- requestId (string): The request containing the task
- taskId (string): The task to update

OPTIONAL PARAMETERS (at least one required):
- title (string): New task title
- description (string): New task description

UPDATE PROTOCOL:

1. MODIFICATION CONSTRAINTS
   Tasks can only be updated if:
   - Task exists in specified request
   - Task is NOT marked as done
   - Task is NOT approved
   - Request is NOT completed
   
   CRITICAL: Completed tasks are immutable for audit integrity

2. PERMISSIBLE UPDATES
   You can modify:
   - Task title for clarity
   - Task description for better specifications
   - Both title and description simultaneously
   
   You CANNOT modify:
   - Task ID
   - Completion status
   - Approval status
   - Historical completion details

3. USE CASES
   Update tasks when:
   - User clarifies requirements
   - Ambiguity discovered during execution
   - Scope refinement needed
   - Better description would aid execution
   - User feedback requires specification change

4. WORKFLOW IMPACT
   Updates take effect immediately:
   - Progress table reflects changes
   - Next retrieval shows updated details
   - No workflow disruption occurs
   - Task position in queue unchanged

ERROR CONDITIONS:
- Cannot update completed tasks
- Cannot update non-existent tasks
- Cannot update tasks in completed requests

TYPICAL WORKFLOW:
1. User identifies need for task clarification
2. Assistant calls update_task with new details
3. Updated progress table displayed
4. Workflow continues with refined task
5. Task executed according to new specification

BEST PRACTICES:
- Update before starting task execution
- Preserve original intent while clarifying
- Document why update was needed
- Ensure updates align with overall request goals

POST-UPDATE:
- Task remains in current workflow position
- Standard execution and approval cycle continues
- Updated details used for execution
- Historical record maintains update transaction`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" },
      taskId: { type: "string" },
      title: { type: "string" },
      description: { type: "string" }
    },
    required: ["requestId", "taskId"]
  }
};

const DELETE_TASK_TOOL: Tool = {
  name: "delete_task",
  description: `Use delete_task to permanently remove a task from a request.

MANDATORY PARAMETERS:
- requestId (string): The request containing the task
- taskId (string): The task to delete

DELETION PROTOCOL:

1. DELETION CONSTRAINTS
   Tasks can only be deleted if:
   - Task exists in specified request
   - Task is NOT marked as done
   - Task is NOT approved
   - Request is NOT completed
   
   CRITICAL: Completed tasks cannot be deleted to maintain audit trail

2. DELETION IMPACT
   Upon deletion:
   - Task is permanently removed from request
   - Task ID becomes invalid
   - Progress table updates to reflect removal
   - Workflow continues with remaining tasks
   - No recovery possible (irreversible)

3. USE CASES
   Delete tasks when:
   - Task was created in error
   - Requirement is no longer applicable
   - Duplicate task was accidentally created
   - Scope change eliminates need
   - User decides task is unnecessary

4. WORKFLOW CONTINUITY
   After deletion:
   - Remaining tasks maintain their order
   - No gaps in task execution
   - get_next_task skips to next valid task
   - Overall request can still complete normally

ERROR CONDITIONS:
- Cannot delete completed tasks
- Cannot delete approved tasks
- Cannot delete from completed requests
- Cannot delete non-existent tasks

SAFETY CONSIDERATIONS:
- Deletion is permanent and irreversible
- No undo mechanism exists
- Completed work is protected from deletion
- Maintains data integrity for audit purposes

TYPICAL WORKFLOW:
1. User identifies unnecessary task
2. User confirms task hasn't been started
3. Assistant calls delete_task
4. Confirmation shows updated task list
5. Workflow continues with reduced scope

ALTERNATIVE TO DELETION:
If task is already completed:
- Cannot delete
- Can only proceed through approval cycle
- User can choose not to approve
- Completed task remains in historical record

POST-DELETION STATE:
- Progress table shows remaining tasks only
- Deleted task ID no longer valid
- Request can complete with fewer tasks
- No impact on other task executions`,
  inputSchema: {
    type: "object",
    properties: {
      requestId: { type: "string" },
      taskId: { type: "string" }
    },
    required: ["requestId", "taskId"]
  }
};

export class TasksServer {
  private requestCounter = 0;
  private taskCounter = 0;
  private data: TasksFile = { requests: [] };

  constructor() {
    this.loadTasks();
  }

  private async loadTasks() {
    try {
      const data = await fs.readFile(TASK_FILE_PATH, "utf-8");
      this.data = JSON.parse(data);
      const allTaskIds: number[] = [];
      const allRequestIds: number[] = [];

      for (const req of this.data.requests) {
        const reqNum = Number.parseInt(req.requestId.replace("req-", ""), 10);
        if (!Number.isNaN(reqNum)) {
          allRequestIds.push(reqNum);
        }
        for (const t of req.tasks) {
          const tNum = Number.parseInt(t.id.replace("task-", ""), 10);
          if (!Number.isNaN(tNum)) {
            allTaskIds.push(tNum);
          }
        }
      }

      this.requestCounter =
        allRequestIds.length > 0 ? Math.max(...allRequestIds) : 0;
      this.taskCounter = allTaskIds.length > 0 ? Math.max(...allTaskIds) : 0;
    } catch {
      this.data = { requests: [] };
    }
  }

  private async saveTasks() {
    try {
      // Ensure directory exists
      const dir = path.dirname(TASK_FILE_PATH);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(
        TASK_FILE_PATH,
        JSON.stringify(this.data, null, 2),
        "utf-8"
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("EROFS")) {
        console.error("EROFS: read-only file system. Cannot save tasks.");
        throw error;
      }
      throw error;
    }
  }

  private formatTaskProgressTable(requestId: string): string {
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return "Request not found";

    let table = "\nProgress:\n";
    table += "| Task ID | Title | Description | Status | Approval |\n";
    table += "|----------|----------|------|------|----------|\n";

    for (const task of req.tasks) {
      const status = task.done ? "✅ Done" : "🔄 In Progress";
      const approved = task.approved ? "✅ Approved" : "⏳ Pending";
      table += `| ${task.id} | ${task.title} | ${task.description} | ${status} | ${approved} |\n`;
    }

    return table;
  }

  private formatRequestsList(): string {
    let output = "\nRequest List:\n";
    output +=
      "| Request ID | Original Request | Total Tasks | Completed | Approved |\n";
    output +=
      "|------------|------------------|-------------|-----------|----------|\n";

    for (const req of this.data.requests) {
      const totalTasks = req.tasks.length;
      const completedTasks = req.tasks.filter((t) => t.done).length;
      const approvedTasks = req.tasks.filter((t) => t.approved).length;
      output += `| ${req.requestId} | ${req.originalRequest.substring(0, 30)}${req.originalRequest.length > 30 ? "..." : ""} | ${totalTasks} | ${completedTasks} | ${approvedTasks} |\n`;
    }

    return output;
  }

  public async requestPlanning(
    originalRequest: string,
    tasks: { title: string; description: string }[],
    splitDetails?: string
  ) {
    await this.loadTasks();
    this.requestCounter += 1;
    const requestId = `req-${this.requestCounter}`;

    const newTasks: Task[] = [];
    for (const taskDef of tasks) {
      this.taskCounter += 1;
      newTasks.push({
        id: `task-${this.taskCounter}`,
        title: taskDef.title,
        description: taskDef.description,
        done: false,
        approved: false,
        completedDetails: ""
      });
    }

    this.data.requests.push({
      requestId,
      originalRequest,
      splitDetails: splitDetails || originalRequest,
      tasks: newTasks,
      completed: false
    });

    await this.saveTasks();

    const progressTable = this.formatTaskProgressTable(requestId);

    return {
      status: "planned",
      requestId,
      totalTasks: newTasks.length,
      tasks: newTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description
      })),
      message: `Tasks have been successfully added. Please use 'get_next_task' to retrieve the first task.\n${progressTable}`
    };
  }

  public async getNextTask(requestId: string) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) {
      return { status: "error", message: "Request not found" };
    }
    if (req.completed) {
      return {
        status: "already_completed",
        message: "Request already completed."
      };
    }
    const nextTask = req.tasks.find((t) => !t.done);
    if (!nextTask) {
      // all tasks done?
      const allDone = req.tasks.every((t) => t.done);
      if (allDone && !req.completed) {
        const progressTable = this.formatTaskProgressTable(requestId);
        return {
          status: "all_tasks_done",
          message: `All tasks have been completed. Awaiting request completion approval.\n${progressTable}`
        };
      }
      return { status: "no_next_task", message: "No undone tasks found." };
    }

    const progressTable = this.formatTaskProgressTable(requestId);
    return {
      status: "next_task",
      task: {
        id: nextTask.id,
        title: nextTask.title,
        description: nextTask.description
      },
      message: `Next task is ready. Task approval will be required after completion.\n${progressTable}`
    };
  }

  public async markTaskDone(
    requestId: string,
    taskId: string,
    completedDetails?: string
  ) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };
    const task = req.tasks.find((t) => t.id === taskId);
    if (!task) return { status: "error", message: "Task not found" };
    if (task.done)
      return {
        status: "already_done",
        message: "Task is already marked done."
      };

    task.done = true;
    task.completedDetails = completedDetails || "";
    await this.saveTasks();
    return {
      status: "task_marked_done",
      requestId: req.requestId,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        completedDetails: task.completedDetails,
        approved: task.approved
      }
    };
  }

  public async approveTaskCompletion(requestId: string, taskId: string) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };
    const task = req.tasks.find((t) => t.id === taskId);
    if (!task) return { status: "error", message: "Task not found" };
    if (!task.done) return { status: "error", message: "Task not done yet." };
    if (task.approved)
      return { status: "already_approved", message: "Task already approved." };

    task.approved = true;
    await this.saveTasks();
    return {
      status: "task_approved",
      requestId: req.requestId,
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        completedDetails: task.completedDetails,
        approved: task.approved
      }
    };
  }

  public async approveRequestCompletion(requestId: string) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };

    // Check if all tasks are done and approved
    const allDone = req.tasks.every((t) => t.done);
    if (!allDone) {
      return { status: "error", message: "Not all tasks are done." };
    }
    const allApproved = req.tasks.every((t) => t.done && t.approved);
    if (!allApproved) {
      return { status: "error", message: "Not all done tasks are approved." };
    }

    req.completed = true;
    await this.saveTasks();
    return {
      status: "request_approved_complete",
      requestId: req.requestId,
      message: "Request is fully completed and approved."
    };
  }

  public async openTaskDetails(taskId: string) {
    await this.loadTasks();
    for (const req of this.data.requests) {
      const target = req.tasks.find((t) => t.id === taskId);
      if (target) {
        return {
          status: "task_details",
          requestId: req.requestId,
          originalRequest: req.originalRequest,
          splitDetails: req.splitDetails,
          completed: req.completed,
          task: {
            id: target.id,
            title: target.title,
            description: target.description,
            done: target.done,
            approved: target.approved,
            completedDetails: target.completedDetails
          }
        };
      }
    }
    return { status: "task_not_found", message: "No such task found" };
  }

  public async listRequests() {
    await this.loadTasks();
    const requestsList = this.formatRequestsList();
    return {
      status: "requests_listed",
      message: `Current requests in the system:\n${requestsList}`,
      requests: this.data.requests.map((req) => ({
        requestId: req.requestId,
        originalRequest: req.originalRequest,
        totalTasks: req.tasks.length,
        completedTasks: req.tasks.filter((t) => t.done).length,
        approvedTasks: req.tasks.filter((t) => t.approved).length
      }))
    };
  }

  public async addTasksToRequest(
    requestId: string,
    tasks: { title: string; description: string }[]
  ) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };
    if (req.completed)
      return {
        status: "error",
        message: "Cannot add tasks to completed request"
      };

    const newTasks: Task[] = [];
    for (const taskDef of tasks) {
      this.taskCounter += 1;
      newTasks.push({
        id: `task-${this.taskCounter}`,
        title: taskDef.title,
        description: taskDef.description,
        done: false,
        approved: false,
        completedDetails: ""
      });
    }

    req.tasks.push(...newTasks);
    await this.saveTasks();

    const progressTable = this.formatTaskProgressTable(requestId);
    return {
      status: "tasks_added",
      message: `Added ${newTasks.length} new tasks to request.\n${progressTable}`,
      newTasks: newTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description
      }))
    };
  }

  public async updateTask(
    requestId: string,
    taskId: string,
    updates: { title?: string; description?: string }
  ) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };

    const task = req.tasks.find((t) => t.id === taskId);
    if (!task) return { status: "error", message: "Task not found" };
    if (task.done)
      return { status: "error", message: "Cannot update completed task" };

    if (updates.title) task.title = updates.title;
    if (updates.description) task.description = updates.description;

    await this.saveTasks();

    const progressTable = this.formatTaskProgressTable(requestId);
    return {
      status: "task_updated",
      message: `Task ${taskId} has been updated.\n${progressTable}`,
      task: {
        id: task.id,
        title: task.title,
        description: task.description
      }
    };
  }

  public async deleteTask(requestId: string, taskId: string) {
    await this.loadTasks();
    const req = this.data.requests.find((r) => r.requestId === requestId);
    if (!req) return { status: "error", message: "Request not found" };

    const taskIndex = req.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return { status: "error", message: "Task not found" };
    // After checking taskIndex !== -1, we know the task exists
    if (req.tasks[taskIndex]!.done)
      return { status: "error", message: "Cannot delete completed task" };

    req.tasks.splice(taskIndex, 1);
    await this.saveTasks();

    const progressTable = this.formatTaskProgressTable(requestId);
    return {
      status: "task_deleted",
      message: `Task ${taskId} has been deleted.\n${progressTable}`
    };
  }
}

const server = new Server(
  {
    name: "tasks-server",
    version: "1.0.4"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const tasksServer = new TasksServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    PLANNING_TOOL,
    GET_NEXT_TASK_TOOL,
    MARK_TASK_DONE_TOOL,
    APPROVE_TASK_COMPLETION_TOOL,
    APPROVE_REQUEST_COMPLETION_TOOL,
    OPEN_TASK_DETAILS_TOOL,
    LIST_REQUESTS_TOOL,
    ADD_TASKS_TO_REQUEST_TOOL,
    UPDATE_TASK_TOOL,
    DELETE_TASK_TOOL
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "planning": {
        const parsed = RequestPlanningSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { originalRequest, tasks, splitDetails } = parsed.data;
        const result = await tasksServer.requestPlanning(
          originalRequest,
          tasks,
          splitDetails
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "get_next_task": {
        const parsed = GetNextTaskSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const result = await tasksServer.getNextTask(parsed.data.requestId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "mark_task_done": {
        const parsed = MarkTaskDoneSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId, taskId, completedDetails } = parsed.data;
        const result = await tasksServer.markTaskDone(
          requestId,
          taskId,
          completedDetails
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "approve_task_completion": {
        const parsed = ApproveTaskCompletionSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId, taskId } = parsed.data;
        const result = await tasksServer.approveTaskCompletion(
          requestId,
          taskId
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "approve_request_completion": {
        const parsed = ApproveRequestCompletionSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId } = parsed.data;
        const result = await tasksServer.approveRequestCompletion(requestId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "open_task_details": {
        const parsed = OpenTaskDetailsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { taskId } = parsed.data;
        const result = await tasksServer.openTaskDetails(taskId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "list_requests": {
        const parsed = ListRequestsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const result = await tasksServer.listRequests();
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "add_tasks_to_request": {
        const parsed = AddTasksToRequestSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId, tasks } = parsed.data;
        const result = await tasksServer.addTasksToRequest(requestId, tasks);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "update_task": {
        const parsed = UpdateTaskSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId, taskId, title, description } = parsed.data;
        const result = await tasksServer.updateTask(requestId, taskId, {
          title,
          description
        });
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      case "delete_task": {
        const parsed = DeleteTaskSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments: ${parsed.error!.message}`);
        }
        const { requestId, taskId } = parsed.data;
        const result = await tasksServer.deleteTask(requestId, taskId);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Tasks MCP Server running. Saving tasks at: ${TASK_FILE_PATH}`);
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
