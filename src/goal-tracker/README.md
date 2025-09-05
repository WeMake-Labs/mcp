# Goal Tracker MCP Server

A specialized tool for tracking and managing goals with structured progress monitoring. This server helps models
maintain goal-oriented workflows through systematic goal creation, progress tracking, and completion management.

## Core Concepts

### Goal Management

The goal tracker server provides comprehensive goal lifecycle management:

- **Goal Creation**: Structured goal definition with clear objectives and success criteria
- **Progress Tracking**: Systematic monitoring of goal advancement and milestones
- **Status Management**: Dynamic status updates reflecting current goal state
- **Completion Handling**: Formal goal completion with outcome documentation

### Goal Structure

Goals are defined with comprehensive metadata:

- **Identification**: Unique goal IDs and descriptive names
- **Objectives**: Clear, measurable goal statements
- **Success Criteria**: Specific conditions that define goal completion
- **Priority Levels**: Importance ranking for goal prioritization
- **Status Tracking**: Current state and progress indicators
- **Timestamps**: Creation, update, and completion tracking

### Goal States

The server manages goals through defined lifecycle states:

1. **Pending**: Goal created but not yet started
2. **In Progress**: Goal actively being worked on
3. **Completed**: Goal successfully achieved
4. **Paused**: Goal temporarily suspended
5. **Cancelled**: Goal abandoned or no longer relevant

## API

### Tools

- **goalTracker**
  - Comprehensive goal tracking and management system
  - Input: Goal tracking operation data
    - `operation` (enum): "add" | "complete" | "update" | "list" | "check" | "remove"
    - `goalId` (string, optional): Unique identifier for specific goal operations
    - `goalData` (object, optional): Goal information for add/update operations
      - `name` (string): Descriptive goal name
      - `description` (string): Detailed goal description
      - `priority` (enum): "high" | "medium" | "low"
      - `status` (enum): "pending" | "in_progress" | "completed" | "paused" | "cancelled"
      - `successCriteria` (string[]): Specific completion conditions
      - `milestones` (array): Intermediate checkpoints
        - Each milestone contains:
          - `id` (string): Milestone identifier
          - `description` (string): Milestone description
          - `completed` (boolean): Completion status
          - `dueDate` (string, optional): Target completion date
      - `tags` (string[]): Categorization tags
      - `dueDate` (string, optional): Target completion date (ISO 8601)
      - `estimatedEffort` (string, optional): Expected time investment
    - `updateData` (object, optional): Partial updates for existing goals
      - Supports all goalData fields for selective updates
    - `filters` (object, optional): Filtering criteria for list operations
      - `status` (string[]): Filter by goal status
      - `priority` (string[]): Filter by priority level
      - `tags` (string[]): Filter by tags
      - `dateRange` (object): Filter by date range
  - Returns structured goal information and operation results
  - Supports batch operations and complex filtering

### Operation Types

The server supports comprehensive goal operations:

#### Add Operation

- Create new goals with complete metadata
- Automatic ID generation and timestamp assignment
- Validation of required fields and data integrity
- Support for milestone and success criteria definition

#### Complete Operation

- Mark goals as completed with outcome documentation
- Automatic completion timestamp recording
- Milestone completion verification
- Success criteria validation

#### Update Operation

- Modify existing goal properties
- Partial updates with field-level granularity
- Status transitions with validation
- Progress tracking and milestone updates

#### List Operation

- Retrieve goals with flexible filtering
- Sorting by priority, date, or status
- Pagination support for large goal sets
- Summary statistics and progress reports

#### Check Operation

- Verify goal existence and current state
- Detailed goal information retrieval
- Progress assessment and milestone status
- Dependency and relationship analysis

#### Remove Operation

- Delete goals with confirmation requirements
- Cascade handling for related milestones
- Archive options for historical tracking
- Audit trail maintenance

## Setup

### bunx

```json
{
  "mcpServers": {
    "Goal Tracker": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/goal-tracker@latest"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Goal Tracker": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/goal-tracker@latest"],
      "env": {
        "GOAL_MAX_ACTIVE": "20",
        "GOAL_AUTO_ARCHIVE": "true",
        "GOAL_REMINDER_DAYS": "7"
      }
    }
  }
}
```

- `GOAL_MAX_ACTIVE`: Maximum number of active goals (default: 50)
- `GOAL_AUTO_ARCHIVE`: Automatically archive completed goals (default: false)
- `GOAL_REMINDER_DAYS`: Days before due date to trigger reminders (default: 3)

