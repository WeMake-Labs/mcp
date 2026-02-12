import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ScientificMethodCodeMode } from "../codemode/index.js";
import { SCIENTIFIC_METHOD_TOOL } from "./tools.js";

export function createServer(): Server {
  const server = new Server(
    {
      name: "scientific-method-server",
      version: "0.4.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const api = new ScientificMethodCodeMode();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [SCIENTIFIC_METHOD_TOOL]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "scientificMethod") {
      try {
        const result = await api.processInquiry(request.params.arguments);
        const visualization = api.visualize(result);
        console.error(visualization);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  inquiryId: result.inquiryId,
                  stage: result.stage,
                  iteration: result.iteration,
                  hasObservation: !!result.observation,
                  hasQuestion: !!result.question,
                  hasHypothesis: !!result.hypothesis,
                  hasExperiment: !!result.experiment,
                  hasAnalysis: !!result.analysis,
                  hasConclusion: !!result.conclusion,
                  nextStageNeeded: result.nextStageNeeded
                },
                null,
                2
              )
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: error instanceof Error ? error.message : String(error),
                  status: "failed"
                },
                null,
                2
              )
            }
          ],
          isError: true
        };
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${request.params.name}`
        }
      ],
      isError: true
    };
  });

  return server;
}
