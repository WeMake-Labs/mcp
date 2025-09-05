# Multimodal Synthesizer MCP Server

A specialized tool for combining text snippets and image descriptions into unified, coherent summaries for multimodal
content analysis.

## Core Concepts

### Multimodal Input Processing

The server processes two types of input data:

- **Text Arrays**: Collections of text snippets, descriptions, or content fragments
- **Image Arrays**: Collections of image descriptions, captions, or visual content summaries

Example input structure:

```json
{
  "text": [
    "Product description: High-quality wireless headphones",
    "Customer review: Excellent sound quality and comfort",
    "Technical specs: Bluetooth 5.0, 30-hour battery life"
  ],
  "images": [
    "Image shows sleek black headphones on white background",
    "Close-up of comfortable ear cushions and adjustable headband",
    "Charging case with LED battery indicator"
  ]
}
```

### Synthesis Process

The synthesis combines textual and visual information into a unified summary that:

- Preserves key information from both modalities
- Creates coherent narrative flow
- Maintains context relationships between text and images
- Provides structured output for further processing

Example output:

```json
{
  "summary": "Product description: High-quality wireless headphones Customer review: Excellent sound quality and comfort Technical specs: Bluetooth 5.0, 30-hour battery life | Images: Image shows sleek black headphones on white background, Close-up of comfortable ear cushions and adjustable headband, Charging case with LED battery indicator"
}
```

## API

### Tools

- **multimodalSynth**
  - Combines text and image descriptions into unified summaries
  - Input: Multimodal data structure
    - `text` (string[]): Array of text snippets or descriptions
    - `images` (string[]): Array of image descriptions or captions
  - Returns: JSON object containing synthesized summary
  - Use cases:
    - Product catalog generation
    - Content analysis and summarization
    - Multimodal document processing
    - Research data synthesis
    - Marketing content creation

## Setup

### bunx

```json
{
  "mcpServers": {
    "Multimodal Synthesizer": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/multimodal-synthesizer@alpha"]
    }
  }
}
```

#### bunx with custom settings

The server can be configured using the following environment variables:

```json
{
  "mcpServers": {
    "Multimodal Synthesizer": {
      "command": "bunx",
      "args": ["-y", "@wemake.cx/multimodal-synthesizer@alpha"],
      "env": {
        "MAX_TEXT_ITEMS": "50",
        "MAX_IMAGE_ITEMS": "20",
        "SYNTHESIS_FORMAT": "structured"
      }
    }
  }
}
```

- `MAX_TEXT_ITEMS`: Maximum number of text items to process (default: 100)
- `MAX_IMAGE_ITEMS`: Maximum number of image descriptions to process (default: 50)
- `SYNTHESIS_FORMAT`: Output format - "simple" | "structured" | "detailed" (default: "simple")

## System Prompt

The prompt for utilizing multimodal synthesis should encourage comprehensive content integration:

```markdown
Follow these steps for multimodal synthesis:

1. Content Collection:
   - Gather all relevant text snippets and descriptions
   - Collect image descriptions, captions, or visual summaries
   - Ensure content is properly categorized by modality
   - Validate input format and completeness

2. Synthesis Planning:
   - Identify key themes and concepts across modalities
   - Determine logical flow and narrative structure
   - Plan integration points between text and visual content
   - Consider context preservation requirements

3. Content Integration:
   - Combine textual and visual information coherently
   - Maintain semantic relationships between elements
   - Preserve important details from both modalities
   - Create unified narrative or summary structure

4. Quality Assurance:
   - Verify all input content is represented
   - Check for logical flow and coherence
   - Ensure no critical information is lost
   - Validate output format and structure

5. Output Optimization:
   - Format results for intended use case
   - Optimize for readability and comprehension
   - Include metadata or structure as needed
   - Prepare for downstream processing if required
```

## Usage Examples

### Product Catalog Synthesis

Combine product descriptions, specifications, and image descriptions to create comprehensive product summaries for
e-commerce platforms.

### Research Data Integration

Synthesize textual research findings with visual data representations, charts, and diagrams for comprehensive research
reports.

### Content Marketing

Integrate marketing copy with visual asset descriptions to create cohesive campaign summaries and content briefs.

### Document Processing

Process multimodal documents containing both text and images to create unified summaries for indexing and search.

### Educational Content

Combine textual explanations with visual aids and diagrams to create comprehensive learning material summaries.
