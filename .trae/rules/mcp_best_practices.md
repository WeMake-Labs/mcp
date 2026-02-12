---
alwaysApply: false
globs: src/**/*.ts, tests/**/*.ts
description: Best practices for MCP Code Mode performance, testing, and implementation.
---

# MCP Code Mode Best Practices

**Performance & Design:**

- **Batching:** Expose methods accepting arrays (e.g., `addEntities(entities: Entity[])`) to reduce round-trips.
- **Rich Returns:** Return full objects, not summaries.
- **Statelessness:** Keep Core logic stateless or explicitly manage persistence.

**Implementation Details:**

- **Imports:** ALWAYS use `.js` extension for local imports.
- **Type Safety:** Ensure strict typing in `src/codemode`.

**Testing:**

- Unit test Core logic in isolation.
- Test API class delegation.
- Test MCP mapping.

**Migration Status:**

- **Done:** `sequential-thinking`, `metacognitive-monitoring`, `collaborative-reasoning`, `visual-reasoning`.
- **Pending:** `memory`, `scientific-method`, `decision-framework`, `ethical-reasoning`, `focus-group`.
