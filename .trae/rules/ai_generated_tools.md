---
alwaysApply: false
description: Enforce clear documentation for AI-generated tools and workflows.
---

# AI Generated Tools

What: Ensure all AI-generated tools and workflows are accompanied by clear documentation detailing their purpose,
limitations, and operational workflows.

Why: Clear documentation fosters understanding, trust, and maintainability, which are essential for effective
collaboration and quality assurance.

Good:

```python
# AI Tool: Data Processor
# Purpose: Transforms raw input data into structured output for analysis.
# Limitations: Assumes input data is clean and well-formatted.
# Workflow: 1. Validate input 2. Process data 3. Return output
def process_data(input_data):
    # Implementation here
```

Bad:

```python
# AI Tool: Processor
def process(input):
    # Some complex logic here
    pass
```
