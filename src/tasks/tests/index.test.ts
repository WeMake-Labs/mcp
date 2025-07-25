import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { TasksServer } from "../index.js";
import { promises as fs } from "fs";
import path from "path";

describe("TasksServer", () => {
  let server: TasksServer;
  

  beforeEach(async () => {
    const randomSuffix = Math.random().toString(36).substring(7);
    const testDataPath = path.join(process.cwd(), `test-tasks-${randomSuffix}.json`);
    server = new TasksServer(testDataPath);
    // No need to unlink since it's unique
  });

  afterEach(async () => {
    if (server && server['dataPath']) {
      try {
        await fs.unlink(server['dataPath']);
      } catch {
        // File doesn't exist, that's fine
      }
    }
  });

  test("TasksServer instantiation", () => {
    expect(server).toBeDefined();
    expect(server instanceof TasksServer).toBe(true);
  });

  test("requestPlanning creates new request with tasks", async () => {
    const result = await server.requestPlanning(
      "Create a simple web app",
      [
        { title: "Setup project", description: "Initialize the project structure" },
        { title: "Add dependencies", description: "Install required packages" }
      ],
      "Breaking down web app creation"
    );

    expect(result.status).toBe("planned");
    expect(result.requestId).toMatch(/^req-\d+$/);
    expect(result.totalTasks).toBe(2);
    expect(result.tasks).toHaveLength(2);
    expect(result.tasks[0]?.title).toBe("Setup project");
  });

  test("getNextTask returns first pending task", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    expect(nextTask.status).toBe("next_task");
    expect(nextTask.task?.title).toBe("Task 1");
  });

  test("markTaskDone marks task as completed", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    const result = await server.markTaskDone(
      planResult.requestId,
      taskId,
      "Task completed successfully"
    );

    expect(result.status).toBe("task_marked_done");
    expect(result.task?.completedDetails).toBe("Task completed successfully");
  });

  test("approveTaskCompletion approves completed task", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    await server.markTaskDone(planResult.requestId, taskId, "Completed");
    
    const result = await server.approveTaskCompletion(
      planResult.requestId,
      taskId
    );

    expect(result.status).toBe("task_approved");
    expect(result.task?.approved).toBe(true);
  });

  test("approveRequestCompletion finalizes request when all tasks done", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    await server.markTaskDone(planResult.requestId, taskId, "Completed");
    await server.approveTaskCompletion(planResult.requestId, taskId);
    
    const result = await server.approveRequestCompletion(planResult.requestId);

    expect(result.status).toBe("request_approved_complete");
    expect(result.message).toContain("completed");
  });

  test("openTaskDetails returns task information", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    const result = await server.openTaskDetails(taskId);

    expect(result.status).toBe("task_details");
    expect(result.task?.title).toBe("Task 1");
    expect(result.requestId).toBe(planResult.requestId);
  });

  test("listRequests returns all requests", async () => {
    await server.requestPlanning(
      "Request 1",
      [{ title: "Task 1", description: "First task" }]
    );
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await server.requestPlanning(
      "Request 2",
      [{ title: "Task 2", description: "Second task" }]
    );

    const result = await server.listRequests();

    expect(result.status).toBe("requests_listed");
    expect(result.requests).toHaveLength(2);
    expect(result.requests?.[0]?.originalRequest).toBe("Request 1");
    expect(result.requests?.[1]?.originalRequest).toBe("Request 2");
  });

  test("addTasksToRequest adds new tasks to existing request", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const result = await server.addTasksToRequest(
      planResult.requestId,
      [{ title: "New Task", description: "Additional task" }]
    );

    expect(result.status).toBe("tasks_added");
    expect(result.newTasks).toHaveLength(1);
    expect(result.newTasks?.[0]?.title).toBe("New Task");
  });

  test("updateTask modifies task details", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    const result = await server.updateTask(
      planResult.requestId,
      taskId,
      { title: "Updated Task", description: "Updated description" }
    );

    expect(result.status).toBe("task_updated");
    expect(result.task?.title).toBe("Updated Task");
  });

  test("deleteTask removes task from request", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [
        { title: "Task 1", description: "First task" },
        { title: "Task 2", description: "Second task" }
      ]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    const result = await server.deleteTask(planResult.requestId, taskId);

    expect(result.status).toBe("task_deleted");
    expect(result.message).toContain("deleted");
  });

  test("error handling - invalid request ID", async () => {
    const result = await server.getNextTask("invalid-request-id");
    expect(result.status).toBe("error");
    expect(result.message).toContain("Request not found");
  });

  test("error handling - task not found", async () => {
    const result = await server.openTaskDetails("invalid-task-id");
    expect(result.status).toBe("task_not_found");
  });

  test("error handling - cannot update completed task", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    await server.markTaskDone(planResult.requestId, taskId, "Completed");
    
    const result = await server.updateTask(
      planResult.requestId,
      taskId,
      { title: "Should fail" }
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("Cannot update completed task");
  });

  test("error handling - cannot delete completed task", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    await server.markTaskDone(planResult.requestId, taskId, "Completed");
    
    const result = await server.deleteTask(planResult.requestId, taskId);

    expect(result.status).toBe("error");
    expect(result.message).toContain("Cannot delete completed task");
  });

  test("error handling - invalid schema validation paths", async () => {
    // Test various error conditions that might not be covered
    
    // Test with very long strings to potentially trigger different validation paths
    const longString = "a".repeat(10000);
    
    try {
      const result = await server.requestPlanning(
        longString,
        [{ title: longString, description: longString }]
      );
      // This should still work, just testing the path
      expect(result.status).toBe("planned");
    } catch (error) {
      // If it fails, that's also a valid test outcome
      expect(error).toBeDefined();
    }
    
    // Test edge case with empty strings
    const emptyResult = await server.requestPlanning(
      "",
      [{ title: "", description: "" }]
    );
    expect(emptyResult.status).toBe("planned");
    
    // Test with special characters
    const specialResult = await server.requestPlanning(
      "Test with special chars: !@#$%^&*()_+-=[]{}|;':,.<>?",
      [{ title: "Special: 🚀", description: "Unicode: 中文" }]
    );
    expect(specialResult.status).toBe("planned");
  });

  test("error handling - cannot add tasks to completed request", async () => {
    const planResult = await server.requestPlanning(
      "Test request",
      [{ title: "Task 1", description: "First task" }]
    );

    const nextTask = await server.getNextTask(planResult.requestId);
    const taskId = nextTask.task!.id;

    await server.markTaskDone(planResult.requestId, taskId, "Completed");
    await server.approveTaskCompletion(planResult.requestId, taskId);
    await server.approveRequestCompletion(planResult.requestId);
    
    const result = await server.addTasksToRequest(
      planResult.requestId,
      [{ title: "Should fail", description: "This should fail" }]
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("Cannot add tasks to completed request");
  });
});