## System Prompt

The prompt for utilizing goal tracking should encourage systematic goal management:

```markdown
Follow these steps for effective goal tracking and management:

1. Goal Definition:
   - Create clear, specific, and measurable goals
   - Define concrete success criteria and completion conditions
   - Establish realistic timelines and effort estimates
   - Break complex goals into manageable milestones

2. Priority Assessment:
   - Assign appropriate priority levels based on importance and urgency
   - Consider dependencies and resource constraints
   - Balance short-term and long-term objectives
   - Align goals with broader strategic objectives

3. Progress Monitoring:
   - Regularly update goal status and milestone completion
   - Track actual vs. estimated effort and timelines
   - Document obstacles, challenges, and solutions
   - Maintain accurate progress indicators

4. Status Management:
   - Use appropriate status transitions (pending → in_progress → completed)
   - Handle paused or cancelled goals with proper documentation
   - Maintain clear audit trails for all status changes
   - Communicate status updates to relevant stakeholders

5. Milestone Tracking:
   - Define intermediate checkpoints for complex goals
   - Monitor milestone completion rates and timelines
   - Adjust plans based on milestone outcomes
   - Use milestones for progress communication

6. Completion Handling:
   - Verify all success criteria are met before marking complete
   - Document outcomes, lessons learned, and recommendations
   - Archive completed goals for historical reference
   - Celebrate achievements and recognize contributions

7. Continuous Improvement:
   - Analyze goal completion patterns and success rates
   - Identify common obstacles and develop mitigation strategies
   - Refine goal-setting processes based on experience
   - Share best practices and lessons learned
```

## Example Usage

### Adding a New Goal

```json
{
  "operation": "add",
  "goalData": {
    "name": "Implement User Authentication",
    "description": "Develop secure user authentication system with multi-factor support",
    "priority": "high",
    "status": "pending",
    "successCriteria": [
      "User registration and login functionality",
      "Multi-factor authentication support",
      "Password reset capability",
      "Session management",
      "Security audit passed"
    ],
    "milestones": [
      {
        "id": "auth_design",
        "description": "Complete authentication system design",
        "completed": false,
        "dueDate": "2030-02-15"
      },
      {
        "id": "auth_implementation",
        "description": "Implement core authentication features",
        "completed": false,
        "dueDate": "2030-02-28"
      },
      {
        "id": "auth_testing",
        "description": "Complete security testing and audit",
        "completed": false,
        "dueDate": "2030-03-07"
      }
    ],
    "tags": ["security", "backend", "user-management"],
    "dueDate": "2030-03-10",
    "estimatedEffort": "3 weeks"
  }
}
```

### Updating Goal Progress

```json
{
  "operation": "update",
  "goalId": "auth_001",
  "updateData": {
    "status": "in_progress",
    "milestones": [
      {
        "id": "auth_design",
        "description": "Complete authentication system design",
        "completed": true,
        "dueDate": "2030-02-15"
      }
    ]
  }
}
```

### Listing Goals with Filters

```json
{
  "operation": "list",
  "filters": {
    "status": ["in_progress", "pending"],
    "priority": ["high", "medium"],
    "tags": ["security"]
  }
}
```

### Completing a Goal

```json
{
  "operation": "complete",
  "goalId": "auth_001",
  "updateData": {
    "completionNotes": "Authentication system successfully implemented and deployed. All security requirements met.",
    "actualEffort": "2.5 weeks",
    "lessonsLearned": [
      "Multi-factor authentication integration was more complex than expected",
      "Early security review helped identify potential vulnerabilities",
      "User experience testing was crucial for adoption"
    ]
  }
}
```

## Key Features

### Comprehensive Goal Lifecycle

- Complete goal management from creation to completion
- Flexible status transitions and state management
- Milestone tracking and progress monitoring
- Success criteria validation and completion verification

### Advanced Filtering and Search

- Multi-criteria filtering by status, priority, tags, and dates
- Complex query support for goal discovery
- Sorting and pagination for large goal sets
- Summary statistics and progress reporting

### Milestone Management

- Hierarchical goal breakdown into manageable milestones
- Individual milestone tracking and completion
- Timeline management and due date monitoring
- Progress visualization and reporting

### Metadata and Categorization

- Flexible tagging system for goal categorization
- Priority-based goal ranking and organization
- Effort estimation and actual time tracking
- Custom fields for domain-specific requirements
