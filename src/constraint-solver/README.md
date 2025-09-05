# Constraint Solver MCP Server

A specialized MCP server for validating variable assignments against mathematical and logical constraints, enabling
systematic constraint satisfaction checking.

## Core Concepts

### Variables

The server works with named variables that have numeric values:

- **Variable Name**: String identifier for the variable
- **Variable Value**: Numeric value assigned to the variable
- **Variable Set**: Collection of all variables in the constraint system

Example variables:

```json
{
  "x": 10,
  "y": 5,
  "temperature": 25.5,
  "count": 100
}
```

### Constraints

Constraints are boolean expressions that must evaluate to true:

- **Mathematical Constraints**: Arithmetic relationships between variables
- **Logical Constraints**: Boolean logic expressions
- **Comparison Constraints**: Equality and inequality checks
- **Range Constraints**: Bounds checking for variables

Example constraints:

```javascript
[
  "x > 0", // Simple comparison
  "y <= x", // Variable relationship
  "x + y < 20", // Arithmetic expression
  "temperature >= 0 && temperature <= 100", // Range constraint
  "count % 2 === 0" // Modulo constraint
];
```

### Constraint Satisfaction

The system evaluates all constraints against the variable assignments:

- **Satisfied**: All constraints evaluate to true
- **Unsatisfied**: One or more constraints evaluate to false
- **Violation Report**: List of specific constraints that failed
- **Validation Result**: Boolean satisfaction status with details

### Safety and Security

Constraint evaluation uses safe JavaScript evaluation:

- **Sandboxed Execution**: Constraints run in isolated function scope
- **Error Handling**: Invalid expressions return false rather than throwing
- **Limited Scope**: Only provided variables are accessible
- **No Side Effects**: Evaluation is purely functional

## API

### Tools

- **constraintSolver**
  - Validates variable assignments against constraint expressions
  - Input: Constraint satisfaction problem
    - `variables` (object): Variable name-value pairs (numeric values only)
    - `constraints` (array): Array of boolean expression strings
  - Output: Constraint satisfaction result
    - `satisfied` (boolean): Whether all constraints are satisfied
    - `unsatisfied` (array): List of constraint expressions that failed
  - Evaluates each constraint expression using provided variables
  - Returns detailed violation report for debugging
  - Handles invalid expressions gracefully by marking them as unsatisfied

## Setup

### bunx

```json
{
  "mcpServers": {
    "Constraint Solver": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/constraint-solver@latest"]
    }
  }
}
```

#### bunx with custom settings

The server supports various configuration options:

```json
{
  "mcpServers": {
    "Constraint Solver": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/constraint-solver@latest"],
      "env": {
        "CONSTRAINT_MAX_VARIABLES": "100",
        "CONSTRAINT_MAX_EXPRESSIONS": "50",
        "CONSTRAINT_TIMEOUT_MS": "5000",
        "CONSTRAINT_DEBUG_MODE": "false"
      }
    }
  }
}
```

- `CONSTRAINT_MAX_VARIABLES`: Maximum number of variables per request (default: 100)
- `CONSTRAINT_MAX_EXPRESSIONS`: Maximum number of constraint expressions (default: 50)
- `CONSTRAINT_TIMEOUT_MS`: Timeout for constraint evaluation in milliseconds (default: 5000)
- `CONSTRAINT_DEBUG_MODE`: Enable detailed debugging output (default: false)

## System Prompt

The prompt for utilizing constraint solving should focus on systematic validation:

```markdown
Follow these steps for constraint solving:

1. Problem Definition:
   - Identify all relevant variables and their current values
   - Define clear constraints that must be satisfied
   - Express constraints as boolean expressions using JavaScript syntax
   - Consider edge cases and boundary conditions

2. Constraint Formulation:
   - Use mathematical operators: +, -, \*, /, %, \*\*
   - Use comparison operators: >, <, >=, <=, ===, !==
   - Use logical operators: &&, ||, !
   - Reference variables by their exact names
   - Ensure expressions evaluate to boolean values

3. Validation Process:
   - Submit variables and constraints to the constraint solver
   - Review satisfaction status and any violations
   - Analyze unsatisfied constraints to understand failures
   - Iterate on variable values or constraint definitions as needed

4. Solution Refinement:
   - Adjust variable values to satisfy constraints
   - Modify constraints if they are too restrictive
   - Add additional constraints for completeness
   - Verify final solution meets all requirements

5. Documentation:
   - Document the constraint system for future reference
   - Explain the rationale behind each constraint
   - Record any assumptions or limitations
   - Plan for constraint system maintenance and updates
```
