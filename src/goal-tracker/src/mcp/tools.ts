export const GOAL_TRACKER_TOOL = {
  name: "goalTracker",
  description: "Adds goals, marks completion, and reports status",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      action: { type: "string", enum: ["add", "complete", "status"] },
      goal: { type: "string", minLength: 1 }
    },
    required: ["action"]
  }
};
