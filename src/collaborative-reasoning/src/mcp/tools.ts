import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const COLLABORATIVE_REASONING_TOOL: Tool = {
  name: "collaborativeReasoning",
  description: `A detailed tool for simulating expert collaboration with diverse perspectives.
This tool helps models tackle complex problems by coordinating multiple viewpoints.
It provides a framework for structured collaborative reasoning and perspective integration.

When to use this tool:
- Complex problems requiring diverse expertise
- Issues needing multiple stakeholder perspectives
- Scenarios with potential value trade-offs
- Creative tasks benefiting from diverse viewpoints
- Problems where biases might limit single-perspective thinking

Key features:
- Multi-persona simulation
- Structured collaboration process
- Productive disagreement management
- Cross-pollination of ideas
- Perspective synthesis and integration`,

  inputSchema: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "The topic or problem being addressed"
      },
      personas: {
        type: "array",
        description: "The expert personas participating in the collaboration",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the persona"
            },
            name: {
              type: "string",
              description: "Name of the persona"
            },
            expertise: {
              type: "array",
              description: "Areas of expertise",
              items: {
                type: "string"
              }
            },
            background: {
              type: "string",
              description: "Background and experience of the persona"
            },
            perspective: {
              type: "string",
              description: "Unique perspective or viewpoint"
            },
            biases: {
              type: "array",
              description: "Potential biases of this persona",
              items: {
                type: "string"
              }
            },
            communication: {
              type: "object",
              description: "Communication style of the persona",
              properties: {
                style: {
                  type: "string",
                  description: "Communication style (e.g., direct, analytical, narrative)"
                },
                tone: {
                  type: "string",
                  description: "Tone of communication (e.g., formal, casual, enthusiastic)"
                }
              },
              required: ["style", "tone"]
            }
          },
          required: ["id", "name", "expertise", "background", "perspective", "biases", "communication"]
        }
      },
      contributions: {
        type: "array",
        description: "Contributions from the personas",
        items: {
          type: "object",
          properties: {
            personaId: {
              type: "string",
              description: "ID of the contributing persona"
            },
            content: {
              type: "string",
              description: "Content of the contribution"
            },
            type: {
              type: "string",
              enum: ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"],
              description: "Type of contribution"
            },
            referenceIds: {
              type: "array",
              description: "IDs of previous contributions this builds upon",
              items: {
                type: "string"
              }
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence level in this contribution (0.0-1.0)"
            }
          },
          required: ["personaId", "content", "type", "confidence"]
        }
      },
      disagreements: {
        type: "array",
        description: "Points of disagreement between personas",
        items: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic of disagreement"
            },
            positions: {
              type: "array",
              description: "Different positions on the topic",
              items: {
                type: "object",
                properties: {
                  personaId: {
                    type: "string",
                    description: "ID of the persona holding this position"
                  },
                  position: {
                    type: "string",
                    description: "Description of the position"
                  },
                  arguments: {
                    type: "array",
                    description: "Arguments supporting this position",
                    items: {
                      type: "string"
                    }
                  }
                },
                required: ["personaId", "position", "arguments"]
              }
            },
            resolution: {
              type: "object",
              description: "Resolution of the disagreement, if any",
              properties: {
                type: {
                  type: "string",
                  enum: ["consensus", "compromise", "integration", "tabled"],
                  description: "Type of resolution"
                },
                description: {
                  type: "string",
                  description: "Description of how the disagreement was resolved"
                }
              },
              required: ["type", "description"]
            }
          },
          required: ["topic", "positions"]
        }
      },
      stage: {
        type: "string",
        enum: ["problem-definition", "ideation", "critique", "integration", "decision", "reflection"],
        description: "Current stage of the collaborative process"
      },
      activePersonaId: {
        type: "string",
        description: "ID of the currently active persona"
      },
      nextPersonaId: {
        type: "string",
        description: "ID of the persona that should contribute next"
      },
      keyInsights: {
        type: "array",
        description: "Key insights from the collaboration",
        items: {
          type: "string"
        }
      },
      consensusPoints: {
        type: "array",
        description: "Points of consensus among participants",
        items: {
          type: "string"
        }
      },
      openQuestions: {
        type: "array",
        description: "Open questions requiring further exploration",
        items: {
          type: "string"
        }
      },
      finalRecommendation: {
        type: "string",
        description: "Final recommendation based on the collaboration"
      },
      sessionId: {
        type: "string",
        description: "Unique identifier for this collaboration session"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the collaboration"
      },
      nextContributionNeeded: {
        type: "boolean",
        description: "Whether another contribution is needed"
      },
      suggestedContributionTypes: {
        type: "array",
        description: "Suggested types for the next contribution",
        items: {
          type: "string",
          enum: ["observation", "question", "insight", "concern", "suggestion", "challenge", "synthesis"]
        }
      }
    },
    required: [
      "topic",
      "personas",
      "contributions",
      "stage",
      "activePersonaId",
      "sessionId",
      "iteration",
      "nextContributionNeeded"
    ]
  }
};
