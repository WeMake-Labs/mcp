# Collaborative Reasoning MCP Server

A sophisticated MCP server for simulating expert collaboration with diverse perspectives to tackle complex problems
through structured multi-persona reasoning.

## Core Concepts

### Expert Personas

The server creates and manages expert personas with distinct characteristics:

- **Identity**: Unique ID, name, and background
- **Expertise**: Specific areas of knowledge and experience
- **Perspective**: Unique viewpoint and approach to problems
- **Biases**: Acknowledged limitations and potential blind spots
- **Communication Style**: Tone and approach to interaction

Example persona:

```json
{
  "id": "tech-lead",
  "name": "Sarah Chen",
  "expertise": ["software architecture", "scalability", "team leadership"],
  "background": "15 years in enterprise software development",
  "perspective": "Pragmatic focus on maintainable, scalable solutions",
  "biases": ["over-engineering tendency", "preference for proven technologies"],
  "communication": {
    "style": "analytical",
    "tone": "direct"
  }
}
```

### Collaborative Process

The reasoning process follows structured stages:

1. **Problem Definition**: Clarify the challenge and scope
2. **Ideation**: Generate diverse ideas and approaches
3. **Critique**: Evaluate and challenge proposed solutions
4. **Integration**: Synthesize insights from different perspectives
5. **Decision**: Reach consensus or identify trade-offs
6. **Reflection**: Extract learnings and next steps

### Contribution Types

Personas contribute through various interaction types:

- **Observation**: Factual insights or data points
- **Question**: Clarifying or probing inquiries
- **Insight**: Novel connections or understanding
- **Concern**: Potential risks or limitations
- **Suggestion**: Proposed solutions or approaches
- **Challenge**: Constructive disagreement or alternative view
- **Synthesis**: Integration of multiple perspectives

### Disagreement Management

The system tracks and resolves disagreements through:

- **Position Mapping**: Clear articulation of different viewpoints
- **Argument Tracking**: Supporting evidence for each position
- **Resolution Types**: Consensus, compromise, integration, or tabling
- **Productive Conflict**: Leveraging disagreement for better outcomes

## API

### Tools

- **collaborativeReasoning**
  - Simulates expert collaboration with diverse perspectives
  - Input: Comprehensive collaboration data structure
    - `topic` (string): The problem or challenge being addressed
    - `personas` (array): Expert personas with expertise, background, and communication style
    - `contributions` (array): Contributions from personas with type, content, and confidence
    - `disagreements` (array, optional): Points of disagreement and their resolution
    - `stage` (enum): Current collaboration stage (problem-definition, ideation, critique, integration, decision,
      reflection)
    - `activePersonaId` (string): Currently active persona
    - `nextPersonaId` (string, optional): Next persona to contribute
    - `keyInsights` (array, optional): Key insights from the collaboration
    - `consensusPoints` (array, optional): Points of agreement
    - `openQuestions` (array, optional): Unresolved questions
    - `finalRecommendation` (string, optional): Final collaborative recommendation
    - `sessionId` (string): Unique session identifier
    - `iteration` (number): Current iteration number
    - `nextContributionNeeded` (boolean): Whether more input is needed
    - `suggestedContributionTypes` (array, optional): Suggested next contribution types
  - Output: Structured collaboration analysis with visual representation
    - Formatted display of personas, contributions, disagreements, and insights
    - Progress tracking and next steps
    - Confidence levels and consensus points
  - Validates all input data and maintains session history
  - Provides colorized visual output for better readability

## Setup

### bunx

```json
{
  "mcpServers": {
    "Collaborative Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/collaborative-reasoning@latest"]
    }
  }
}
```

#### bunx with custom settings

The server supports various configuration options:

```json
{
  "mcpServers": {
    "Collaborative Reasoning": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/collaborative-reasoning@latest"],
      "env": {
        "COLLABORATION_MAX_PERSONAS": "8",
        "COLLABORATION_MAX_ITERATIONS": "20",
        "COLLABORATION_CONFIDENCE_THRESHOLD": "0.7",
        "COLLABORATION_VISUAL_OUTPUT": "true"
      }
    }
  }
}
```

- `COLLABORATION_MAX_PERSONAS`: Maximum number of personas per session (default: 8)
- `COLLABORATION_MAX_ITERATIONS`: Maximum collaboration iterations (default: 20)
- `COLLABORATION_CONFIDENCE_THRESHOLD`: Minimum confidence for consensus (default: 0.7)
- `COLLABORATION_VISUAL_OUTPUT`: Enable colorized visual output (default: true)

## System Prompt

The prompt for utilizing collaborative reasoning should encourage diverse perspective integration:

```markdown
Follow these steps for collaborative reasoning:

1. Problem Framing:
   - Define the challenge clearly and comprehensively
   - Identify key stakeholders and their interests
   - Establish success criteria and constraints
   - Set up diverse expert personas with complementary expertise

2. Multi-Perspective Analysis:
   - Engage each persona to contribute their unique viewpoint
   - Encourage different types of contributions (observations, insights, concerns)
   - Surface assumptions and biases explicitly
   - Promote constructive disagreement and debate

3. Synthesis and Integration:
   - Identify points of consensus and disagreement
   - Explore creative combinations of different approaches
   - Address concerns and limitations raised by personas
   - Build on insights through cross-pollination of ideas

4. Decision and Recommendation:
   - Evaluate trade-offs between different approaches
   - Seek win-win solutions that address multiple perspectives
   - Document remaining uncertainties and risks
   - Provide clear, actionable recommendations

5. Reflection and Learning:
   - Extract key insights and lessons learned
   - Identify areas for further exploration
   - Document the reasoning process for future reference
   - Plan next steps and follow-up actions
```
