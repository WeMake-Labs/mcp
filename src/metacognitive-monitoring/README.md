# Metacognitive Monitoring MCP Server

A systematic framework for self-monitoring knowledge boundaries, claim certainty, and reasoning quality to enhance
metacognitive awareness and calibrated confidence.

## Core Concepts

### Knowledge Assessment

Knowledge assessments evaluate understanding within specific domains. Each assessment includes:

- Domain identification and scope
- Self-assessed knowledge level (expert to none)
- Confidence calibration (0.0-1.0)
- Supporting evidence for the assessment
- Known limitations and gaps
- Relevant training data cutoffs

Example:

```json
{
  "domain": "Machine Learning Optimization",
  "knowledgeLevel": "proficient",
  "confidenceScore": 0.75,
  "supportingEvidence": "Familiar with gradient descent, Adam optimizer, and regularization techniques",
  "knownLimitations": ["Limited experience with advanced meta-learning algorithms"],
  "relevantTrainingCutoff": "2021-09"
}
```

### Claim Assessment

Claim assessments classify and evaluate specific statements. They include:

- Statement classification (fact, inference, speculation, uncertain)
- Confidence scoring for the claim
- Evidence basis supporting the claim
- Alternative interpretations
- Falsifiability criteria

Example:

```json
{
  "claim": "Transformer models require quadratic memory with sequence length",
  "status": "fact",
  "confidenceScore": 0.9,
  "evidenceBasis": "Self-attention mechanism computes all pairwise token interactions",
  "alternativeInterpretations": ["Linear attention variants exist but with trade-offs"],
  "falsifiabilityCriteria": "Discovery of attention mechanism with linear complexity and equivalent performance"
}
```

### Reasoning Assessment

Reasoning assessments evaluate individual reasoning steps. They contain:

- Description of the reasoning step
- Potential cognitive biases
- Underlying assumptions
- Logical validity scoring (0.0-1.0)
- Inference strength evaluation (0.0-1.0)

Example:

```json
{
  "step": "Since the model performs well on training data, it will generalize to new data",
  "potentialBiases": ["Confirmation bias", "Overfitting neglect"],
  "assumptions": ["Training data is representative", "Model complexity is appropriate"],
  "logicalValidity": 0.3,
  "inferenceStrength": 0.4
}
```

## API

### Tools

- **metacognitiveMonitoring**
  - Systematic self-monitoring of knowledge and reasoning quality
  - Input: Comprehensive metacognitive monitoring data structure
    - `task` (string): The task or question being addressed
    - `stage` (enum): Current monitoring stage - "knowledge-assessment" | "planning" | "execution" | "monitoring" |
      "evaluation" | "reflection"
    - `knowledgeAssessment` (object, optional): Domain knowledge evaluation
      - `domain` (string): Knowledge domain being assessed
      - `knowledgeLevel` (enum): "expert" | "proficient" | "familiar" | "basic" | "minimal" | "none"
      - `confidenceScore` (number): Confidence in assessment (0.0-1.0)
      - `supportingEvidence` (string): Evidence for knowledge level claim
      - `knownLimitations` (string[]): Known knowledge gaps
      - `relevantTrainingCutoff` (string, optional): Training data cutoff date
    - `claims` (array, optional): Specific claim assessments
      - `claim` (string): Statement being assessed
      - `status` (enum): "fact" | "inference" | "speculation" | "uncertain"
      - `confidenceScore` (number): Confidence in claim (0.0-1.0)
      - `evidenceBasis` (string): Supporting evidence
      - `alternativeInterpretations` (string[], optional): Alternative explanations
      - `falsifiabilityCriteria` (string, optional): Criteria for falsification
    - `reasoningSteps` (array, optional): Reasoning step evaluations
      - `step` (string): Description of reasoning step
      - `potentialBiases` (string[]): Identified cognitive biases
      - `assumptions` (string[]): Underlying assumptions
      - `logicalValidity` (number): Logical validity score (0.0-1.0)
      - `inferenceStrength` (number): Inference strength score (0.0-1.0)
    - `overallConfidence` (number): Overall confidence in conclusions (0.0-1.0)
    - `uncertaintyAreas` (string[]): Areas of significant uncertainty
    - `recommendedApproach` (string): Recommended approach based on assessment
    - `monitoringId` (string): Unique identifier for monitoring session
    - `iteration` (number): Current iteration of monitoring process
    - `nextAssessmentNeeded` (boolean): Whether further assessment is required
    - `suggestedAssessments` (array, optional): Suggested next assessments - "knowledge" | "claim" | "reasoning" |
      "overall"
  - Returns structured metacognitive analysis with visual confidence indicators
  - Supports iterative refinement of self-awareness and calibration
  - Tracks knowledge boundaries and reasoning quality over time

## Setup

### bunx

```json
{
  "mcpServers": {
    "Metacognitive Monitoring": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/metacognitive-monitoring@latest"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Metacognitive Monitoring": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/metacognitive-monitoring@latest"],
      "env": {
        "MONITORING_HISTORY_LIMIT": "100",
        "CONFIDENCE_THRESHOLD": "0.7"
      }
    }
  }
}
```

- `MONITORING_HISTORY_LIMIT`: Maximum number of monitoring sessions to retain (default: 50)
- `CONFIDENCE_THRESHOLD`: Minimum confidence threshold for high-confidence claims (default: 0.8)

## System Prompt

The prompt for utilizing metacognitive monitoring should encourage systematic self-assessment:

```markdown
Follow these steps for metacognitive monitoring:

1. Knowledge Boundary Assessment:
   - Explicitly assess your knowledge level in the relevant domain
   - Identify specific areas of strength and limitation
   - Calibrate confidence based on evidence and experience
   - Acknowledge training data cutoffs and their implications

2. Claim Classification:
   - Distinguish between facts, inferences, speculation, and uncertainty
   - Provide evidence basis for each significant claim
   - Consider alternative interpretations of evidence
   - Establish falsifiability criteria where appropriate

3. Reasoning Quality Monitoring:
   - Evaluate each reasoning step for logical validity
   - Identify potential cognitive biases affecting judgment
   - Make underlying assumptions explicit
   - Assess inference strength and confidence

4. Uncertainty Management:
   - Identify areas of significant uncertainty
   - Recommend approaches based on confidence levels
   - Suggest additional assessments when needed
   - Iterate on understanding as new information emerges

5. Calibration and Iteration:
   - Track confidence calibration over time
   - Refine assessments based on feedback
   - Maintain awareness of knowledge boundaries
   - Continuously improve metacognitive accuracy
```

## Usage Examples

### Technical Domain Assessment

When working in specialized technical domains, systematically assess knowledge boundaries and claim confidence levels.

### Complex Reasoning Chains

For multi-step reasoning, evaluate each step for biases, assumptions, and logical validity.

### Uncertain Scenarios

In high-uncertainty situations, explicitly track confidence levels and identify areas requiring additional information.

### Evidence Evaluation

When evaluating evidence, distinguish between different types of claims and their evidential basis.
