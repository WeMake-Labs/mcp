import chalk from "chalk";
import { FocusGroupData } from "./types.js";

export class FocusGroupVisualizer {
  private getPersonaColor(index: number): (text: string) => string {
    const colors = [chalk.blue, chalk.green, chalk.yellow, chalk.magenta, chalk.cyan, chalk.red];
    return colors[index % colors.length];
  }

  private getFeedbackTypeColor(type: string): (text: string) => string {
    switch (type) {
      case "praise":
        return chalk.green;
      case "confusion":
        return chalk.yellow;
      case "suggestion":
        return chalk.blue;
      case "usability":
        return chalk.magenta;
      case "feature":
        return chalk.cyan;
      case "bug":
        return chalk.red;
      case "summary":
        return chalk.white;
      default:
        return chalk.white;
    }
  }

  private getSeverityBar(severity: number): string {
    const barLength = 20;
    const s = Math.max(0, Math.min(1, severity));
    const filledLength = Math.round(s * barLength);
    const emptyLength = barLength - filledLength;

    let bar = "[";

    // Choose color based on severity level
    let color: (text: string) => string;
    if (s >= 0.8) {
      color = chalk.red;
    } else if (s >= 0.5) {
      color = chalk.yellow;
    } else {
      color = chalk.green;
    }

    bar += color("=".repeat(filledLength));
    bar += " ".repeat(emptyLength);
    bar += `] ${(s * 100).toFixed(0)}%`;

    return bar;
  }

  public visualize(data: FocusGroupData): string {
    let output = `\n${chalk.bold(`FOCUS GROUP: ${data.targetServer}`)} (ID: ${data.sessionId})\n\n`;

    // Stage and iteration
    output += `${chalk.cyan("Stage:")} ${data.stage}\n`;
    output += `${chalk.cyan("Iteration:")} ${data.iteration}\n\n`;

    // Personas
    output += `${chalk.bold("PERSONAS:")}\n`;
    for (let i = 0; i < data.personas.length; i++) {
      const persona = data.personas[i];
      const color = this.getPersonaColor(i);

      output += `${color(`${persona.name} (${persona.id})`)}\n`;
      output += `  User Type: ${persona.userType}\n`;
      output += `  Scenario: ${persona.usageScenario}\n`;
      output += `  Priorities: ${persona.priorities.join(", ")}\n`;

      // Highlight active persona
      if (persona.id === data.activePersonaId) {
        output += `  ${chalk.bgGreen(chalk.black(" ACTIVE "))}\n`;
      }

      output += "\n";
    }

    // Feedback
    if (data.feedback.length > 0) {
      output += `${chalk.bold("FEEDBACK:")}\n\n`;

      for (const feedback of data.feedback) {
        // Find persona
        const persona = data.personas.find((p) => p.id === feedback.personaId);
        if (!persona) continue;

        // Get persona color
        const personaIndex = data.personas.findIndex((p) => p.id === feedback.personaId);
        const personaColor = this.getPersonaColor(personaIndex);

        // Get feedback type color
        const typeColor = this.getFeedbackTypeColor(feedback.type);

        output += `${personaColor(`[${persona.name}]`)} ${typeColor(`[${feedback.type}]`)}${
          feedback.targetComponent ? ` on ${feedback.targetComponent}` : ""
        }\n`;
        output += `${feedback.content}\n`;
        output += `Severity: ${this.getSeverityBar(feedback.severity)}\n`;

        if (feedback.referenceIds && feedback.referenceIds.length > 0) {
          output += `References: ${feedback.referenceIds.join(", ")}\n`;
        }

        output += "\n";
      }
    }

    // Focus Area Analyses
    if (data.focusAreaAnalyses && data.focusAreaAnalyses.length > 0) {
      output += `${chalk.bold("FOCUS AREA ANALYSES:")}\n\n`;

      for (const analysis of data.focusAreaAnalyses) {
        output += `${chalk.cyan("Area:")} ${analysis.area}\n\n`;

        for (const finding of analysis.findings) {
          // Find persona
          const persona = data.personas.find((p) => p.id === finding.personaId);
          if (!persona) continue;

          // Get persona color
          const personaIndex = data.personas.findIndex((p) => p.id === finding.personaId);
          const personaColor = this.getPersonaColor(personaIndex);

          output += `${personaColor(`[${persona.name}]`)} Finding: ${finding.finding}\n`;
          output += `  Impact: ${finding.impact}\n`;
          if (finding.suggestion) {
            output += `  Suggestion: ${finding.suggestion}\n`;
          }
          output += "\n";
        }

        if (analysis.resolution) {
          output += `${chalk.green("Resolution:")} ${analysis.resolution.type}\n`;
          output += `${analysis.resolution.description}\n\n`;
        } else {
          output += `${chalk.yellow("Status:")} Unresolved\n\n`;
        }
      }
    }

    // Analysis output
    if (data.keyStrengths && data.keyStrengths.length > 0) {
      output += `${chalk.bold("KEY STRENGTHS:")}\n`;
      for (const strength of data.keyStrengths) {
        output += `  - ${strength}\n`;
      }
      output += "\n";
    }

    if (data.keyWeaknesses && data.keyWeaknesses.length > 0) {
      output += `${chalk.bold("KEY WEAKNESSES:")}\n`;
      for (const weakness of data.keyWeaknesses) {
        output += `  - ${weakness}\n`;
      }
      output += "\n";
    }

    if (data.topRecommendations && data.topRecommendations.length > 0) {
      output += `${chalk.bold("TOP RECOMMENDATIONS:")}\n`;
      for (const recommendation of data.topRecommendations) {
        output += `  - ${recommendation}\n`;
      }
      output += "\n";
    }

    if (data.unanimousPoints && data.unanimousPoints.length > 0) {
      output += `${chalk.bold("UNANIMOUS POINTS:")}\n`;
      for (const point of data.unanimousPoints) {
        output += `  - ${point}\n`;
      }
      output += "\n";
    }

    // Next steps
    if (data.nextFeedbackNeeded) {
      const personaIds = data.personas.map((p) => p.id);
      const currentIndex = personaIds.indexOf(data.activePersonaId);
      // Logic duplicated here just for visualization display if needed, 
      // but strictly speaking we should rely on the data passed in.
      // The original code calculated nextPersonaId in visualizeFocusGroup only if it wasn't in data?
      // Actually original code called `this.selectNextPersona(data)` inside `visualizeFocusGroup`.
      // I should pass the next persona ID or object if possible, or replicate the logic slightly for display.
      
      // Better approach: The Logic class will calculate nextPersonaId and put it in data.
      // So here we just look it up.
      
      let nextPersonaId = data.nextPersonaId;
      if (!nextPersonaId) {
          // Fallback if not computed yet
          const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % personaIds.length;
          nextPersonaId = personaIds[nextIndex];
      }

      const nextPersona = data.personas.find((p) => p.id === nextPersonaId);

      if (nextPersona) {
        output += `${chalk.blue("NEXT FEEDBACK:")}\n`;
        output += `  Next persona: ${nextPersona.name}\n`;

        if (data.suggestedFeedbackTypes && data.suggestedFeedbackTypes.length > 0) {
          output += `  Suggested feedback types: ${data.suggestedFeedbackTypes.join(", ")}\n`;
        }

        if (data.suggestedFocusArea) {
          output += `  Suggested focus area: ${data.suggestedFocusArea}\n`;
        }
      }
    }

    return output;
  }
}
