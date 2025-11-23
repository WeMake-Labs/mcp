import { Parser } from "expr-eval";

try {
  const expr = "(a < b) && (b < c)";
  const vars = { a: 5, b: 10, c: 15 };
  const ast = Parser.parse(expr);
  const result = ast.evaluate(vars);
  console.log(`Expression: ${expr}`);
  console.log(`Result: ${result}`);
} catch (e) {
  console.log(`Error with &&: ${e.message}`);
}

try {
  const expr = "(a < b) and (b < c)";
  const vars = { a: 5, b: 10, c: 15 };
  const ast = Parser.parse(expr);
  const result = ast.evaluate(vars);
  console.log(`Expression: ${expr}`);
  console.log(`Result: ${result}`);
} catch (e) {
  console.log(`Error with and: ${e.message}`);
}
