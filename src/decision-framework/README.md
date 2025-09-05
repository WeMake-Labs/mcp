# Decision Framework MCP Server

A detailed tool for structured decision analysis and rational choice. This tool helps models systematically evaluate
options, criteria, and outcomes using multiple decision frameworks.

## Core Concepts

### Decision Components

The decision framework operates on several key components:

- **Options**: Available alternatives or choices
- **Criteria**: Standards for evaluating options
- **Outcomes**: Possible results with probabilities and values
- **Stakeholders**: People or groups affected by the decision
- **Constraints**: Limitations on the decision

Example option:

```json
{
  "id": "option_a",
  "name": "Cloud Migration",
  "description": "Migrate existing infrastructure to cloud platform"
}
```

### Decision Analysis Types

The server supports multiple analysis frameworks:

- **Expected Utility**: Probability-weighted value calculations
- **Multi-Criteria**: Weighted scoring across multiple criteria
- **Maximin**: Choose option with best worst-case outcome
- **Minimax Regret**: Minimize maximum regret across scenarios
- **Satisficing**: Find first option meeting minimum criteria

### Evaluation Process

Decisions progress through structured stages:

1. **Problem Definition**: Clear statement of decision to be made
2. **Options**: Identification of available alternatives
3. **Criteria**: Definition of evaluation standards
4. **Evaluation**: Scoring options against criteria
5. **Analysis**: Application of decision framework
6. **Recommendation**: Final recommendation with justification

## API

### Tools

- **decisionFramework**
  - Systematic decision analysis and rational choice evaluation
  - Input: Comprehensive decision analysis data structure
    - `decisionStatement` (string): Clear statement of the decision to be made
    - `options` (array): Available options or alternatives
      - Each option contains:
        - `id` (string): Unique identifier
        - `name` (string): Option name
        - `description` (string): Detailed description
    - `criteria` (array): Criteria for evaluating options
      - Each criterion contains:
        - `id` (string): Unique identifier
        - `name` (string): Criterion name
        - `description` (string): Detailed description
        - `weight` (number): Importance weight (0.0-1.0)
        - `evaluationMethod` (enum): "quantitative" | "qualitative" | "boolean"
    - `criteriaEvaluations` (array): Evaluations of options against criteria
      - Each evaluation contains:
        - `criterionId` (string): Reference to criterion
        - `optionId` (string): Reference to option
        - `score` (number): Score (0.0-1.0)
        - `justification` (string): Reasoning for the score
    - `possibleOutcomes` (array): Possible outcomes with probabilities
      - Each outcome contains:
        - `id` (string): Unique identifier
        - `description` (string): Outcome description
        - `probability` (number): Likelihood (0.0-1.0)
        - `optionId` (string): Associated option
        - `value` (number): Utility value
        - `confidenceInEstimate` (number): Confidence level (0.0-1.0)
    - `informationGaps` (array): Missing information affecting the decision
    - `stakeholders` (string[]): Affected parties
    - `constraints` (string[]): Decision limitations
    - `timeHorizon` (string): Decision timeframe
    - `riskTolerance` (enum): "risk-averse" | "risk-neutral" | "risk-seeking"
    - `analysisType` (enum): Type of analysis to perform
    - `stage` (enum): Current stage of decision process
    - `iteration` (number): Current iteration number
    - `nextStageNeeded` (boolean): Whether further analysis is required
  - Returns structured decision analysis with recommendations
  - Supports iterative refinement through multiple stages

## Setup

### bunx

```json
{
  "mcpServers": {
    "Decision Framework": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/decision-framework@latest"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Decision Framework": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/decision-framework@latest"],
      "env": {
        "DECISION_MAX_OPTIONS": "10",
        "DECISION_MAX_CRITERIA": "15",
        "DECISION_MIN_CONFIDENCE": "0.1"
      }
    }
  }
}
```

- `DECISION_MAX_OPTIONS`: Maximum number of options per decision (default: 20)
- `DECISION_MAX_CRITERIA`: Maximum number of criteria per decision (default: 20)
- `DECISION_MIN_CONFIDENCE`: Minimum confidence threshold for outcomes (default: 0.0)

## System Prompt

The prompt for utilizing decision framework should encourage systematic analysis:

```markdown
Follow these steps for structured decision making:

1. Problem Definition:
   - Clearly articulate the decision to be made
   - Identify the decision maker and key stakeholders
   - Define the time horizon and constraints
   - Establish the context and background

2. Option Generation:
   - Brainstorm comprehensive list of alternatives
   - Include creative and unconventional options
   - Ensure options are mutually exclusive and collectively exhaustive
   - Document assumptions and feasibility constraints

3. Criteria Development:
   - Identify all relevant evaluation criteria
   - Assign appropriate weights based on importance
   - Choose suitable evaluation methods for each criterion
   - Validate criteria with stakeholders

4. Systematic Evaluation:
   - Score each option against every criterion
   - Provide clear justification for scores
   - Consider uncertainty and confidence levels
   - Document key assumptions and trade-offs

5. Analysis and Recommendation:
   - Apply appropriate decision analysis framework
   - Conduct sensitivity analysis on key parameters
   - Identify information gaps and their impact
   - Provide clear recommendation with rationale

6. Implementation Planning:
   - Consider implementation challenges and risks
   - Develop contingency plans for key uncertainties
   - Establish monitoring and review mechanisms
   - Plan for decision communication and buy-in
```
