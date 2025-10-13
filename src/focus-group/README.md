# Focus Group MCP Server

A specialized tool for conducting LLM-based focus groups to evaluate MCP servers. This server helps models analyze MCP
servers from multiple user perspectives through structured evaluation, feedback collection, and recommendation
generation.

## Core Concepts

### Focus Group Methodology

The focus group server simulates diverse user perspectives to evaluate MCP servers:

- **Multi-Persona Simulation**: Different types of LLM users with distinct needs and expectations
- **Structured Feedback Collection**: Systematic gathering of insights across user types
- **Focus Area Analysis**: Targeted evaluation of specific server components
- **Synthesis and Recommendations**: Integration of findings into actionable improvements

### User Personas

The server supports various LLM user archetypes:

- **Novice Users**: New to LLMs with basic needs and simple workflows
- **Expert Users**: Advanced users requiring sophisticated functionality
- **Enterprise Users**: Organizations with compliance and scalability requirements
- **Developer Users**: Technical users building on top of MCP servers
- **Domain Specialists**: Users with specific professional expertise

### Evaluation Process

Focus groups progress through structured stages:

1. **Introduction**: Server overview and persona establishment
2. **Initial Impressions**: First reactions and usability assessment
3. **Deep Dive**: Detailed exploration of functionality
4. **Synthesis**: Cross-persona comparison and pattern identification
5. **Recommendations**: Prioritized improvement suggestions
6. **Prioritization**: Ranking of recommendations by impact and feasibility

## API

### Tools

- **focusGroup**
  - Conduct structured focus group evaluation of MCP servers
  - Input: Comprehensive focus group data structure
    - `targetServer` (string): Name of the MCP server being evaluated
    - `personas` (array): User personas participating in the focus group
      - Each persona contains:
        - `id` (string): Unique identifier
        - `name` (string): Persona name
        - `userType` (string): Type of LLM user (novice, expert, enterprise, developer)
        - `usageScenario` (string): Typical use case scenario
        - `expectations` (string[]): What this user expects from an MCP server
        - `priorities` (string[]): Most important aspects for this user
        - `constraints` (string[]): Limitations or constraints this user operates under
        - `communication` (object): Communication style and tone preferences
    - `feedback` (array): Feedback from personas
      - Each feedback item contains:
        - `personaId` (string): ID of the providing persona
        - `content` (string): Feedback content
        - `type` (enum): "praise" | "confusion" | "suggestion" | "usability" | "feature" | "bug" | "summary"
        - `targetComponent` (string): Server component this feedback relates to
        - `severity` (number): Importance level (0.0-1.0)
        - `referenceIds` (string[]): IDs of previous feedback this builds upon
    - `focusAreaAnalyses` (array): Analysis of specific focus areas
      - Each analysis contains:
        - `area` (string): Focus area being analyzed
        - `findings` (array): Findings about this area
        - `resolution` (object): Resolution status and description
    - `stage` (enum): Current stage of focus group process
    - `activePersonaId` (string): ID of currently active persona
    - `nextPersonaId` (string): ID of persona that should provide feedback next
    - `sessionId` (string): Unique identifier for this focus group session
    - `iteration` (number): Current iteration number
    - `nextFeedbackNeeded` (boolean): Whether another round of feedback is needed
  - Returns structured focus group analysis with synthesized recommendations
  - Supports iterative refinement through multiple feedback rounds

### Feedback Types

The server categorizes feedback into specific types:

#### Praise Feedback

- Positive aspects and strengths identified
- Features that work well for specific user types
- Successful design decisions and implementations

#### Confusion Feedback

- Areas where users experience difficulty
- Unclear documentation or interfaces
- Concepts that need better explanation

#### Suggestion Feedback

- Specific improvement recommendations
- Feature requests and enhancements
- Alternative approaches and solutions

#### Usability Feedback

- User experience and interface issues
- Workflow and interaction problems
- Accessibility and ease-of-use concerns

#### Feature Feedback

- Missing functionality identification
- Feature gap analysis
- Capability enhancement requests

#### Bug Feedback

- Technical issues and errors
- Unexpected behavior reports
- System reliability concerns

## Setup

### bunx

```json
{
  "mcpServers": {
    "Focus Group": {
      "command": "bunx",
      "args": ["@wemake.cx/focus-group@latest"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Focus Group": {
      "command": "bunx",
      "args": ["@wemake.cx/focus-group@latest"],
      "env": {
        "FOCUS_MAX_PERSONAS": "8",
        "FOCUS_MAX_FEEDBACK_ITEMS": "50",
        "FOCUS_MIN_SEVERITY": "0.1"
      }
    }
  }
}
```

