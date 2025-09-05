import fs from "node:fs/promises";
import path from "node:path";

export type TraceEvent = {
  ts: number; // epoch millis
  type: string; // e.g., 'toolCall' | 'toolResult'
  stepId: string;
  toolName: string;
  input: unknown;
  output: unknown;
  durationMs: number; // 0 for instantaneous events
};

export class Trace {
  private readonly events: TraceEvent[] = [];

  record(event: TraceEvent): void {
    this.events.push(event);
  }

  toJSON(): TraceEvent[] {
    return [...this.events];
  }

  static fromJSON(json: unknown): Trace {
    const trace = new Trace();
    const eventsArray: TraceEvent[] = Array.isArray(json)
      ? (json as TraceEvent[])
      : ((json as { events?: TraceEvent[] })?.events ?? []);

    for (const ev of eventsArray) {
      // Minimal validation and normalization
      const evUnknown = ev as unknown as Record<string, unknown>;
      const normalized: TraceEvent = {
        ts: typeof ev.ts === "number" ? ev.ts : Date.now(),
        type: String(evUnknown.type ?? "event"),
        stepId: String(evUnknown.stepId ?? ""),
        toolName: String(evUnknown.toolName ?? ""),
        input: evUnknown.input,
        output: evUnknown.output,
        durationMs: typeof ev.durationMs === "number" ? ev.durationMs : 0
      };
      trace.record(normalized);
    }

    return trace;
  }

  async persist(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const json = JSON.stringify(this.toJSON(), null, 2);
    await fs.writeFile(filePath, json, "utf8");
  }
}
