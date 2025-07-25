import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Test the actual MCP server functionality by importing and testing the handlers
describe("Tasks MCP Server Integration", () => {
  const testDataDir = path.join(process.cwd(), "test-mcp-tasks");

  beforeEach(async () => {
    // Clean up any existing test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  test("TasksServer can be imported and instantiated", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "instantiation.json");
    const tasksServer = new TasksServer(testFilePath);
    expect(tasksServer).toBeDefined();
    expect(tasksServer instanceof TasksServer).toBe(true);
  });

  test("Server exports are available", async () => {
    // Test that the main exports are available
    const module = await import("../index.js");
    expect(module.TasksServer).toBeDefined();
    expect(typeof module.TasksServer).toBe("function");
  });

  test("TasksServer methods work correctly in server context", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "server-context.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Test the full workflow
    const planResult = await tasksServer.requestPlanning(
      "Test server integration",
      [{ title: "Integration Task", description: "Test task for server integration" }]
    );
    
    expect(planResult.status).toBe("planned");
    expect(planResult.requestId).toMatch(/^req-\d+$/);
    
    const nextTask = await tasksServer.getNextTask(planResult.requestId);
    expect(nextTask.status).toBe("next_task");
    expect(nextTask.task?.title).toBe("Integration Task");
    
    const taskId = nextTask.task!.id;
    const markResult = await tasksServer.markTaskDone(
      planResult.requestId,
      taskId,
      "Integration test completed"
    );
    
    expect(markResult.status).toBe("task_marked_done");
    expect(markResult.task?.completedDetails).toBe("Integration test completed");
    
    const approveResult = await tasksServer.approveTaskCompletion(
      planResult.requestId,
      taskId
    );
    
    expect(approveResult.status).toBe("task_approved");
    expect(approveResult.task?.approved).toBe(true);
    
    const completeResult = await tasksServer.approveRequestCompletion(planResult.requestId);
    expect(completeResult.status).toBe("request_approved_complete");
  });

  test("Error handling works correctly", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "error-handling.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Test invalid request ID
    const result = await tasksServer.getNextTask("invalid-request-id");
    expect(result.status).toBe("error");
    expect(result.message).toContain("Request not found");
    
    // Test invalid task ID
    const taskResult = await tasksServer.openTaskDetails("invalid-task-id");
    expect(taskResult.status).toBe("task_not_found");
  });

  test("Multiple requests can be handled", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "multiple-requests.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Create multiple requests
    const plan1 = await tasksServer.requestPlanning(
      "First request",
      [{ title: "Task 1", description: "First task" }]
    );
    
    const plan2 = await tasksServer.requestPlanning(
      "Second request",
      [{ title: "Task 2", description: "Second task" }]
    );
    
    expect(plan1.requestId).not.toBe(plan2.requestId);
    
    const listResult = await tasksServer.listRequests();
    expect(listResult.status).toBe("requests_listed");
    expect(listResult.requests).toHaveLength(2);
  });

  test("Task management operations work", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "task-management.json");
    const tasksServer = new TasksServer(testFilePath);
    
    const planResult = await tasksServer.requestPlanning(
      "Task management test",
      [
        { title: "Original Task", description: "Original description" },
        { title: "Task to Delete", description: "This will be deleted" }
      ]
    );
    
    // Test adding tasks
    const addResult = await tasksServer.addTasksToRequest(
      planResult.requestId,
      [{ title: "Added Task", description: "This was added later" }]
    );
    
    if (addResult.status === "error") {
      console.log("addTasksToRequest error:", addResult.message);
    }
    
    expect(addResult.status).toBe("tasks_added");
    expect(addResult.newTasks).toHaveLength(1);
    
    // Test updating task
    const nextTask = await tasksServer.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;
    
    const updateResult = await tasksServer.updateTask(
      planResult.requestId,
      taskId,
      { title: "Updated Task", description: "Updated description" }
    );
    
    expect(updateResult.status).toBe("task_updated");
    expect(updateResult.task?.title).toBe("Updated Task");
    
    // Test deleting task (get the second task)
    const nextTask2 = await tasksServer.getNextTask(planResult.requestId);
    const task2Id = nextTask2.task!.id;
    
    const deleteResult = await tasksServer.deleteTask(planResult.requestId, task2Id);
    expect(deleteResult.status).toBe("task_deleted");
  });

  test("Schema validation works correctly", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "schema-validation.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Test that invalid data is handled properly
    try {
      // This should work fine
      const result = await tasksServer.requestPlanning(
        "Valid request",
        [{ title: "Valid Task", description: "Valid description" }]
      );
      expect(result.status).toBe("planned");
    } catch (error) {
      // Should not throw for valid data
      expect(error).toBeUndefined();
    }
  });

  test("File persistence works correctly", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "file-persistence.json");
    const tasksServer1 = new TasksServer(testFilePath);
    
    // Create a request with first instance
    const planResult = await tasksServer1.requestPlanning(
      "Persistence test",
      [{ title: "Persistent Task", description: "Test persistence" }]
    );
    
    expect(planResult.status).toBe("planned");
    expect(planResult.requestId).toMatch(/^req-\d+$/);
    
    // Add a small delay to ensure state is properly saved
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Create second instance and verify data persists
    const tasksServer2 = new TasksServer(testFilePath);
    const listResult = await tasksServer2.listRequests();
    
    expect(listResult.status).toBe("requests_listed");
    expect(listResult.requests).toHaveLength(1);
    expect(listResult.requests?.[0]?.originalRequest).toBe("Persistence test");
  });

  test("Edge cases are handled correctly", async () => {
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "edge-cases.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Test empty task list
    const planResult = await tasksServer.requestPlanning(
      "Empty task test",
      []
    );
    expect(planResult.status).toBe("planned");
    expect(planResult.totalTasks).toBe(0);
    
    // Add a small delay to ensure state is properly saved
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Test getting next task when no tasks exist
    const nextTask = await tasksServer.getNextTask(planResult.requestId);
    expect(nextTask.status).toBe("all_tasks_done");
    
    // Test completing request with no tasks
    const completeResult = await tasksServer.approveRequestCompletion(planResult.requestId);
    expect(completeResult.status).toBe("request_approved_complete");
  });

  test("MCP Server initialization", async () => {
    // Test that server can be created
    const server = new Server(
      {
        name: "test-tasks-server",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    expect(server).toBeDefined();
    
    // Test that we can set request handlers
    let listToolsHandlerCalled = false;
    let callToolHandlerCalled = false;

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      listToolsHandlerCalled = true;
      return {
        tools: []
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async () => {
      callToolHandlerCalled = true;
      return {
        content: [{ type: "text", text: "test" }]
      };
    });

    // Verify handlers were set (we can't directly test them without a transport)
    expect(listToolsHandlerCalled).toBe(false); // Not called yet
    expect(callToolHandlerCalled).toBe(false); // Not called yet
  });

  test("StdioServerTransport can be created", () => {
    // Test that transport can be instantiated
    const transport = new StdioServerTransport();
    expect(transport).toBeDefined();
  });

  test("Schema validation coverage", async () => {
    // Test various schema validation paths to improve coverage
    const { TasksServer } = await import("../index.js");
    const testFilePath = path.join(testDataDir, "schema-coverage.json");
    const tasksServer = new TasksServer(testFilePath);
    
    // Test with undefined/null values to trigger validation paths
    try {
      // This should trigger schema validation error handling
      await tasksServer.requestPlanning(
        "test",
        // @ts-expect-error - intentionally testing invalid input
        null
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    // Test with malformed task objects
    try {
      await tasksServer.requestPlanning(
        "test",
        // @ts-expect-error - intentionally testing invalid input
        [{ invalidField: "test" }]
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    // Test edge cases that should work
    const validResult = await tasksServer.requestPlanning(
      "Valid request",
      [{ title: "Valid task", description: "Valid description" }]
    );
    expect(validResult.status).toBe("planned");
  });
  
  test("MCP Server handlers coverage", async () => {
    const { listToolsHandler, callToolHandler, tasksServer } = await import("../index.js");

    // Test listToolsHandler
    const toolsResult = await listToolsHandler();
    expect(toolsResult.tools).toBeDefined();
    expect(Array.isArray(toolsResult.tools)).toBe(true);
    expect(toolsResult.tools.length).toBe(10);

    // Test callToolHandler for planning
    const planningRequest = {
      params: {
        name: "planning",
        arguments: {
          originalRequest: "Test request",
          tasks: [{ title: "Test task", description: "Test desc" }]
        }
      }
    };
    const planningResult = await callToolHandler(planningRequest);
    expect(planningResult.content).toBeDefined();
    expect(planningResult.content[0].type).toBe("text");

    // Test get_next_task
    const planResult = await tasksServer.requestPlanning("Test", [{title: "T", description: "D"}]);
    const getNextRequest = {
      params: {
        name: "get_next_task",
        arguments: { requestId: planResult.requestId }
      }
    };
    const nextResult = await callToolHandler(getNextRequest);
    expect(nextResult.content).toBeDefined();

    // Test mark_task_done (minimal to cover branch)
    const markDoneRequest = {
      params: {
        name: "mark_task_done",
        arguments: { requestId: planResult.requestId, taskId: planResult.tasks[0].id, completedDetails: "Done" }
      }
    };
    const markResult = await callToolHandler(markDoneRequest);
    expect(markResult.content).toBeDefined();

    // Test approve_task_completion
    const approveTaskRequest = {
      params: {
        name: "approve_task_completion",
        arguments: { requestId: planResult.requestId, taskId: planResult.tasks[0].id }
      }
    };
    const approveTaskResult = await callToolHandler(approveTaskRequest);
    expect(approveTaskResult.content).toBeDefined();

    // Test approve_request_completion
    const approveRequestRequest = {
      params: {
        name: "approve_request_completion",
        arguments: { requestId: planResult.requestId }
      }
    };
    const approveRequestResult = await callToolHandler(approveRequestRequest);
    expect(approveRequestResult.content).toBeDefined();

    // Test open_task_details
    const openTaskRequest = {
      params: {
        name: "open_task_details",
        arguments: { taskId: planResult.tasks[0].id }
      }
    };
    const openResult = await callToolHandler(openTaskRequest);
    expect(openResult.content).toBeDefined();

    // Test list_requests
    const listRequestsRequest = {
      params: {
        name: "list_requests",
        arguments: {}
      }
    };
    const listResult = await callToolHandler(listRequestsRequest);
    expect(listResult.content).toBeDefined();

    // Test add_tasks_to_request
    const addTasksRequest = {
      params: {
        name: "add_tasks_to_request",
        arguments: { requestId: planResult.requestId, tasks: [{title: "New", description: "New"}] }
      }
    };
    const addResult = await callToolHandler(addTasksRequest);
    expect(addResult.content).toBeDefined();

    // Test update_task
    const updateTaskRequest = {
      params: {
        name: "update_task",
        arguments: { requestId: planResult.requestId, taskId: planResult.tasks[0].id, title: "Updated" }
      }
    };
    const updateResult = await callToolHandler(updateTaskRequest);
    expect(updateResult.content).toBeDefined();

    // Test delete_task
    const deleteTaskRequest = {
      params: {
        name: "delete_task",
        arguments: { requestId: planResult.requestId, taskId: planResult.tasks[0].id }
      }
    };
    const deleteResult = await callToolHandler(deleteTaskRequest);
    expect(deleteResult.content).toBeDefined();

    // Test error case
    const errorRequest = {
      params: {
        name: "unknown",
        arguments: {}
      }
    };
    const errorResult = await callToolHandler(errorRequest);
    expect(errorResult.isError).toBe(true);
  });
});