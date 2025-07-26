import { describe, test, expect, beforeEach, mock } from "bun:test";
import { TasksServer } from "../index.js";

// Mock fs module
const mockReadFile = mock();
const mockWriteFile = mock();
const mockMkdir = mock();

mock.module("node:fs/promises", () => ({
  readFile: mockReadFile,
  writeFile: mockWriteFile,
  mkdir: mockMkdir
}));

describe("TasksServer", () => {
  let tasksServer: TasksServer;
  const testFilePath = "/tmp/test-tasks.json";

  let mockData = { requests: [] };

  beforeEach(async () => {
    mockReadFile.mockClear();
    mockWriteFile.mockClear();
    mockMkdir.mockClear();

    // Reset mock data
    mockData = { requests: [] };

    // Mock readFile to return current mockData
    mockReadFile.mockImplementation(() =>
      Promise.resolve(JSON.stringify(mockData))
    );

    // Mock writeFile to update mockData
    mockWriteFile.mockImplementation(async (_path: string, data: string) => {
      mockData = JSON.parse(data);
    });

    mockMkdir.mockResolvedValue(undefined);

    tasksServer = new TasksServer(testFilePath);
    // Wait for the constructor's loadTasks to complete
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  describe("constructor", () => {
    test("should initialize TasksServer with default file path", () => {
      expect(tasksServer).toBeInstanceOf(TasksServer);
    });

    test("should initialize TasksServer with custom file path", () => {
      const customServer = new TasksServer("/custom/path/tasks.json");
      expect(customServer).toBeInstanceOf(TasksServer);
    });
  });

  describe("requestPlanning", () => {
    test("should create new request with tasks", async () => {
      const originalRequest = "Test request";
      const tasks = [
        { title: "Task 1", description: "First task" },
        { title: "Task 2", description: "Second task" }
      ];
      const splitDetails = "Test split details";

      const result = await tasksServer.requestPlanning(
        originalRequest,
        tasks,
        splitDetails
      );

      expect(result.status).toBe("planned");
      expect(result.totalTasks).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0]?.title).toBe("Task 1");
      expect(result.tasks[1]?.title).toBe("Task 2");
      expect(result.requestId).toMatch(/^req-\d+$/);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should generate unique request and task IDs", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];

      const result1 = await tasksServer.requestPlanning("Request 1", tasks);
      const result2 = await tasksServer.requestPlanning("Request 2", tasks);

      expect(result1.requestId).not.toBe(result2.requestId);
      expect(result1.tasks[0]?.id).not.toBe(result2.tasks[0]?.id);
    });
  });

  describe("getNextTask", () => {
    test("should return next pending task", async () => {
      const tasks = [
        { title: "Task 1", description: "First task" },
        { title: "Task 2", description: "Second task" }
      ];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      const result = await tasksServer.getNextTask(planResult.requestId);

      expect(result.status).toBe("next_task");
      expect(result.task?.title).toBe("Task 1");
      expect(result.task?.id).toMatch(/^task-\d+$/);
    });

    test("should return all_tasks_done when no pending tasks", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      // Mark task as done
      await tasksServer.markTaskDone(
        planResult.requestId,
        planResult.tasks[0]!.id,
        "Completed"
      );

      const result = await tasksServer.getNextTask(planResult.requestId);

      expect(result.status).toBe("all_tasks_done");
    });

    test("should return error for non-existent request", async () => {
      const result = await tasksServer.getNextTask("non-existent-id");

      expect(result.status).toBe("error");
      expect(result.message).toBe("Request not found");
    });

    test("should return already_completed for completed request", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      // Mark task as done and approved, then approve request
      await tasksServer.markTaskDone(
        planResult.requestId,
        planResult.tasks[0]!.id,
        "Completed"
      );
      await tasksServer.approveTaskCompletion(
        planResult.requestId,
        planResult.tasks[0]!.id
      );
      await tasksServer.approveRequestCompletion(planResult.requestId);

      const result = await tasksServer.getNextTask(planResult.requestId);

      expect(result.status).toBe("already_completed");
    });
  });

  describe("markTaskDone", () => {
    test("should mark task as done with completion details", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      const result = await tasksServer.markTaskDone(
        planResult.requestId,
        taskId,
        "Task completed successfully"
      );

      expect(result.status).toBe("task_marked_done");
      expect(result.task?.id).toBe(taskId);
      expect(result.task?.completedDetails).toBe("Task completed successfully");
      expect(result.task?.approved).toBe(false);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error for non-existent request", async () => {
      const result = await tasksServer.markTaskDone(
        "non-existent-req",
        "task-1",
        "Details"
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Request not found");
    });

    test("should return error for non-existent task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      const result = await tasksServer.markTaskDone(
        planResult.requestId,
        "non-existent-task",
        "Details"
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Task not found");
    });

    test("should return already_done for already completed task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done first time
      await tasksServer.markTaskDone(
        planResult.requestId,
        taskId,
        "First completion"
      );

      // Try to mark as done again
      const result = await tasksServer.markTaskDone(
        planResult.requestId,
        taskId,
        "Second completion"
      );

      expect(result.status).toBe("already_done");
      expect(result.message).toBe("Task is already marked done.");
    });
  });

  describe("approveTaskCompletion", () => {
    test("should approve completed task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done first
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");

      const result = await tasksServer.approveTaskCompletion(
        planResult.requestId,
        taskId
      );

      expect(result.status).toBe("task_approved");
      expect(result.task?.approved).toBe(true);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error for non-done task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      const result = await tasksServer.approveTaskCompletion(
        planResult.requestId,
        taskId
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Task not done yet.");
    });

    test("should return already_approved for already approved task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done and approve
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");
      await tasksServer.approveTaskCompletion(planResult.requestId, taskId);

      // Try to approve again
      const result = await tasksServer.approveTaskCompletion(
        planResult.requestId,
        taskId
      );

      expect(result.status).toBe("already_approved");
      expect(result.message).toBe("Task already approved.");
    });
  });

  describe("approveRequestCompletion", () => {
    test("should approve request when all tasks are done and approved", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Complete the workflow
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");
      await tasksServer.approveTaskCompletion(planResult.requestId, taskId);

      const result = await tasksServer.approveRequestCompletion(
        planResult.requestId
      );

      expect(result.status).toBe("request_approved_complete");
      expect(result.message).toBe("Request is fully completed and approved.");
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error when not all tasks are done", async () => {
      const tasks = [
        { title: "Task 1", description: "First task" },
        { title: "Task 2", description: "Second task" }
      ];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      // Only complete first task
      await tasksServer.markTaskDone(
        planResult.requestId,
        planResult.tasks[0]!.id,
        "Completed"
      );
      await tasksServer.approveTaskCompletion(
        planResult.requestId,
        planResult.tasks[0]!.id
      );

      const result = await tasksServer.approveRequestCompletion(
        planResult.requestId
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Not all tasks are done.");
    });

    test("should return error when not all done tasks are approved", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done but don't approve
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");

      const result = await tasksServer.approveRequestCompletion(
        planResult.requestId
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Not all done tasks are approved.");
    });
  });

  describe("openTaskDetails", () => {
    test("should return task details for existing task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      const result = await tasksServer.openTaskDetails(taskId);

      expect(result.status).toBe("task_details");
      expect(result.task?.id).toBe(taskId);
      expect(result.task?.title).toBe("Task 1");
      expect(result.requestId).toBe(planResult.requestId);
      expect(result.originalRequest).toBe("Test request");
    });

    test("should return task_not_found for non-existent task", async () => {
      const result = await tasksServer.openTaskDetails("non-existent-task");

      expect(result.status).toBe("task_not_found");
      expect(result.message).toBe("No such task found");
    });
  });

  describe("listRequests", () => {
    test("should list all requests with summary information", async () => {
      const tasks1 = [{ title: "Task 1", description: "First task" }];
      const tasks2 = [{ title: "Task 2", description: "Second task" }];

      const plan1 = await tasksServer.requestPlanning("Request 1", tasks1);
      const plan2 = await tasksServer.requestPlanning("Request 2", tasks2);

      // Complete first request
      await tasksServer.markTaskDone(
        plan1.requestId,
        plan1.tasks[0]!.id,
        "Completed"
      );
      await tasksServer.approveTaskCompletion(
        plan1.requestId,
        plan1.tasks[0]!.id
      );

      const result = await tasksServer.listRequests();

      expect(result.status).toBe("requests_listed");
      expect(result.requests).toHaveLength(2);
      expect(result.requests?.[0]?.requestId).toBe(plan1.requestId);
      expect(result.requests?.[0]?.completedTasks).toBe(1);
      expect(result.requests?.[0]?.approvedTasks).toBe(1);
      expect(result.requests?.[1]?.requestId).toBe(plan2.requestId);
      expect(result.requests?.[1]?.completedTasks).toBe(0);
      expect(result.requests?.[1]?.approvedTasks).toBe(0);
    });
  });

  describe("addTasksToRequest", () => {
    test("should add new tasks to existing request", async () => {
      const initialTasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        initialTasks
      );

      const newTasks = [
        { title: "Task 2", description: "Second task" },
        { title: "Task 3", description: "Third task" }
      ];

      const result = await tasksServer.addTasksToRequest(
        planResult.requestId,
        newTasks
      );

      expect(result.status).toBe("tasks_added");
      expect(result.newTasks).toHaveLength(2);
      expect(result.newTasks?.[0]?.title).toBe("Task 2");
      expect(result.newTasks?.[1]?.title).toBe("Task 3");
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error for non-existent request", async () => {
      const newTasks = [{ title: "Task 1", description: "First task" }];

      const result = await tasksServer.addTasksToRequest(
        "non-existent-req",
        newTasks
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Request not found");
    });

    test("should return error for completed request", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      // Complete the request
      await tasksServer.markTaskDone(
        planResult.requestId,
        planResult.tasks[0]!.id,
        "Completed"
      );
      await tasksServer.approveTaskCompletion(
        planResult.requestId,
        planResult.tasks[0]!.id
      );
      await tasksServer.approveRequestCompletion(planResult.requestId);

      const newTasks = [{ title: "Task 2", description: "Second task" }];
      const result = await tasksServer.addTasksToRequest(
        planResult.requestId,
        newTasks
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Cannot add tasks to completed request");
    });
  });

  describe("updateTask", () => {
    test("should update task title and description", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      const updates = {
        title: "Updated Task 1",
        description: "Updated description"
      };

      const result = await tasksServer.updateTask(
        planResult.requestId,
        taskId,
        updates
      );

      expect(result.status).toBe("task_updated");
      expect(result.task?.title).toBe("Updated Task 1");
      expect(result.task?.description).toBe("Updated description");
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error for completed task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");

      const updates = { title: "Updated Task 1" };
      const result = await tasksServer.updateTask(
        planResult.requestId,
        taskId,
        updates
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Cannot update completed task");
    });
  });

  describe("deleteTask", () => {
    test("should delete task from request", async () => {
      const tasks = [
        { title: "Task 1", description: "First task" },
        { title: "Task 2", description: "Second task" }
      ];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      const result = await tasksServer.deleteTask(planResult.requestId, taskId);

      expect(result.status).toBe("task_deleted");
      expect(result.message).toContain(`Task ${taskId} has been deleted`);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    test("should return error for completed task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );
      const taskId = planResult.tasks[0]!.id;

      // Mark task as done
      await tasksServer.markTaskDone(planResult.requestId, taskId, "Completed");

      const result = await tasksServer.deleteTask(planResult.requestId, taskId);

      expect(result.status).toBe("error");
      expect(result.message).toBe("Cannot delete completed task");
    });

    test("should return error for non-existent task", async () => {
      const tasks = [{ title: "Task 1", description: "First task" }];
      const planResult = await tasksServer.requestPlanning(
        "Test request",
        tasks
      );

      const result = await tasksServer.deleteTask(
        planResult.requestId,
        "non-existent-task"
      );

      expect(result.status).toBe("error");
      expect(result.message).toBe("Task not found");
    });
  });

  describe("error handling", () => {
    test("should handle file system errors gracefully", async () => {
      const error = new Error("Permission denied");
      mockWriteFile.mockRejectedValue(error);

      const tasks = [{ title: "Task 1", description: "First task" }];

      await expect(
        tasksServer.requestPlanning("Test request", tasks)
      ).rejects.toThrow("Permission denied");
    });

    test("should handle EROFS error specifically", async () => {
      const error = new Error("EROFS: read-only file system");
      mockWriteFile.mockRejectedValue(error);

      const tasks = [{ title: "Task 1", description: "First task" }];

      await expect(
        tasksServer.requestPlanning("Test request", tasks)
      ).rejects.toThrow("EROFS: read-only file system");
    });
  });
});
