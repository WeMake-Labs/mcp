import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SCIENTIFIC_METHOD_TOOL: Tool = {
  name: "scientificMethod",
  description: `A detailed tool for applying formal scientific reasoning to questions and problems.
This tool guides models through the scientific method with structured hypothesis testing.
It enforces explicit variable identification, prediction making, and evidence evaluation.

When to use this tool:
- Investigating cause-effect relationships
- Evaluating competing explanations for phenomena
- Developing and testing hypotheses
- Avoiding confirmation bias in reasoning
- Conducting systematic inquiry

Key features:
- Structured scientific process
- Explicit variable identification
- Controlled experimental design
- Systematic evidence evaluation
- Iterative hypothesis refinement`,

  inputSchema: {
    type: "object",
    properties: {
      stage: {
        type: "string",
        enum: ["observation", "question", "hypothesis", "experiment", "analysis", "conclusion", "iteration"],
        description: "Current stage in the scientific process"
      },
      observation: {
        type: "string",
        description: "Observation of a phenomenon to investigate"
      },
      question: {
        type: "string",
        description: "Research question based on the observation"
      },
      hypothesis: {
        type: "object",
        description: "Formal hypothesis with variables and assumptions",
        properties: {
          statement: {
            type: "string",
            description: "Clear, testable hypothesis statement"
          },
          variables: {
            type: "array",
            description: "Variables involved in the hypothesis",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the variable"
                },
                type: {
                  type: "string",
                  enum: ["independent", "dependent", "controlled", "confounding"],
                  description: "Type of variable"
                },
                operationalization: {
                  type: "string",
                  description: "How the variable is measured or manipulated"
                }
              },
              required: ["name", "type"]
            }
          },
          assumptions: {
            type: "array",
            description: "Assumptions underlying the hypothesis",
            items: {
              type: "string"
            }
          },
          hypothesisId: {
            type: "string",
            description: "Unique identifier for this hypothesis"
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence in the hypothesis (0.0-1.0)"
          },
          domain: {
            type: "string",
            description: "Knowledge domain of the hypothesis"
          },
          iteration: {
            type: "number",
            minimum: 0,
            description: "Iteration number of the hypothesis"
          },
          alternativeTo: {
            type: "array",
            description: "IDs of competing hypotheses",
            items: {
              type: "string"
            }
          },
          refinementOf: {
            type: "string",
            description: "ID of the parent hypothesis if this is a refinement"
          },
          status: {
            type: "string",
            enum: ["proposed", "testing", "supported", "refuted", "refined"],
            description: "Current status of the hypothesis"
          }
        },
        required: [
          "statement",
          "variables",
          "assumptions",
          "hypothesisId",
          "confidence",
          "domain",
          "iteration",
          "status"
        ]
      },
      experiment: {
        type: "object",
        description: "Experimental design to test the hypothesis",
        properties: {
          design: {
            type: "string",
            description: "General description of the experimental design"
          },
          methodology: {
            type: "string",
            description: "Detailed methodology for the experiment"
          },
          predictions: {
            type: "array",
            description: "Predictions based on the hypothesis",
            items: {
              type: "object",
              properties: {
                if: {
                  type: "string",
                  description: "Condition or manipulation"
                },
                then: {
                  type: "string",
                  description: "Expected outcome if hypothesis is correct"
                },
                else: {
                  type: "string",
                  description: "Alternative outcome if hypothesis is incorrect"
                }
              },
              required: ["if", "then"]
            }
          },
          experimentId: {
            type: "string",
            description: "Unique identifier for this experiment"
          },
          hypothesisId: {
            type: "string",
            description: "ID of the hypothesis being tested"
          },
          controlMeasures: {
            type: "array",
            description: "Measures to control confounding variables",
            items: {
              type: "string"
            }
          },
          results: {
            type: "string",
            description: "Results of the experiment"
          },
          outcomeMatched: {
            type: "boolean",
            description: "Whether the results matched the predictions"
          },
          unexpectedObservations: {
            type: "array",
            description: "Unexpected observations during the experiment",
            items: {
              type: "string"
            }
          },
          limitations: {
            type: "array",
            description: "Limitations of the experimental design",
            items: {
              type: "string"
            }
          },
          nextSteps: {
            type: "array",
            description: "Suggested next steps based on results",
            items: {
              type: "string"
            }
          }
        },
        required: ["design", "methodology", "predictions", "experimentId", "hypothesisId", "controlMeasures"]
      },
      analysis: {
        type: "string",
        description: "Analysis of the experimental results"
      },
      conclusion: {
        type: "string",
        description: "Conclusion based on the analysis"
      },
      inquiryId: {
        type: "string",
        description: "Unique identifier for this scientific inquiry"
      },
      iteration: {
        type: "number",
        minimum: 0,
        description: "Current iteration of the scientific process"
      },
      nextStageNeeded: {
        type: "boolean",
        description: "Whether another stage is needed in the process"
      }
    },
    required: ["stage", "inquiryId", "iteration", "nextStageNeeded"]
  }
};
