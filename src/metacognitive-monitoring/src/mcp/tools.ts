import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const METACOGNITIVE_MONITORING_TOOL: Tool = {
  name: "metacognitiveMonitoring",
  description: `A detailed tool for systematic self-monitoring of knowledge and reasoning quality.
This tool helps models track knowledge boundaries, claim certainty, and reasoning biases.
It provides a framework for metacognitive assessment across various domains and reasoning tasks.

When to use this tool:
- Uncertain domains requiring calibrated confidence
- Complex reasoning chains with potential biases
- Technical domains with clear knowledge boundaries
- Scenarios requiring distinction between facts, inferences, and speculation
- Claims requiring clear evidential basis

Key features:
- Knowledge boundary tracking
- Claim classification and confidence calibration
- Reasoning quality monitoring
- Bias and assumption detection
- Uncertainty area identification`,

  inputSchema: {
    type: "object",
    properties: {
      task: {
        type: "string",
        description: "The task or question being addressed"
      },
      stage: {
        type: "string",
        enum: ["knowledge-assessment", "planning", "execution", "monitoring", "evaluation", "reflection"],
        description: "Current stage of metacognitive monitoring"
      },
      knowledgeAssessment: {
        type: "object",
        description: "Assessment of knowledge in the relevant domain",
        properties: {
          domain: {
            type: "string",
            description: "The knowledge domain being assessed"
          },
          knowledgeLevel: {
            type: "string",
            enum: ["expert", "proficient", "familiar", "basic", "minimal", "none"],
            description: "Self-assessed knowledge level"
          },
          confidenceScore: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence in knowledge assessment (0.0-1.0)"
          },
          supportingEvidence: {
            type: "string",
            description: "Evidence supporting the knowledge level claim"
          },
          knownLimitations: {
            type: "array",
            description: "Known limitations of knowledge in this domain",
            items: {
              type: "string"
            }
          },
          relevantTrainingCutoff: {
            type: "string",
            description: "Relevant training data cutoff date, if applicable"
          }
        },
        required: ["domain", "knowledgeLevel", "confidenceScore", "supportingEvidence", "knownLimitations"]
      },
      claims: {
        type: "array",
        description: "Assessments of specific claims",
        items: {
          type: "object",
          properties: {
            claim: {
              type: "string",
              description: "The claim being assessed"
            },
            status: {
              type: "string",
              enum: ["fact", "inference", "speculation", "uncertain"],
              description: "Classification of the claim"
            },
            confidenceScore: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence in the claim (0.0-1.0)"
            },
            evidenceBasis: {
              type: "string",
              description: "Evidence supporting the claim"
            },
            alternativeInterpretations: {
              type: "array",
              description: "Alternative interpretations of the evidence",
              items: {
                type: "string"
              }
            },
            falsifiabilityCriteria: {
              type: "string",
              description: "Criteria that would prove the claim false"
            }
          },
          required: ["claim", "status", "confidenceScore", "evidenceBasis"]
        }
      },
      reasoningSteps: {
        type: "array",
        description: "Assessments of reasoning steps",
        items: {
          type: "object",
          properties: {
            step: {
              type: "string",
              description: "The reasoning step being assessed"
            },
            potentialBiases: {
              type: "array",
              description: "Potential cognitive biases in this step",
              items: {
                type: "string"
              }
            },
            assumptions: {
              type: "array",
              description: "Assumptions made in this step",
              items: {
                type: "string"
              }
            },
            logicalValidity: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Logical validity score (0.0-1.0)"
            },
            inferenceStrength: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Inference strength score (0.0-1.0)"
            }
          },
          required: ["step", "potentialBiases", "assumptions", "logicalValidity", "inferenceStrength"]
        }
      },
      overallConfidence: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Overall confidence in conclusions (0.0-1.0)"
      },
      uncertaintyAreas: {
        type: "array",
        description: "Areas of significant uncertainty",
        items: {
          type: "string"
        }
      },
      recommendedApproach: {
        type: "string",
        description: "Recommended approach based on metacognitive assessment"
      },
      monitoringId: {
        type: "string",
        description: "Unique identifier for this monitoring session"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the monitoring process"
      },
      nextAssessmentNeeded: {
        type: "boolean",
        description: "Whether further assessment is needed"
      },
      suggestedAssessments: {
        type: "array",
        description: "Suggested assessments to perform next",
        items: {
          type: "string",
          enum: ["knowledge", "claim", "reasoning", "overall"]
        }
      }
    },
    required: [
      "task",
      "stage",
      "overallConfidence",
      "uncertaintyAreas",
      "recommendedApproach",
      "monitoringId",
      "iteration",
      "nextAssessmentNeeded"
    ]
  }
};
