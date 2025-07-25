import { expect, test } from "vitest";
import { TasksServer } from "../index";

test("TasksServer instantiation", () => {
  const server = new TasksServer();
  expect(server).toBeDefined();
  expect(server instanceof TasksServer).toBe(true);
});
