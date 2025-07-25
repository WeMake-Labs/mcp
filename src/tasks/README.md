# Tasks MCP Server

Model Context Protocol server for Task Management. This allows Trae IDE to
manage and execute tasks in a queue-based system.

## Configuration

### Trae IDE

Add this MCP via "Add Manually":

#### bunx

```json
{
  "mcpServers": {
    "Tasks": {
      "command": "bunx",
      "args": ["-y", "@wemake-ai/mcpserver-tasks"],
      "env": {
        "TASKS_FILE_PATH": "~/project/.wemake/tasks.json"
      }
    }
  }
}
```

## Available Operations

Tasks supports two main phases of operation:

### Planning Phase

- Accepts a task list (array of strings) from the user
- Stores tasks internally as a queue
- Returns an execution plan (task overview, task ID, current queue status)

### Execution Phase

- Returns the next task from the queue when requested
- Provides feedback mechanism for task completion
- Removes completed tasks from the queue
- Prepares the next task for execution

### Parameters

- `action`: "plan" | "execute" | "complete"
- `tasks`: Array of task strings (required for "plan" action)
- `taskId`: Task identifier (required for "complete" action)
- `getNext`: Boolean flag to request next task (for "execute" action)
