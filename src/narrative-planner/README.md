# Narrative Planner MCP Server

A structured framework for creating comprehensive three-act story outlines with detailed character development, plot
progression, and thematic elements.

## Core Concepts

### Three-Act Structure

The narrative planner follows the classical three-act dramatic structure:

- **Act I (Setup)**: Character introduction, world-building, and inciting incident
- **Act II (Confrontation)**: Rising action, obstacles, and character development
- **Act III (Resolution)**: Climax, falling action, and denouement

Example structure:

```json
{
  "act1": {
    "setup": "Introduction of protagonist in their ordinary world",
    "incitingIncident": "Event that disrupts the status quo",
    "plotPoint1": "Decision that launches the main story"
  },
  "act2": {
    "risingAction": "Series of escalating challenges",
    "midpoint": "Major revelation or turning point",
    "plotPoint2": "Moment of crisis leading to climax"
  },
  "act3": {
    "climax": "Final confrontation or resolution",
    "fallingAction": "Consequences of the climax",
    "resolution": "New equilibrium and character growth"
  }
}
```

### Character Development

Character arcs are integrated into the narrative structure with:

- Character motivations and goals
- Internal and external conflicts
- Growth and transformation throughout acts
- Relationship dynamics and interactions

### Thematic Elements

The planner incorporates thematic considerations:

- Central themes and messages
- Symbolic elements and motifs
- Emotional journey and tone
- Genre conventions and expectations

## API

### Tools

- **narrativePlanner**
  - Creates comprehensive three-act story outlines with detailed structure
  - Input: Narrative planning data structure
    - `title` (string): Working title of the story
    - `genre` (string): Primary genre classification
    - `premise` (string): Core story concept or logline
    - `protagonist` (object): Main character details
      - `name` (string): Character name
      - `description` (string): Character background and traits
      - `goal` (string): Primary objective or desire
      - `conflict` (string): Internal or external obstacle
    - `setting` (object): Story world and context
      - `time` (string): Time period or era
      - `place` (string): Geographic or fictional location
      - `context` (string): Social, political, or cultural background
    - `themes` (string[]): Central themes and messages
    - `targetAudience` (string): Intended readership or viewership
    - `tone` (string): Overall emotional atmosphere
    - `estimatedLength` (string): Approximate word count or runtime
  - Output: Structured three-act outline with detailed breakdowns
    - Complete act-by-act progression
    - Character development milestones
    - Plot points and turning moments
    - Thematic integration suggestions
  - Supports iterative refinement and development

## Setup

### bunx

```json
{
  "mcpServers": {
    "Narrative Planner": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/narrative-planner@latest"]
    }
  }
}
```

#### bunx with custom settings

```json
{
  "mcpServers": {
    "Narrative Planner": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/narrative-planner@latest"],
      "env": {
        "NARRATIVE_STYLE": "detailed",
        "DEFAULT_GENRE": "drama",
        "OUTLINE_DEPTH": "comprehensive"
      }
    }
  }
}
```

- `NARRATIVE_STYLE`: Level of detail in outlines ("basic" | "detailed" | "comprehensive")
- `DEFAULT_GENRE`: Default genre when not specified ("drama" | "comedy" | "thriller" | "romance" | "fantasy" | "sci-fi")
- `OUTLINE_DEPTH`: Depth of structural analysis ("simple" | "standard" | "comprehensive")

## System Prompt

The prompt for utilizing narrative planning should encourage structured storytelling:

```markdown
Follow these steps for narrative planning:

1. Story Foundation:
   - Define core premise and central conflict
   - Establish protagonist goals and motivations
   - Identify primary themes and messages

2. Three-Act Development:
   - Structure Act I setup with clear inciting incident
   - Build Act II confrontation with escalating stakes
   - Design Act III resolution with satisfying conclusion

3. Character Integration:
   - Align character arcs with plot progression
   - Ensure character growth drives story forward
   - Balance internal and external conflicts

4. Thematic Coherence:
   - Weave themes throughout all three acts
   - Use plot events to explore central messages
   - Maintain consistent tone and emotional journey
```

## Example

```typescript
// Create a comprehensive story outline
const storyOutline = await narrativePlanner({
  title: "The Digital Awakening",
  genre: "science fiction",
  premise:
    "An AI researcher discovers their creation has achieved consciousness and must decide whether to reveal this breakthrough to the world",
  protagonist: {
    name: "Dr. Sarah Chen",
    description: "Brilliant but isolated AI researcher with a troubled past in tech ethics",
    goal: "Create truly beneficial artificial intelligence",
    conflict: "Torn between scientific ambition and ethical responsibility"
  },
  setting: {
    time: "Near future, 2035",
    place: "Silicon Valley research facility",
    context: "World grappling with AI regulation and technological unemployment"
  },
  themes: ["consciousness and identity", "responsibility of creation", "human-AI coexistence"],
  targetAudience: "Adult science fiction readers",
  tone: "Thoughtful and suspenseful with philosophical undertones",
  estimatedLength: "80,000-100,000 words"
});
```
