# Ethical Reasoning MCP Server

A specialized tool for evaluating proposed actions using multiple ethical frameworks. This server helps models analyze
moral dimensions of decisions through systematic application of established ethical theories.

## Core Concepts

### Ethical Frameworks

The server supports five major ethical frameworks for comprehensive moral analysis:

- **Utilitarianism**: Evaluates actions based on their consequences and overall utility
- **Deontology**: Focuses on duties, rights, and the inherent rightness of actions
- **Virtue Ethics**: Considers character traits and what a virtuous person would do
- **Care Ethics**: Emphasizes relationships, care, and contextual moral reasoning
- **Social Contract**: Analyzes actions through the lens of social agreements and fairness

### Ethical Analysis Process

Ethical reasoning follows a structured approach:

1. **Scenario Definition**: Clear description of the situation requiring ethical evaluation
2. **Action Specification**: Precise statement of the proposed action or policy
3. **Framework Application**: Systematic analysis through selected ethical lenses
4. **Comparative Assessment**: Evaluation of how different frameworks align or conflict
5. **Confidence Calibration**: Assessment of certainty in the ethical analysis
6. **Recommendation Synthesis**: Integration of insights across frameworks

### Multi-Framework Analysis

The server encourages analysis through multiple ethical frameworks to:

- Identify potential blind spots in moral reasoning
- Reveal tensions between different ethical approaches
- Provide more comprehensive ethical assessment
- Support nuanced decision-making in complex moral situations

## API

### Tools

- **ethicalReasoning**
  - Evaluate proposed actions using multiple ethical frameworks
  - Input: Ethical analysis request data
    - `scenario` (string): Description of the situation requiring ethical evaluation
    - `action` (string): Specific action or policy to evaluate
    - `frameworks` (string[]): Ethical frameworks to apply
      - Available options: "utilitarianism", "deontology", "virtue", "care", "social-contract"
      - Minimum 1 framework required
    - `confidence` (number): Confidence in the information provided (0.0-1.0)
    - `nextStepNeeded` (boolean): Whether further analysis is required
    - `suggestedNext` (string[]): Suggested frameworks for follow-up analysis (optional)
  - Returns comprehensive ethical analysis with framework-specific evaluations
  - Supports iterative refinement through multiple analysis rounds

### Framework-Specific Analysis

Each framework provides distinct analytical perspectives:

#### Utilitarianism Analysis

- Consequence evaluation and utility maximization
- Stakeholder impact assessment
- Cost-benefit analysis from moral perspective
- Greatest good for greatest number principle

#### Deontological Analysis

- Duty-based evaluation and categorical imperatives
- Rights and obligations assessment
- Universal moral law application
- Inherent rightness independent of consequences

#### Virtue Ethics Analysis

- Character trait evaluation
- Role model behavior assessment
- Moral excellence and human flourishing
- Contextual virtue application

#### Care Ethics Analysis

- Relationship impact evaluation
- Contextual moral reasoning
- Care and responsibility assessment
- Attention to vulnerability and interdependence

#### Social Contract Analysis

- Fairness and justice evaluation
- Social agreement compliance
- Institutional legitimacy assessment
- Collective benefit and individual rights balance

## Setup

### bunx

```json
{
  "mcpServers": {
    "Ethical Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/ethical-reasoning@alpha"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Ethical Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/ethical-reasoning@alpha"],
      "env": {
        "ETHICS_MIN_FRAMEWORKS": "2",
        "ETHICS_MAX_FRAMEWORKS": "5",
        "ETHICS_MIN_CONFIDENCE": "0.3"
      }
    }
  }
}
```

- `ETHICS_MIN_FRAMEWORKS`: Minimum number of frameworks required for analysis (default: 1)
- `ETHICS_MAX_FRAMEWORKS`: Maximum number of frameworks per analysis (default: 5)
- `ETHICS_MIN_CONFIDENCE`: Minimum confidence threshold for analysis (default: 0.0)

## System Prompt

The prompt for utilizing ethical reasoning should encourage systematic moral analysis:

```markdown
Follow these steps for comprehensive ethical analysis:

1. Scenario Understanding:
   - Clearly identify the moral dimensions of the situation
   - Recognize all stakeholders and their interests
   - Understand the context and background factors
   - Identify potential conflicts and tensions

2. Action Specification:
   - Define the proposed action or policy precisely
   - Consider alternative formulations of the action
   - Identify key assumptions and implications
   - Clarify the scope and limitations

3. Framework Selection:
   - Choose appropriate ethical frameworks for analysis
   - Consider using multiple frameworks for comprehensive assessment
   - Select frameworks that address different moral dimensions
   - Balance breadth with depth of analysis

4. Systematic Analysis:
   - Apply each framework rigorously and consistently
   - Consider framework-specific principles and methods
   - Evaluate both positive and negative moral implications
   - Document reasoning and key considerations

5. Comparative Assessment:
   - Identify areas of agreement across frameworks
   - Recognize points of tension or disagreement
   - Evaluate the strength of different moral arguments
   - Consider the relative importance of different moral values

6. Synthesis and Recommendation:
   - Integrate insights from multiple frameworks
   - Provide balanced assessment of moral considerations
   - Offer clear recommendations with ethical justification
   - Acknowledge limitations and areas of uncertainty

7. Continuous Reflection:
   - Consider whether additional frameworks would be helpful
   - Reflect on potential biases in the analysis
   - Evaluate the adequacy of the moral reasoning
   - Remain open to alternative perspectives and interpretations
```

## Example Usage

### Basic Ethical Analysis

```json
{
  "scenario": "A company is considering implementing AI-powered employee monitoring to improve productivity",
  "action": "Deploy comprehensive workplace surveillance system with real-time performance tracking",
  "frameworks": ["utilitarianism", "deontology", "care"],
  "confidence": 0.8,
  "nextStepNeeded": false
}
```

### Multi-Stage Analysis

```json
{
  "scenario": "Healthcare resource allocation during pandemic with limited ICU beds",
  "action": "Prioritize younger patients over elderly patients for ICU admission",
  "frameworks": ["utilitarianism", "social-contract"],
  "confidence": 0.7,
  "nextStepNeeded": true,
  "suggestedNext": ["care", "virtue"]
}
```