- `FOCUS_MAX_PERSONAS`: Maximum number of personas per focus group (default: 10)
- `FOCUS_MAX_FEEDBACK_ITEMS`: Maximum feedback items per session (default: 100)
- `FOCUS_MIN_SEVERITY`: Minimum severity threshold for feedback (default: 0.0)

## System Prompt

The prompt for utilizing focus groups should encourage diverse perspective simulation:

```markdown
Follow these steps for comprehensive focus group evaluation:

1. Persona Development:
   - Create diverse user personas representing different LLM user types
   - Define clear usage scenarios and expectations for each persona
   - Establish distinct communication styles and priorities
   - Ensure personas cover the full spectrum of potential users

2. Server Introduction:
   - Present the MCP server to each persona
   - Allow initial reactions and first impressions
   - Document immediate usability observations
   - Identify areas of interest or concern for each user type

3. Structured Exploration:
   - Guide each persona through systematic server evaluation
   - Focus on areas most relevant to each user type
   - Encourage detailed feedback on functionality and design
   - Document specific use cases and workflow scenarios

4. Cross-Persona Analysis:
   - Compare feedback across different user types
   - Identify common themes and divergent perspectives
   - Analyze patterns in user needs and expectations
   - Synthesize insights into coherent findings

5. Focus Area Deep Dives:
   - Conduct targeted analysis of specific server components
   - Evaluate critical functionality from multiple perspectives
   - Assess alignment between server capabilities and user needs
   - Document detailed findings and improvement opportunities

6. Recommendation Development:
   - Synthesize feedback into actionable recommendations
   - Prioritize improvements based on user impact and feasibility
   - Consider trade-offs between different user needs
   - Provide clear rationale for each recommendation

7. Iterative Refinement:
   - Conduct multiple rounds of feedback as needed
   - Allow personas to respond to each other's feedback
   - Refine understanding through continued dialogue
   - Ensure comprehensive coverage of all important aspects
```

## Example Usage

### Basic Focus Group Setup

```json
{
  "targetServer": "Decision Framework",
  "personas": [
    {
      "id": "novice_user",
      "name": "Sarah",
      "userType": "novice",
      "usageScenario": "Personal decision making for life choices",
      "expectations": ["Simple interface", "Clear guidance", "Reliable results"],
      "priorities": ["Ease of use", "Understandable output"],
      "constraints": ["Limited technical knowledge", "Time constraints"],
      "communication": {
        "style": "casual",
        "tone": "friendly"
      }
    }
  ],
  "feedback": [],
  "stage": "introduction",
  "activePersonaId": "novice_user",
  "sessionId": "focus_001",
  "iteration": 0,
  "nextFeedbackNeeded": true
}
```

### Multi-Persona Evaluation

```json
{
  "targetServer": "Ethical Reasoning",
  "personas": [
    {
      "id": "enterprise_user",
      "name": "Corporate Ethics Officer",
      "userType": "enterprise",
      "usageScenario": "Corporate policy evaluation and compliance",
      "expectations": ["Audit trails", "Compliance reporting", "Scalable analysis"],
      "priorities": ["Regulatory compliance", "Risk management", "Documentation"],
      "constraints": ["Strict compliance requirements", "Audit obligations"],
      "communication": {
        "style": "formal",
        "tone": "professional"
      }
    },
    {
      "id": "academic_user",
      "name": "Philosophy Professor",
      "userType": "expert",
      "usageScenario": "Teaching and research in applied ethics",
      "expectations": ["Rigorous analysis", "Multiple frameworks", "Detailed reasoning"],
      "priorities": ["Theoretical accuracy", "Comprehensive coverage", "Educational value"],
      "constraints": ["Academic standards", "Peer review requirements"],
      "communication": {
        "style": "analytical",
        "tone": "scholarly"
      }
    }
  ],
  "stage": "deep-dive",
  "sessionId": "focus_002",
  "iteration": 2,
  "nextFeedbackNeeded": true
}
```

## Key Features

### Multi-Perspective Analysis

- Simultaneous evaluation from different user viewpoints
- Identification of user-specific needs and pain points
- Cross-persona comparison and synthesis
- Comprehensive coverage of user spectrum

### Structured Feedback Collection

- Categorized feedback types for systematic analysis
- Severity scoring for prioritization
- Reference tracking for feedback relationships
- Iterative refinement through multiple rounds

### Focus Area Deep Dives

- Targeted analysis of specific server components
- Detailed findings documentation
- Resolution tracking and status management
- Component-specific improvement recommendations

### Recommendation Synthesis

- Integration of insights across personas
- Prioritized improvement suggestions
- Impact and feasibility assessment
- Clear rationale and justification
