import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MetacognitiveAnalyzer } from "../core/analyzer.js";
import { MetacognitiveFormatter } from "../core/formatter.js";
import { METACOGNITIVE_MONITORING_TOOL } from "./tools.js";

/**
 * Factory function that creates and configures a metacognitive monitoring MCP server instance.
 *
 * This function initializes a Server with the name "metacognitive-monitoring-server" and version "0.4.1",
 * registers the metacognitive monitoring tool, and sets up request handlers for listing available
 * tools and processing metacognitive monitoring requests. The server facilitates systematic
 * self-monitoring of knowledge and reasoning quality across various domains and reasoning tasks.
 *
 * @returns A configured Server instance ready for MCP communication
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: "metacognitive-monitoring-server",
      version: "0.4.1"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  const analyzer = new MetacognitiveAnalyzer();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [METACOGNITIVE_MONITORING_TOOL]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "metacognitiveMonitoring") {
      try {
        const { data, result } = analyzer.process(request.params.arguments);

        // Generate visualization for server logs
        const visualization = MetacognitiveFormatter.visualize(data);
        console.error(visualization);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
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
