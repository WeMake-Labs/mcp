# Deep Thinking MCP Server

An MCP server implementation that provides a tool for dynamic and reflective problem-solving through a structured
thinking process.

## Features

- Break down complex problems into manageable steps
- Revise and refine thoughts as understanding deepens
- Branch into alternative paths of reasoning
- Adjust the total number of thoughts dynamically
- Generate and verify solution hypotheses

## Tool

### deep-thinking

Facilitates a detailed, step-by-step thinking process for problem-solving and analysis.

**Inputs:**

- `thought` (string): The current thinking step
- `nextThoughtNeeded` (boolean): Whether another thought step is needed
- `thoughtNumber` (integer): Current thought number
- `totalThoughts` (integer): Estimated total thoughts needed
- `isRevision` (boolean, optional): Whether this revises previous thinking
- `revisesThought` (integer, optional): Which thought is being reconsidered
- `branchFromThought` (integer, optional): Branching point thought number
- `branchId` (string, optional): Branch identifier
- `needsMoreThoughts` (boolean, optional): If more thoughts are needed

## Usage

The Deep Thinking tool is designed for:

- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

## Configuration

### Trae IDE

Add this MCP via "Add Manually":

#### bunx

```json
{
  "mcpServers": {
    "Deep Thinking": {
      "command": "bunx",
      "args": ["-y", "@wemake-ai/mcpserver-deep-thinking@latest"],
      "env": {
        "DISABLE_THOUGHT_LOGGING": "false"
      }
    }
  }
}
```

To disable logging of thought information set env var: `DISABLE_THOUGHT_LOGGING` to `true`.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software,
subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project
repository.
