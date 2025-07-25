import { TasksServer } from "../index";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { describe, it, expect, beforeEach, afterEach } from "bun:test";

describe("TasksServer", () => {
  let server: TasksServer;
  let tempPath: string;

  beforeEach(async () => {
    tempPath = path.join(os.tmpdir(), `tasks-${Date.now()}.json`);
    server = new TasksServer(tempPath);
  });

  afterEach(async () => {
    await fs.unlink(tempPath).catch(() => {});
  });

  it("should plan a new request correctly", async () => {
    const result = await server.requestPlanning("Test request", [
      { title: "Task1", description: "Desc1" }
    ]);
    expect(result.status).toBe("planned");
    expect(result.requestId).toMatch(/^req-\d+$/);
    expect(result.totalTasks).toBe(1);
  });

  it("should get next task correctly", async () => {
    const planResult = await server.requestPlanning("Test", [
      { title: "T1", description: "D1" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    expect(next.status).toBe("next_task");
    expect(next.task.title).toBe("T1");
  });

  it("should mark task done correctly", async () => {
    const planResult = await server.requestPlanning("Test2", [
      { title: "T2", description: "D2" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    const markResult = await server.markTaskDone(
      planResult.requestId,
      next.task.id,
      "Completed details"
    );
    expect(markResult.status).toBe("task_marked_done");
    expect(markResult.task.completedDetails).toBe("Completed details");
  });

  it("should approve task completion correctly", async () => {
    const planResult = await server.requestPlanning("Test3", [
      { title: "T3", description: "D3" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    await server.markTaskDone(planResult.requestId, next.task.id);
    const approveResult = await server.approveTaskCompletion(
      planResult.requestId,
      next.task.id
    );
    expect(approveResult.status).toBe("task_approved");
  });

  it("should add tasks to request correctly", async () => {
    const planResult = await server.requestPlanning("Test4", [
      { title: "T4", description: "D4" }
    ]);
    const addResult = await server.addTasksToRequest(planResult.requestId, [
      { title: "T5", description: "D5" }
    ]);
    expect(addResult.status).toBe("tasks_added");
    expect(addResult.newTasks).toHaveLength(1);
  });

  it("should update task correctly", async () => {
    const planResult = await server.requestPlanning("Test5", [
      { title: "OldTitle", description: "OldDesc" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    const updateResult = await server.updateTask(
      planResult.requestId,
      next.task.id,
      { title: "NewTitle", description: "NewDesc" }
    );
    expect(updateResult.status).toBe("task_updated");
    expect(updateResult.task.title).toBe("NewTitle");
    expect(updateResult.task.description).toBe("NewDesc");
  });

  it("should approve request completion when all done and approved", async () => {
    const planResult = await server.requestPlanning("Test8", [
      { title: "T8", description: "D8" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    await server.markTaskDone(planResult.requestId, next.task.id);
    await server.approveTaskCompletion(planResult.requestId, next.task.id);
    const completeResult = await server.approveRequestCompletion(
      planResult.requestId
    );
    expect(completeResult.status).toBe("request_approved_complete");
  });

  it("should delete task correctly", async () => {
    const planResult = await server.requestPlanning("Test6", [
      { title: "T6", description: "D6" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    const deleteResult = await server.deleteTask(
      planResult.requestId,
      next.task.id
    );
    expect(deleteResult.status).toBe("task_deleted");
  });

  it("should handle marking already done task", async () => {
    const planResult = await server.requestPlanning("Test7", [
      { title: "T7", description: "D7" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    await server.markTaskDone(planResult.requestId, next.task.id);
    const markAgain = await server.markTaskDone(
      planResult.requestId,
      next.task.id
    );
    expect(markAgain.status).toBe("already_done");
  });

  it("should list requests correctly", async () => {
    await server.requestPlanning("Test9", [{ title: "T9", description: "D9" }]);
    const list = await server.listRequests();
    expect(list.status).toBe("requests_listed");
    expect(list.requests.length).toBeGreaterThan(0);
  });

  it("should not update completed task", async () => {
    const planResult = await server.requestPlanning("TestUpdateError", [
      { title: "ToUpdate", description: "Desc" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    await server.markTaskDone(planResult.requestId, next.task.id);
    const updateResult = await server.updateTask(
      planResult.requestId,
      next.task.id,
      { title: "NewTitle" }
    );
    expect(updateResult.status).toBe("error");
    expect(updateResult.message).toBe("Cannot update completed task");
  });

  it("should not delete completed task", async () => {
    const planResult = await server.requestPlanning("TestDeleteError", [
      { title: "ToDelete", description: "Desc" }
    ]);
    const next = await server.getNextTask(planResult.requestId);
    await server.markTaskDone(planResult.requestId, next.task.id);
    const deleteResult = await server.deleteTask(
      planResult.requestId,
      next.task.id
    );
    expect(deleteResult.status).toBe("error");
    expect(deleteResult.message).toBe("Cannot delete completed task");
  });

  // Add more tests for error cases, like invalid ids, etc.
});
