# Bias Detection MCP Server

A simple MCP server for detecting potentially biased language patterns in text using a basic word list approach.

## Core Concepts

### Bias Detection

The server identifies potentially biased language by scanning text for specific trigger words that often indicate
absolute statements or overgeneralizations. The detection focuses on:

- Absolute terms ("always", "never")
- Certainty claims ("obviously", "clearly")
- Universal quantifiers ("everyone", "no one")

Example detection:

```json
{
  "text": "Everyone knows that this approach never works",
  "biases": ["everyone", "never"]
}
```

### Bias Words List

The current implementation uses a predefined list of common bias indicators:

- **Absolute terms**: "always", "never"
- **Certainty markers**: "obviously", "clearly"
- **Universal quantifiers**: "everyone", "no one"

These words often signal overgeneralization or unsupported claims that may indicate biased thinking.

## API

### Tools

- **biasDetection**
  - Detects simplistic biased terms in text
  - Input: `text` (string)
    - `text` (string): Text content to analyze for potential bias indicators
  - Output: JSON object containing detected bias words
    - `biases` (string[]): Array of detected bias words found in the text
  - Returns empty array if no bias indicators are found
  - Case-insensitive matching against predefined word list

## Code Mode Usage

You can use the bias detection logic programmatically in your application:

```typescript
import { BiasDetectionClient } from "@wemake.cx/bias-detection";

const client = new BiasDetectionClient();
const result = await client.detectBias({ text: "This is obviously biased" });
console.log(result.biases); // ["obviously"]
```

## Setup

### bunx

```json
{
  "mcpServers": {
    "Bias Detection": {
      "command": "bunx",
      "args": ["@wemake.cx/bias-detection@latest"]
    }
  }
}
```

#### bunx with custom settings

The server currently uses a fixed bias word list and does not support environment variable configuration. Future
versions may include:

```json
{
  "mcpServers": {
    "Bias Detection": {
      "command": "bunx",
      "args": ["@wemake.cx/bias-detection@latest"],
      "env": {
        "BIAS_SENSITIVITY": "medium",
        "CUSTOM_BIAS_WORDS": "path/to/custom-words.json"
      }
    }
  }
}
```

- `BIAS_SENSITIVITY`: Detection sensitivity level (planned feature)
- `CUSTOM_BIAS_WORDS`: Path to custom bias word list (planned feature)

## System Prompt

The prompt for utilizing bias detection should encourage critical analysis of language patterns:

```markdown
Follow these steps for bias detection:

1. Text Analysis:
   - Submit text content for bias detection analysis
   - Review detected bias indicators in context
   - Consider whether flagged terms represent actual bias or legitimate usage

2. Critical Evaluation:
   - Examine detected bias words within their full context
   - Assess whether absolute statements are justified by evidence
   - Consider alternative, more nuanced phrasing options
   - Evaluate the impact of biased language on the message

3. Language Improvement:
   - Replace absolute terms with qualified statements when appropriate
   - Provide evidence or context for strong claims
   - Use inclusive language that acknowledges exceptions
   - Maintain precision while avoiding overgeneralization

4. Continuous Monitoring:
   - Regularly check important communications for bias indicators
   - Develop awareness of personal language patterns
   - Consider cultural and contextual factors in bias assessment
   - Balance bias detection with natural, effective communication
```
