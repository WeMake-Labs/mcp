# Transaction Manager MCP Server

A Model Context Protocol server that provides transactional capabilities for managing complex multi-step operations with
proper error handling, rollback support, and data consistency guarantees.

## Code Mode Architecture

This server follows the Code Mode architecture, separating concerns into three layers:

- **Core Layer** (`src/core/`): Pure business logic and types.
- **Code Mode Layer** (`src/codemode/`): Strongly-typed TypeScript API for direct programmatic use.
- **MCP Layer** (`src/mcp/`): Adapter that exposes the API as an MCP server.

### Programmatic Usage (Code Mode)

You can use the `TransactionManager` class directly in your TypeScript applications:

```typescript
import { TransactionManager } from "@wemake.cx/transaction-manager";

const tm = new TransactionManager();

// Start a transaction
const { token } = await tm.start({ status: "initiated" }, 3600);
console.log(`Transaction started: ${token}`);

// Resume and update state
const updated = await tm.resume(token, { status: "processing", step: 1 });

// Close transaction
await tm.close(token);
```

## MCP Tool: `transaction`

Manages simple stateful transactions (start, resume, close).

**Input Schema:**

```json
{
  "action": "start | resume | close",
  "token": "string (optional, required for resume/close)",
  "payload": "object (optional)",
  "ttlSeconds": "number (optional)"
}
```

## Overview and Purpose

The Transaction Manager server addresses limitations in language models' ability to manage complex multi-step operations
reliably. It provides transactional capabilities that ensure data consistency, proper error handling, and rollback
support for distributed workflows.

### Core Concepts

#### Transaction Management

- **ACID Properties**: Atomicity, Consistency, Isolation, and Durability for all operations
- **Multi-step workflows**: Coordinated execution of complex operation sequences
- **State management**: Tracking and maintaining system state across operations
- **Error recovery**: Structured approaches to handle failures and restore consistency

#### Operation Types

- **Atomic operations**: Single, indivisible units of work that either complete fully or not at all
- **Composite transactions**: Multiple related operations grouped into a single transaction
- **Distributed transactions**: Operations spanning multiple systems or services
- **Compensating actions**: Rollback operations that undo the effects of completed steps

#### Consistency Guarantees

- **Data integrity**: Ensuring all data remains in a valid state throughout operations
- **Referential consistency**: Maintaining relationships between related data elements
- **State synchronization**: Keeping distributed systems in sync during multi-step operations
- **Rollback safety**: Ability to safely undo partial operations without data corruption

## Setup

### bunx

```json
{
  "mcpServers": {
    "Transaction Manager": {
      "command": "bunx",
      "args": ["@wemake.cx/transaction-manager@latest"]
    }
  }
}
```

### Environment Variables

- `REDIS_URL`: Redis connection URL for distributed coordination (optional, defaults to mock in test env)
- `TRANSACTION_TIMEOUT`: Default transaction timeout in milliseconds (default: "30000")

### System Prompt Template

```markdown
You are an expert in transaction management and distributed systems. Use the transaction manager tool to:

1. Ensure ACID properties for all multi-step operations
2. Design proper rollback strategies for complex workflows
3. Handle concurrent access and prevent race conditions
4. Maintain data consistency across distributed systems
5. Implement proper error handling and recovery mechanisms
6. Optimize transaction performance while maintaining reliability
```
