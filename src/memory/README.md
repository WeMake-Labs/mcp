# Knowledge Graph Memory Server

A robust implementation of persistent memory using a local knowledge graph, now featuring a **Code Mode API** for
programmatic access. This server allows AI agents to store and retrieve structured information about users and concepts
across sessions.

## Architecture

This server follows the **Code Mode Architecture** (3-layer design):

1. **Core (`src/core/`)**: Pure business logic and domain models (`KnowledgeGraphManager`).
2. **Code Mode (`src/codemode/`)**: Strictly-typed TypeScript API (`MemoryGraph`) for direct programmatic usage.
3. **MCP Adapter (`src/mcp/`)**: Protocol adapter exposing the API as MCP tools.

## Core Concepts

### Entities

Entities are the primary nodes in the knowledge graph. Each entity has:

- A unique name (identifier)
- An entity type (e.g., "person", "organization", "event")
- A list of observations

### Relations

Relations define directed connections between entities. They are always stored in active voice.

### Observations

Discrete pieces of information attached to specific entities.

## Usage

### 1. As an MCP Server (Standard)

Configure your MCP client (e.g., Claude Desktop, Trae) to use this server:

```json
{
  "mcpServers": {
    "Memory": {
      "command": "bunx",
      "args": ["@wemake.cx/memory@latest"],
      "env": {
        "MEMORY_FILE_PATH": "/path/to/custom/memory.jsonl"
      }
    }
  }
}
```

**Tools Available:**

- `create_entities`: Create new entities.
- `create_relations`: Create relationships between entities.
- `add_observations`: Add facts to existing entities.
- `delete_entities`: Remove entities and their relations.
- `delete_observations`: Remove specific facts.
- `delete_relations`: Remove specific relationships.
- `read_graph`: Read the entire graph.
- `search_nodes`: Search for entities/relations by query.
- `open_nodes`: Retrieve specific entities by name.

### 2. Programmatic API (Code Mode)

You can import and use the `MemoryGraph` class directly in your TypeScript applications or other MCP servers.

```typescript
import { MemoryGraph } from "@wemake.cx/memory";

// Initialize with path to memory file
const memory = new MemoryGraph("./memory.jsonl");

// Create entities
await memory.createEntities([
  {
    name: "John Doe",
    entityType: "person",
    observations: ["Software Engineer", "Likes coffee"]
  }
]);

// Add observations
await memory.addObservations([
  {
    entityName: "John Doe",
    contents: ["Started working on MCP migration"]
  }
]);

// Search
const results = await memory.searchNodes("John");
console.log(results);
```

## Configuration

- `MEMORY_FILE_PATH`: Path to the memory storage JSON file (default: `memory.jsonl` in the server directory).

## Development

### Build

```bash
bun run build
```

### Test

```bash
bun test
```
