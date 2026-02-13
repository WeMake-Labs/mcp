import { describe, expect, it } from "bun:test";
import { FocusGroupLogic } from "./logic.js";
import { FocusGroupData, FocusGroupPersona, Feedback } from "./types.js";

describe("FocusGroupLogic Validation", () => {
  const logic = new FocusGroupLogic();

  const validPersona: FocusGroupPersona = {
    id: "p1",
    name: "Persona 1",
    userType: "novice",
    usageScenario: "testing",
    expectations: [],
    priorities: [],
    constraints: [],
    communication: { style: "direct", tone: "neutral" }
  };

  const validData: FocusGroupData = {
    targetServer: "test-server",
    personas: [validPersona],
    feedback: [],
    stage: "introduction",
    activePersonaId: "p1",
    sessionId: "session-1",
    iteration: 0,
    nextFeedbackNeeded: true
  };

  it("should validate correct data", () => {
    expect(() => logic.validateFocusGroupData(validData)).not.toThrow();
  });

  it("should throw on duplicate persona IDs", () => {
    const data = {
      ...validData,
      personas: [validPersona, { ...validPersona }]
    };
    expect(() => logic.validateFocusGroupData(data)).toThrow("duplicate id");
  });

  it("should throw on missing persona fields", () => {
    const invalidPersona = { ...validPersona } as Partial<FocusGroupPersona>;
    delete invalidPersona.name;
    const data = { ...validData, personas: [invalidPersona as FocusGroupPersona] };
    expect(() => logic.validateFocusGroupData(data)).toThrow("missing or invalid 'name'");
  });

  it("should throw on invalid feedback type", () => {
    const feedback: Feedback = {
      personaId: "p1",
      content: "test",
      type: "invalid_type" as "praise",
      severity: 0.5
    };
    const data = { ...validData, feedback: [feedback] };
    expect(() => logic.validateFocusGroupData(data)).toThrow("Invalid feedback type");
  });

  it("should throw on feedback referencing unknown persona", () => {
    const feedback: Feedback = {
      personaId: "unknown_persona",
      content: "test",
      type: "praise",
      severity: 0.5
    };
    const data = { ...validData, feedback: [feedback] };
    expect(() => logic.validateFocusGroupData(data)).toThrow("unknown personaId");
  });

  it("should throw on invalid severity range", () => {
    const feedback: Feedback = {
      personaId: "p1",
      content: "test",
      type: "praise",
      severity: 1.5
    };
    const data = { ...validData, feedback: [feedback] };
    expect(() => logic.validateFocusGroupData(data)).toThrow("Invalid feedback severity");
  });

  it("should throw on invalid stage", () => {
    const data = { ...validData, stage: "invalid_stage" as "introduction" };
    expect(() => logic.validateFocusGroupData(data)).toThrow("Invalid stage");
  });

  it("should throw on unknown activePersonaId", () => {
    const data = { ...validData, activePersonaId: "unknown" };
    expect(() => logic.validateFocusGroupData(data)).toThrow("Invalid activePersonaId");
  });
});
