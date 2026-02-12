import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const FOCUS_GROUP_TOOL: Tool = {
  name: "focusGroup",
  description: `A specialized tool for conducting LLM-based focus groups to evaluate MCP servers.
This tool helps models analyze MCP servers from multiple user perspectives.
It provides a framework for structured evaluation, feedback collection, and recommendation generation.

When to use this tool:
- When evaluating a new or updated MCP server
- To identify usability issues from different LLM user perspectives
- To gather diverse feedback on API design and functionality
- To prioritize improvements based on user needs
- When seeking to understand how different types of users might interact with your MCP server

Key features:
- Multi-persona simulation of different LLM users
- Structured feedback collection process
- Focus area analysis for targeted improvements
- Synthesis of findings across user types
- Actionable recommendation generation`,

  inputSchema: {
    type: "object",
    properties: {
      targetServer: {
        type: "string",
        description: "The name of the MCP server being evaluated"
      },
      personas: {
        type: "array",
        description: "The user personas participating in the focus group",
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
            userType: {
              type: "string",
              description: "Type of LLM user (e.g., novice, expert, enterprise, developer)"
            },
            usageScenario: {
              type: "string",
              description: "Typical use case scenario for this user type"
            },
            expectations: {
              type: "array",
              description: "What this user expects from an MCP server",
              items: {
                type: "string"
              }
            },
            priorities: {
              type: "array",
              description: "What aspects of the server are most important to this user",
              items: {
                type: "string"
              }
            },
            constraints: {
              type: "array",
              description: "Limitations or constraints this user operates under",
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
          required: [
            "id",
            "name",
            "userType",
            "usageScenario",
            "expectations",
            "priorities",
            "constraints",
            "communication"
          ]
        }
      },
      feedback: {
        type: "array",
        description: "Feedback from the personas",
        items: {
          type: "object",
          properties: {
            personaId: {
              type: "string",
              description: "ID of the providing persona"
            },
            content: {
              type: "string",
              description: "Content of the feedback"
            },
            type: {
              type: "string",
              enum: ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"],
              description: "Type of feedback"
            },
            targetComponent: {
              type: "string",
              description: "The component or aspect of the server this feedback relates to"
            },
            severity: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Severity or importance of this feedback (0.0-1.0)"
            },
            referenceIds: {
              type: "array",
              description: "IDs of previous feedback this builds upon",
              items: {
                type: "string"
              }
            }
          },
          required: ["personaId", "content", "type", "severity"]
        }
      },
      focusAreaAnalyses: {
        type: "array",
        description: "Analysis of specific focus areas",
        items: {
          type: "object",
          properties: {
            area: {
              type: "string",
              description: "Focus area being analyzed"
            },
            findings: {
              type: "array",
              description: "Findings about this focus area",
              items: {
                type: "object",
                properties: {
                  personaId: {
                    type: "string",
                    description: "ID of the persona making this finding"
                  },
                  finding: {
                    type: "string",
                    description: "Description of the finding"
                  },
                  impact: {
                    type: "string",
                    description: "Impact of this finding on users"
                  },
                  suggestion: {
                    type: "string",
                    description: "Suggested improvement"
                  }
                },
                required: ["personaId", "finding", "impact"]
              }
            },
            resolution: {
              type: "object",
              description: "Resolution of the findings, if any",
              properties: {
                type: {
                  type: "string",
                  enum: ["implemented", "considered", "rejected", "deferred"],
                  description: "Type of resolution"
                },
                description: {
                  type: "string",
                  description: "Description of the resolution"
                }
              },
              required: ["type", "description"]
            }
          },
          required: ["area", "findings"]
        }
      },
      stage: {
        type: "string",
        enum: ["introduction", "initial-impressions", "deep-dive", "synthesis", "recommendations", "prioritization"],
        description: "Current stage of the focus group process"
      },
      activePersonaId: {
        type: "string",
        description: "ID of the currently active persona"
      },
      nextPersonaId: {
        type: "string",
        description: "ID of the persona that should provide feedback next"
      },
      keyStrengths: {
        type: "array",
        description: "Key strengths identified in the server",
        items: {
          type: "string"
        }
      },
      keyWeaknesses: {
        type: "array",
        description: "Key weaknesses or pain points identified",
        items: {
          type: "string"
        }
      },
      topRecommendations: {
        type: "array",
        description: "Top recommendations for improvement",
        items: {
          type: "string"
        }
      },
      unanimousPoints: {
        type: "array",
        description: "Points on which all personas agree",
        items: {
          type: "string"
        }
      },
      sessionId: {
        type: "string",
        description: "Unique identifier for this focus group session"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the focus group"
      },
      nextFeedbackNeeded: {
        type: "boolean",
        description: "Whether another round of feedback is needed"
      },
      suggestedFeedbackTypes: {
        type: "array",
        description: "Suggested types for the next feedback",
        items: {
          type: "string",
          enum: ["praise", "confusion", "suggestion", "usability", "feature", "bug", "summary"]
        }
      },
      suggestedFocusArea: {
        type: "string",
        description: "Suggested focus area for the next round of feedback"
      }
    },
    required: [
      "targetServer",
      "personas",
      "feedback",
      "stage",
      "activePersonaId",
      "sessionId",
      "iteration",
      "nextFeedbackNeeded"
    ]
  }
};
