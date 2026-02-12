import chalk from "chalk";
import { ThoughtData } from "./types.js";

export function formatThought(thoughtData: ThoughtData): string {
  const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } =
    thoughtData;

  let prefix = "";
  let context = "";

  if (isRevision) {
    prefix = chalk.yellow("🔄 Revision");
    context = ` (revising thought ${revisesThought})`;
  } else if (branchFromThought) {
    prefix = chalk.green("🌿 Branch");
    context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
  } else {
    prefix = chalk.blue("💭 Thought");
    context = "";
  }

  const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
  const border = "─".repeat(Math.max(header.length, thought.length) + 4);

  return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
}
