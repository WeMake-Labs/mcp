# 💙 WeMake: Enterprise MCP Server Ecosystem

> **AI-First Enterprise Solutions for the German Market**

WeMake AI delivers production-ready [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) servers designed
for enterprise environments, with a focus on GDPR compliance, German healthcare standards, and zero-downtime deployment
on Cloudflare Workers.

Our MCP servers enable Large Language Models to securely access enterprise data sources, business tools, and AI agents
while maintaining the highest standards of security, privacy, and regulatory compliance.

## 🧠 Available MCP Servers

Our ecosystem includes specialized MCP servers organized into key cognitive and operational categories:

### 🎯 Decision & Analysis Frameworks

- **[Decision Framework](src/decision-framework/)** - Structured decision analysis with multiple frameworks (expected
  utility, multi-criteria, maximin, minimax regret, satisficing)
- **[Ethical Reasoning](src/ethical-reasoning/)** - Multi-framework ethical analysis (utilitarianism, deontology, virtue
  ethics, care ethics, social contract)
- **[Constraint Solver](src/constraint-solver/)** - Mathematical and logical constraint satisfaction validation
- **[Goal Tracker](src/goal-tracker/)** - Comprehensive goal lifecycle management with progress monitoring

### 🧩 Reasoning & Cognition

- **[Structured Argumentation](src/structured-argumentation/)** - Systematic dialectical reasoning with
  thesis-antithesis-synthesis progression
- **[Analogical Reasoning](src/analogical-reasoning/)** - Structured analogy construction and mapping for
  problem-solving
- **[Collaborative Reasoning](src/collaborative-reasoning/)** - Multi-persona expert collaboration simulation
- **[Sequential Thinking](src/sequential-thinking/)** - Step-by-step reasoning with logical dependency tracking
- **[Metacognitive Monitoring](src/metacognitive-monitoring/)** - Self-monitoring of knowledge boundaries and reasoning
  quality
- **[Scientific Method](src/scientific-method/)** - Systematic scientific inquiry and hypothesis testing framework

### 💾 Memory & Data Management

- **[Memory](src/memory/)** - Persistent knowledge graph for cross-session information retention
- **[Transaction Manager](src/transaction-manager/)** - ACID-compliant multi-step operation management with rollback
  support

### 🎨 Content & Media Processing

- **[Visual Reasoning](src/visual-reasoning/)** - Spatial reasoning and ASCII visualization for geometric analysis
- **[Multimodal Synthesizer](src/multimodal-synthesizer/)** - Text and image content integration and synthesis
- **[Narrative Planner](src/narrative-planner/)** - Three-act story structure planning with character development

### 🔍 Quality & Evaluation

- **[Focus Group](src/focus-group/)** - Multi-persona evaluation framework for MCP server assessment
- **[Bias Detection](src/bias-detection/)** - Language pattern analysis for bias identification

### 🏗️ Architecture Features

- **Bun-first Development**: Primary dev/runtime with Bun; Node/Workers-compatible builds that exclude Bun-only APIs
- **Enterprise Security**: GDPR compliance, audit logging, and least-privilege access patterns
- **TypeScript Native**: Full type safety backed by exhaustive JSDoc documentation
- **Cloudflare Workers Compatible**: Deploy via Worker-compatible bundles free of Bun-only APIs
- **Monorepo Architecture**: Unified workspace with automated testing and CI/CD

### 🚀 Code Mode Migration

We are currently migrating our MCP servers to a **Code Mode** architecture. This new pattern exposes tools as a
programmable TypeScript API, allowing LLMs to write code that interacts directly with our services rather than relying
solely on JSON-RPC tool calls.

- **Status:** 🚧 In Progress
- **Migrated Servers:** `sequential-thinking`, `metacognitive-monitoring`
- **Documentation:** See the detailed [MCP Code Mode Migration Guide](docs/MCP_CODE_MODE_MIGRATION.md) for architecture
  specs, step-by-step instructions, and performance benefits.

### 🚀 Quick Start

```sh
# Install dependencies
bun install

# Run a specific server (example: decision-framework)
cd src/decision-framework
bun run start

# Run tests
bun test

# Build all servers
bun run build
```

Each server includes comprehensive documentation, usage examples, and enterprise-grade security features. Visit
individual server directories for detailed setup and configuration instructions.

## 🤝 Enterprise Support

### Professional Services

- **Implementation Consulting**: Expert guidance for enterprise deployment
- **Custom Development**: Tailored MCP servers for specific requirements
- **Training & Workshops**: Team training on MCP and AI agent development
- **24/7 Support**: Enterprise-grade support with SLA guarantees

### Contact

- **Website**: [wemake.cx](https://wemake.cx)
- **Security Issues**: [security@wemake.cx](mailto:security@wemake.cx)

### Community

- **LinkedIn**: [WeMake](https://linkedin.com/company/wemake-cx)

## 📜 License

This project is licensed under MIT. See the [LICENSE](LICENSE) file for details.

### Enterprise Licensing

- **Open Source**: MIT for development and non-commercial use
- **Enterprise License**: Commercial license available for production deployments
- **Custom Licensing**: Tailored licensing for specific enterprise requirements

For enterprise licensing inquiries, contact: <licensing@wemake.cx>

---

<div align="center">
  <strong>Built with 💙 by WeMake for the German Enterprise Market</strong><br>
  <em>Empowering AI-First Organizations with Secure, Compliant, and Scalable Solutions</em>
</div>
