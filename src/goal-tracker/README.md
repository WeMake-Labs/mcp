# Goal Tracker MCP Server

A simple but effective tool for tracking and completing goals. This server helps models maintain goal-oriented workflows through basic goal creation, status reporting, and completion marking.

## Architecture

This server follows the **MCP Code Mode** architecture, separating concerns into three layers:

1.  **Core** (`src/core`): Pure business logic and domain types.
2.  **Code Mode** (`src/codemode`): Programmable TypeScript API for LLMs and other consumers.
3.  **MCP** (`src/mcp`): Protocol adapter exposing the functionality as MCP tools.

## Code Mode API

The `GoalTracker` class provides a strongly-typed API for managing goals programmatically.

```typescript
import { GoalTracker } from "@wemake.cx/goal-tracker";

const tracker = new GoalTracker();

// Add goals
tracker.addGoal("Implement authentication");
tracker.addGoals(["Setup database", "Create API endpoints"]);

// Check status
const goals = tracker.getGoals();
console.log(goals);
// Output:
// [
//   { goal: "Implement authentication", completed: false },
//   { goal: "Setup database", completed: false },
//   { goal: "Create API endpoints", completed: false }
// ]

// Complete a goal
tracker.completeGoal("Setup database");
```

## MCP Tool

The server exposes a single tool `goalTracker` for interacting with the tracker via the Model Context Protocol.

### `goalTracker`

Adds goals, marks completion, and reports status.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": ["add", "complete", "status"],
      "description": "The action to perform"
    },
    "goal": {
      "type": "string",
      "minLength": 1,
      "description": "The goal description (required for 'add' and 'complete')"
    }
  },
  "required": ["action"]
}
```

**Examples:**

1.  **Add a goal:**
    ```json
    { "action": "add", "goal": "Fix bugs" }
    ```

2.  **Complete a goal:**
    ```json
    { "action": "complete", "goal": "Fix bugs" }
    ```

3.  **Get status:**
    ```json
    { "action": "status" }
    ```

## Development

### Build

```bash
bun run build
```

### Test

```bash
bun test
```

### Start Server

```bash
bun run start
```
