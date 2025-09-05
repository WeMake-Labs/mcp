# Transaction Manager MCP Server

A Model Context Protocol server that provides transactional capabilities for managing complex multi-step operations with
proper error handling, rollback support, and data consistency guarantees.

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

## Capabilities

### Tools

#### `transactionManager`

Manages complex multi-step operations with transactional guarantees.

**Input Schema:**

```json
{
  "operation": "string - Type of transaction operation (start|commit|rollback|checkpoint)",
  "transactionId": "string - Unique identifier for the transaction",
  "steps": [
    {
      "stepId": "string - Unique identifier for this step",
      "action": "string - The action to perform",
      "parameters": "object - Parameters for the action",
      "rollbackAction": "string - Action to perform if rollback is needed",
      "rollbackParameters": "object - Parameters for rollback action"
    }
  ],
  "isolationLevel": "string - Transaction isolation level (read_uncommitted|read_committed|repeatable_read|serializable)",
  "timeout": "number - Transaction timeout in milliseconds",
  "retryPolicy": {
    "maxRetries": "number - Maximum number of retry attempts",
    "backoffStrategy": "string - Backoff strategy (linear|exponential|fixed)",
    "retryableErrors": ["string - List of retryable error types"]
  },
  "consistency": "string - Consistency level (eventual|strong|bounded_staleness)",
  "nextOperationNeeded": "boolean - Whether another operation is needed",
  "suggestedOperations": ["string - Suggested next operations"]
}
```

**Output:** Transaction execution results with status, affected resources, rollback information, and consistency
validation results.

**Error Cases:**

- Transaction timeout exceeded
- Deadlock detection and resolution
- Consistency violation detected
- Rollback operation failure
- Resource unavailability
- Concurrent modification conflicts

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

- `TRANSACTION_TIMEOUT`: Default transaction timeout in milliseconds (default: "30000")
- `MAX_CONCURRENT_TRANSACTIONS`: Maximum number of concurrent transactions (default: "100")
- `ISOLATION_LEVEL`: Default isolation level ("read_committed" | "repeatable_read" | "serializable", default:
  "read_committed")
- `RETRY_MAX_ATTEMPTS`: Default maximum retry attempts (default: "3")
- `CONSISTENCY_CHECK`: Enable consistency validation ("true" | "false", default: "true")
- `REDIS_URL`: Redis connection URL for distributed coordination (optional)

### System Prompt Template

```markdown
You are an expert in transaction management and distributed systems. Use the transaction manager tool to:

1. Ensure ACID properties for all multi-step operations
2. Design proper rollback strategies for complex workflows
3. Handle concurrent access and prevent race conditions
4. Maintain data consistency across distributed systems
5. Implement proper error handling and recovery mechanisms
6. Optimize transaction performance while maintaining reliability

Always specify the appropriate isolation level and consistency requirements:

- Use read_committed for most operations requiring basic consistency
- Use repeatable_read for operations requiring stable reads
- Use serializable for operations requiring full isolation
- Design compensating actions for each step that can be safely rolled back

Ensure all transactions have proper timeout and retry policies configured.
```

## Example

```typescript
// Managing a complex e-commerce order processing transaction
const orderTransaction = {
  operation: "start",
  transactionId: "order-tx-12345",
  steps: [
    {
      stepId: "inventory-reserve",
      action: "reserveInventory",
      parameters: {
        productId: "prod-789",
        quantity: 2,
        warehouseId: "wh-001"
      },
      rollbackAction: "releaseInventory",
      rollbackParameters: {
        reservationId: "res-456",
        productId: "prod-789",
        quantity: 2
      }
    },
    {
      stepId: "payment-process",
      action: "processPayment",
      parameters: {
        customerId: "cust-123",
        amount: 299.99,
        currency: "USD",
        paymentMethodId: "pm-456"
      },
      rollbackAction: "refundPayment",
      rollbackParameters: {
        transactionId: "pay-tx-789",
        amount: 299.99,
        reason: "order_cancelled"
      }
    },
    {
      stepId: "shipping-schedule",
      action: "scheduleShipping",
      parameters: {
        orderId: "ord-321",
        shippingAddress: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zipCode: "12345"
        },
        priority: "standard"
      },
      rollbackAction: "cancelShipping",
      rollbackParameters: {
        shippingId: "ship-654",
        reason: "order_cancelled"
      }
    }
  ],
  isolationLevel: "read_committed",
  timeout: 30000,
  retryPolicy: {
    maxRetries: 3,
    backoffStrategy: "exponential",
    retryableErrors: ["network_timeout", "temporary_unavailable", "deadlock"]
  },
  consistency: "strong",
  nextOperationNeeded: false
};

// Handling transaction rollback on failure
const rollbackTransaction = {
  operation: "rollback",
  transactionId: "order-tx-12345",
  reason: "payment_failed",
  rollbackToStep: "inventory-reserve", // Rollback to specific step
  nextOperationNeeded: false
};
```
