# WeMake AI Security Policy

## Enterprise Security Standards

WeMake AI maintains enterprise-grade security standards for all Model Context Protocol (MCP) server implementations, AI
agent integrations, and Cloudflare Workers deployments. Our security framework is designed to meet German and European
regulatory requirements, including GDPR, NIS2, and emerging AI governance standards.

## Supported Versions

We provide security updates for the following versions of our MCP server implementations:

| Version | Support Status | Security Updates | GDPR Compliance  | AI Safety      |
| ------- | -------------- | ---------------- | ---------------- | -------------- |
| 1.x.x   | ⚠️ TBA         | ⚠️ TBA           | ⚠️ TBA           | ⚠️ TBA         |
| < 1.0   | ❌ Deprecated  | ❌ None          | ❌ Non-compliant | ❌ Unsupported |

This Security Policy was last updated in August 2025 and applies to data subjects in the European Economic Area and
Switzerland.

## AI Security Framework

### Model Context Protocol (MCP) Security

- **Authentication & Authorization**: Multi-layered access controls with role-based permissions for MCP server
  interactions
- **Data Validation**: Strict input/output validation for all MCP tool calls and responses
- **Code Understanding & Review**: Prioritize security through comprehensive code review processes, as understanding
  code is more critical than generating it. Implement mandatory human review for AI-generated security-sensitive code
- **Sandboxing**: Isolated execution environments for AI agent operations
- **Audit Logging**: Comprehensive logging of all AI interactions for compliance and security monitoring
- **Rate Limiting**: Advanced throttling mechanisms to prevent abuse and ensure service availability

### Cloudflare Workers Security

- **Edge Security**: Leveraging Cloudflare's global security infrastructure
- **Zero Trust Architecture**: No implicit trust for any component or user
- **DDoS Protection**: Built-in protection against distributed denial-of-service attacks
- **TLS Encryption**: End-to-end encryption for all data in transit
- **Content Security Policy**: Strict CSP headers to prevent XSS and injection attacks

### GDPR & Data Protection

- **Data Minimization**: Collecting only necessary data for AI operations
- **Purpose Limitation**: Using data solely for specified, legitimate purposes
- **Storage Limitation**: Automatic data retention and deletion policies
- **Data Subject Rights**: Comprehensive support for access, rectification, and erasure requests
- **Privacy by Design**: Built-in privacy protections in all AI systems
- **Cross-Border Transfers**: Compliant data transfer mechanisms for global operations

## Vulnerability Reporting

### Responsible Disclosure

We encourage responsible disclosure of security vulnerabilities. Please report security issues to:

**Email**: [security@wemake.cx](mailto:security@wemake.cx)  
**PGP Key**: [Download public key](https://wemake.cx/.well-known/pgp-key.asc)  
**PGP Fingerprint**: `3DAA 7730 D3FB B35D D9B9 1E2C 3BF4 9577 F25A 95D5`  
**Response Time**: Initial acknowledgment within 24 hours

#### Safe Harbor

WeMake AI supports good-faith security research. If you comply with this policy and act responsibly,  
we will not pursue legal action for your research activities.

#### security.txt

Our security disclosure details are also published at:  
<https://wemake.cx/.well-known/security.txt>

### Reporting Guidelines

When reporting vulnerabilities, please include:

1. **Vulnerability Type**: Classification (e.g., AI safety, data privacy, infrastructure)
2. **Affected Components**: Specific MCP servers, AI agents, or infrastructure components
3. **Impact Assessment**: Potential business and security impact
4. **Reproduction Steps**: Detailed steps to reproduce the vulnerability
5. **Proof of Concept**: Non-destructive demonstration if applicable
6. **Suggested Remediation**: Proposed fixes or mitigations

### Security Response Process

1. **Acknowledgment** (24h): Confirmation of receipt and initial triage
2. **Investigation** (72h): Technical analysis and impact assessment
3. **Severity Classification**: CVSS v3.1 score mapping to Critical/High/Medium/Low
4. **Remediation** (Target SLAs): Critical ≤7d, High ≤14d, Medium ≤30d, Low ≤90d (best effort)
5. **Disclosure** (30–90d): Coordinated public disclosure after remediation
6. **Recognition**: Public acknowledgment of responsible reporters (with permission)

#### CVSS v3.1 Mapping (Guidance)

- Critical: 9.0–10.0
- High: 7.0–8.9
- Medium: 4.0–6.9
- Low: 0.1–3.9

## Technical and Organizational Measures

### Enterprise AI Security Controls

WeMake AI has implemented comprehensive technical and organizational measures appropriate for enterprise AI development
and MCP server operations:

#### Data Protection & Encryption

- **End-to-End Encryption**: AES-256 encryption for data at rest; TLS 1.2+/1.3 with strong cipher suites (AES-GCM-256 or
  ChaCha20-Poly1305) for data in transit
- **Key Management**: Hardware Security Modules (HSMs) for cryptographic key protection
- **Pseudonymization**: Advanced anonymization techniques for AI training data
- **Data Masking**: Dynamic data masking for development and testing environments

#### AI System Security

- **Model Integrity**: Cryptographic signatures for AI model verification
- **Prompt Injection Protection**: Advanced filtering and validation for AI inputs
- **Output Sanitization**: Comprehensive validation of AI-generated content
- **Adversarial Defense**: Protection against model poisoning and evasion attacks

#### Infrastructure Security

- **Zero Trust Network**: Micro-segmentation and continuous verification
- **Container Security**: Hardened container images with vulnerability scanning
- **Secrets Management**: Automated rotation and secure storage of credentials
- **Network Isolation**: Segregated environments for different security zones

#### Operational Security

- **Continuous Monitoring**: 24/7 security operations center (SOC) monitoring
- **Incident Response**: Automated threat detection and response capabilities
- **Backup & Recovery**: Automated, encrypted backups with tested recovery procedures
- **Business Continuity**: Disaster recovery plans with defined RTO/RPO objectives

#### Compliance & Governance

- **Regular Audits**: Quarterly security assessments and penetration testing
- **Compliance Monitoring**: Automated GDPR and regulatory compliance checking
- **Risk Assessment**: Continuous risk evaluation and mitigation strategies
- **Security Training**: Regular security awareness training for all personnel

### AI-Specific Risk Mitigation

Our security framework addresses unique risks in AI development, recognizing that code understanding is the primary
security challenge:

- **Code Comprehension Security**: Mandatory documentation explaining AI-generated code decisions and security
  implications
- **Review Quality Assurance**: Enhanced review processes for AI-generated code with focus on understanding over speed
- **Data Poisoning**: Robust data validation and provenance tracking
- **Model Extraction**: Protection against unauthorized model access and replication
- **Bias Detection**: Automated monitoring for algorithmic bias and fairness
- **Explainability**: Transparent AI decision-making processes for audit trails with emphasis on reviewer understanding
- **Human Oversight**: Mandatory human review for high-risk AI decisions with sufficient time for proper comprehension

---

_This Security Policy is regularly updated to address emerging threats in AI and enterprise security. Last updated:
August 2025_

## Contact & Support

For security-related inquiries, vulnerability reports, or compliance questions:

- **Security Team**: [security@wemake.cx](mailto:security@wemake.cx)
- **Compliance Officer**: [florentin@wemake.cx](mailto:florentin@wemake.cx)
- **Emergency Hotline**: Available 24/7 for critical security incidents

WeMake AI is committed to maintaining the highest standards of security and privacy in all our AI development and
deployment activities.
