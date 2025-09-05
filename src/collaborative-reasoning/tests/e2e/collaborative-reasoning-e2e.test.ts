/**
 * End-to-end tests for complete collaborative reasoning workflows
 * Tests full system integration and real-world scenarios
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { CollaborativeReasoningServer } from "../../src/index.js";
import { mockCollaborativeReasoningData, TestHelpers, CONTRIBUTION_TYPES } from "../utils/test-data.js";
import type { CollaborativeReasoningData, Contribution } from "../../src/index.js";

describe("Collaborative Reasoning E2E Tests", () => {
  let collaborativeReasoningServer: CollaborativeReasoningServer;

  beforeEach(() => {
    collaborativeReasoningServer = new CollaborativeReasoningServer();
  });

  describe("Complete Workflow Scenarios", () => {
    test("should handle full collaborative reasoning session from start to finish", () => {
      // Stage 1: Problem Definition
      const problemDefinitionData: CollaborativeReasoningData = {
        sessionId: "e2e-session-001",
        topic: "How can we improve customer satisfaction in our e-commerce platform?",
        stage: "problem-definition",
        iteration: 1,
        nextContributionNeeded: true,
        activePersonaId: "ux-designer",
        personas: [
          {
            id: "ux-designer",
            name: "Sarah Chen",
            expertise: ["user experience", "interface design", "user research"],
            background: "Senior UX Designer with 8 years experience in e-commerce platforms",
            perspective: "Focus on user-centered design and accessibility",
            biases: ["design-first thinking", "perfectionism"],
            communication: {
              style: "visual",
              tone: "collaborative"
            }
          },
          {
            id: "data-analyst",
            name: "Marcus Rodriguez",
            expertise: ["data analysis", "customer analytics", "business intelligence"],
            background: "Data Analyst specializing in customer behavior and conversion optimization",
            perspective: "Data-driven decision making and measurable outcomes",
            biases: ["quantitative bias", "correlation assumptions"],
            communication: {
              style: "analytical",
              tone: "professional"
            }
          },
          {
            id: "product-manager",
            name: "Jennifer Kim",
            expertise: ["product strategy", "roadmap planning", "stakeholder management"],
            background: "Product Manager with experience in scaling e-commerce solutions",
            perspective: "Business value and strategic alignment",
            biases: ["feature creep tendency", "timeline optimism"],
            communication: {
              style: "strategic",
              tone: "decisive"
            }
          }
        ],
        contributions: [
          {
            personaId: "ux-designer",
            content:
              "We need to understand the current pain points in the user journey. Our recent usability tests show users struggle with the checkout process.",
            type: "observation",
            confidence: 0.85
          }
        ],
        disagreements: []
      };

      const stage1Result = collaborativeReasoningServer.processCollaborativeReasoning(problemDefinitionData);
      expect(stage1Result.isError).toBe(false);
      expect(stage1Result.content?.[0]?.text).toBeDefined();

      // Stage 2: Information Gathering
      const informationGatheringData: CollaborativeReasoningData = {
        ...problemDefinitionData,
        stage: "ideation",
        iteration: 2,
        activePersonaId: "data-analyst",
        contributions: [
          ...problemDefinitionData.contributions,
          {
            personaId: "data-analyst",
            content:
              "Looking at our analytics, we have a 68% cart abandonment rate, with 45% dropping off at the payment step. Mobile conversion is 23% lower than desktop.",
            type: "insight",
            confidence: 0.92
          },
          {
            personaId: "product-manager",
            content:
              "Our customer support tickets show recurring complaints about slow page load times and confusing navigation. We receive about 150 checkout-related tickets per week.",
            type: "observation",
            confidence: 0.88
          }
        ]
      };

      const stage2Result = collaborativeReasoningServer.processCollaborativeReasoning(informationGatheringData);
      expect(stage2Result.isError).toBe(false);
      expect(stage2Result.content?.[0]?.text).toBeDefined();

      // Stage 3: Analysis
      const analysisData: CollaborativeReasoningData = {
        ...informationGatheringData,
        stage: "critique",
        iteration: 3,
        activePersonaId: "ux-designer",
        contributions: [
          ...informationGatheringData.contributions,
          {
            personaId: "ux-designer",
            content:
              "The data confirms our UX hypothesis. The checkout flow has too many steps and lacks clear progress indicators. Mobile users face additional friction with form inputs.",
            type: "synthesis",
            confidence: 0.87
          },
          {
            personaId: "data-analyst",
            content:
              "Cross-referencing with our A/B test data, simplified checkout flows show 34% better conversion rates. However, we need to balance simplicity with security requirements.",
            type: "insight",
            confidence: 0.91
          }
        ],
        disagreements: [
          {
            topic: "checkout simplification priority",
            positions: [
              {
                personaId: "ux-designer",
                position: "Immediate checkout redesign needed",
                arguments: ["User testing shows clear pain points", "Competitive advantage opportunity"]
              },
              {
                personaId: "product-manager",
                position: "Gradual rollout preferred",
                arguments: ["Technical constraints exist", "Risk management approach"]
              }
            ]
          }
        ]
      };

      const stage3Result = collaborativeReasoningServer.processCollaborativeReasoning(analysisData);
      expect(stage3Result.isError).toBe(false);
      expect(stage3Result.content?.[0]?.text).toBeDefined();

      // Stage 4: Solution Generation
      const solutionGenerationData: CollaborativeReasoningData = {
        ...analysisData,
        stage: "integration",
        iteration: 4,
        activePersonaId: "product-manager",
        contributions: [
          ...analysisData.contributions,
          {
            personaId: "product-manager",
            content:
              "I propose a phased approach: Phase 1 - optimize mobile checkout forms, Phase 2 - implement guest checkout, Phase 3 - redesign full checkout flow with progress indicators.",
            type: "suggestion",
            confidence: 0.83
          },
          {
            personaId: "ux-designer",
            content:
              "We should also consider implementing auto-fill capabilities and social login options to reduce friction. A one-page checkout could increase mobile conversions significantly.",
            type: "suggestion",
            confidence: 0.89
          },
          {
            personaId: "data-analyst",
            content:
              "Based on industry benchmarks, these changes could potentially increase conversion by 15-25%. We should set up proper tracking to measure impact at each phase.",
            type: "insight",
            confidence: 0.86
          }
        ]
      };

      const stage4Result = collaborativeReasoningServer.processCollaborativeReasoning(solutionGenerationData);
      expect(stage4Result.isError).toBe(false);
      expect(stage4Result.content?.[0]?.text).toBeDefined();

      // Stage 5: Consensus Building
      const consensusBuildingData: CollaborativeReasoningData = {
        ...solutionGenerationData,
        stage: "decision",
        iteration: 5,
        nextContributionNeeded: false,
        activePersonaId: "ux-designer",
        contributions: [
          ...solutionGenerationData.contributions,
          {
            personaId: "ux-designer",
            content:
              "I agree with the phased approach. It allows us to validate improvements incrementally while managing technical risk.",
            type: "synthesis",
            confidence: 0.92
          },
          {
            personaId: "data-analyst",
            content:
              "The phased rollout will give us better data to optimize each step. I recommend A/B testing each phase with proper statistical significance.",
            type: "suggestion",
            confidence: 0.94
          },
          {
            personaId: "product-manager",
            content:
              "Consensus reached. We'll proceed with the three-phase checkout optimization, starting with mobile form improvements in Q1.",
            type: "synthesis",
            confidence: 0.95
          }
        ],
        disagreements: [] // Disagreements resolved
      };

      const stage5Result = collaborativeReasoningServer.processCollaborativeReasoning(consensusBuildingData);
      expect(stage5Result.isError).toBe(false);
      expect(stage5Result.content?.[0]?.text).toBeDefined();

      // Verify the complete workflow progression
      const allResults = [stage1Result, stage2Result, stage3Result, stage4Result, stage5Result];
      allResults.forEach((result, index) => {
        expect(result.isError).toBe(false);
        expect(result.content?.[0]?.text).toBeDefined();
        expect(result.content?.[0]?.text.length).toBeGreaterThan(50);

        // Each stage should build upon previous insights
        if (index > 0) {
          expect(result.content?.[0]?.text).toBeDefined();
        }
      });
    });

    test("should handle complex multi-persona disagreement resolution", () => {
      const complexDisagreementData: CollaborativeReasoningData = {
        sessionId: "e2e-disagreement-001",
        topic: "Should we prioritize AI automation or human oversight in our content moderation system?",
        stage: "critique",
        iteration: 3,
        nextContributionNeeded: true,
        activePersonaId: "ai-engineer",
        personas: [
          {
            id: "ai-engineer",
            name: "Dr. Alex Thompson",
            expertise: ["machine learning", "natural language processing", "AI ethics"],
            background: "AI Engineer with PhD in Computer Science, specializing in content moderation systems",
            perspective: "Technology-first approach with emphasis on scalability and efficiency",
            biases: ["automation bias", "technical optimism"],
            communication: {
              style: "technical",
              tone: "analytical"
            }
          },
          {
            id: "content-moderator",
            name: "Maria Santos",
            expertise: ["content policy", "community management", "cultural sensitivity"],
            background: "Senior Content Moderator with 6 years experience in social media platforms",
            perspective: "Human-centered approach emphasizing context and nuance",
            biases: ["human superiority in judgment", "risk aversion"],
            communication: {
              style: "empathetic",
              tone: "cautious"
            }
          },
          {
            id: "legal-counsel",
            name: "Robert Chen",
            expertise: ["digital law", "compliance", "risk management"],
            background: "Legal Counsel specializing in platform liability and content regulation",
            perspective: "Compliance-first approach with focus on legal risk mitigation",
            biases: ["regulatory conservatism", "liability aversion"],
            communication: {
              style: "formal",
              tone: "cautious"
            }
          },
          {
            id: "product-owner",
            name: "Lisa Park",
            expertise: ["product strategy", "user experience", "business metrics"],
            background: "Product Owner focused on user satisfaction and business growth",
            perspective: "Balance between user experience and business objectives",
            biases: ["user satisfaction priority", "growth optimization"],
            communication: {
              style: "strategic",
              tone: "balanced"
            }
          }
        ],
        contributions: [
          {
            personaId: "ai-engineer",
            content:
              "Our AI models can process 10,000 posts per minute with 94% accuracy. Human moderators can only handle 50 posts per hour. The scale difference is undeniable.",
            type: "insight",
            confidence: 0.95
          },
          {
            personaId: "content-moderator",
            content:
              "AI misses crucial context, cultural nuances, and sarcasm. That 6% error rate represents thousands of wrongly moderated posts daily, damaging user trust.",
            type: "concern",
            confidence: 0.88
          },
          {
            personaId: "legal-counsel",
            content:
              "Automated systems create liability risks. If AI makes discriminatory decisions, we face regulatory scrutiny. Human oversight provides legal defensibility.",
            type: "concern",
            confidence: 0.91
          },
          {
            personaId: "product-owner",
            content:
              "User complaints about moderation decisions have increased 40% since full automation. We need to balance efficiency with user satisfaction.",
            type: "observation",
            confidence: 0.87
          }
        ],
        disagreements: [
          {
            topic: "automation vs human judgment",
            positions: [
              {
                personaId: "ai-engineer",
                position: "AI should make final moderation decisions",
                arguments: ["Scale and efficiency", "94% accuracy rate", "Consistent application"]
              },
              {
                personaId: "content-moderator",
                position: "Humans should make final decisions",
                arguments: ["Context understanding", "Cultural nuances", "User trust"]
              }
            ]
          },
          {
            topic: "liability and compliance",
            positions: [
              {
                personaId: "legal-counsel",
                position: "Human oversight required for compliance",
                arguments: ["Legal defensibility", "Regulatory requirements", "Liability protection"]
              },
              {
                personaId: "ai-engineer",
                position: "Automated systems are sufficient",
                arguments: ["Consistent decision-making", "Audit trails", "Reduced human error"]
              }
            ]
          }
        ]
      };

      const result = collaborativeReasoningServer.processCollaborativeReasoning(complexDisagreementData);

      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toBeDefined();

      const responseText = result.content?.[0]?.text || "";

      // Should acknowledge multiple perspectives
      expect(responseText.toLowerCase()).toMatch(/ai|automation|human|oversight/);

      // Should address the disagreements constructively
      expect(responseText.length).toBeGreaterThan(200);

      // Should not favor one persona over others
      const personaNames = ["alex", "maria", "robert", "lisa"];
      const mentionCounts = personaNames.map(
        (name) => (responseText.toLowerCase().match(new RegExp(name, "g")) || []).length
      );

      // No single persona should dominate the response
      const maxMentions = Math.max(...mentionCounts);
      const minMentions = Math.min(...mentionCounts);
      expect(maxMentions - minMentions).toBeLessThan(5);
    });

    test("should handle iterative refinement across multiple sessions", () => {
      const baseSessionData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      const sessionResults = [];

      // Simulate 5 iterations of the same topic with evolving contributions
      for (let iteration = 1; iteration <= 5; iteration++) {
        const iterationData: CollaborativeReasoningData = {
          ...baseSessionData,
          sessionId: `iterative-session-${iteration}`,
          iteration,
          nextContributionNeeded: iteration < 5,
          contributions: [
            ...baseSessionData.contributions,
            {
              personaId: baseSessionData.personas[iteration % baseSessionData.personas.length]!.id,
              content: `Iteration ${iteration}: Building on previous insights, I believe we should consider the cumulative impact of our decisions.`,
              type: "synthesis",
              confidence: 0.7 + iteration * 0.05 // Increasing confidence over iterations
            }
          ]
        };

        const result = collaborativeReasoningServer.processCollaborativeReasoning(iterationData);
        sessionResults.push(result);

        expect(result.isError).toBe(false);
        expect(result.content?.[0]?.text).toBeDefined();
      }

      // Verify progression and consistency across iterations
      sessionResults.forEach((result, index) => {
        expect(result.isError).toBe(false);
        expect(result.content?.[0]?.text).toBeDefined();

        const responseLength = result.content?.[0]?.text.length || 0;
        expect(responseLength).toBeGreaterThan(50);

        // Later iterations should potentially be more refined
        if (index > 0) {
          expect(result.content?.[0]?.text).toBeDefined();
        }
      });
    });
  });

  describe("Real-world Scenario Simulations", () => {
    test("should handle enterprise decision-making scenario", () => {
      const enterpriseScenario: CollaborativeReasoningData = {
        sessionId: "enterprise-decision-001",
        topic: "Should our company adopt a hybrid work model or return to full office presence?",
        stage: "integration",
        iteration: 4,
        nextContributionNeeded: true,
        activePersonaId: "hr-director",
        personas: [
          {
            id: "ceo",
            name: "Michael Chen",
            expertise: ["strategic leadership", "business development", "organizational culture"],
            background: "CEO with 15 years experience scaling technology companies",
            perspective: "Focus on long-term business growth and competitive advantage",
            biases: ["growth orientation", "decisive leadership style"],
            communication: {
              style: "authoritative",
              tone: "strategic"
            }
          },
          {
            id: "hr-director",
            name: "Sarah Johnson",
            expertise: ["human resources", "employee engagement", "workplace culture"],
            background: "HR Director specializing in remote work policies and employee satisfaction",
            perspective: "Employee wellbeing and organizational culture preservation",
            biases: ["employee advocacy", "culture preservation"],
            communication: {
              style: "empathetic",
              tone: "collaborative"
            }
          },
          {
            id: "cfo",
            name: "David Kim",
            expertise: ["financial planning", "cost optimization", "risk management"],
            background: "CFO focused on operational efficiency and cost management",
            perspective: "Financial impact and operational efficiency",
            biases: ["cost consciousness", "risk aversion"],
            communication: {
              style: "analytical",
              tone: "pragmatic"
            }
          },
          {
            id: "tech-lead",
            name: "Emily Rodriguez",
            expertise: ["software development", "team management", "remote collaboration"],
            background: "Technical Lead with experience managing distributed development teams",
            perspective: "Technical feasibility and team productivity",
            biases: ["technical solutions", "team autonomy"],
            communication: {
              style: "technical",
              tone: "practical"
            }
          }
        ],
        contributions: [
          {
            personaId: "ceo",
            content:
              "Our competitors are using hybrid models to attract top talent. We risk losing our best people if we mandate full office return. Flexibility is now a competitive advantage.",
            type: "insight",
            confidence: 0.88
          },
          {
            personaId: "hr-director",
            content:
              "Employee surveys show 78% prefer hybrid work. Productivity metrics remained stable during remote work. However, new employee onboarding and mentorship suffer remotely.",
            type: "observation",
            confidence: 0.91
          },
          {
            personaId: "cfo",
            content:
              "Hybrid model could reduce office space costs by 30-40%. However, we need to invest in collaboration technology and may face coordination overhead costs.",
            type: "insight",
            confidence: 0.85
          },
          {
            personaId: "tech-lead",
            content:
              "Development teams are more productive remotely - fewer interruptions, flexible hours. But cross-team collaboration and innovation sessions work better in person.",
            type: "observation",
            confidence: 0.87
          }
        ],
        disagreements: [
          {
            topic: "investment in remote infrastructure",
            positions: [
              {
                personaId: "ceo",
                position: "Significant investment needed",
                arguments: ["Competitive advantage", "Employee satisfaction", "Long-term benefits"]
              },
              {
                personaId: "cfo",
                position: "Conservative investment approach",
                arguments: ["ROI concerns", "Budget constraints", "Uncertain returns"]
              }
            ]
          }
        ]
      };

      const result = collaborativeReasoningServer.processCollaborativeReasoning(enterpriseScenario);

      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toBeDefined();

      const responseText = result.content?.[0]?.text || "";

      // Should address business considerations
      expect(responseText.toLowerCase()).toMatch(/hybrid|work|office|remote|employee/);
      expect(responseText.length).toBeGreaterThan(150);

      // Should consider multiple stakeholder perspectives
      expect(responseText.toLowerCase()).toMatch(/cost|productivity|talent|culture/);
    });

    test("should handle technical architecture decision scenario", () => {
      const techArchitectureScenario: CollaborativeReasoningData = {
        sessionId: "tech-architecture-001",
        topic: "Should we migrate our monolithic application to microservices architecture?",
        stage: "critique",
        iteration: 3,
        nextContributionNeeded: true,
        activePersonaId: "senior-architect",
        personas: [
          {
            id: "senior-architect",
            name: "Dr. James Wilson",
            expertise: ["system architecture", "distributed systems", "scalability"],
            background: "Senior Architect with 12 years experience in large-scale system design",
            perspective: "Long-term architectural sustainability and scalability",
            biases: ["architectural purity", "over-engineering tendency"],
            communication: {
              style: "technical",
              tone: "thorough"
            }
          },
          {
            id: "devops-engineer",
            name: "Anna Petrov",
            expertise: ["infrastructure", "deployment", "monitoring"],
            background: "DevOps Engineer specializing in containerization and orchestration",
            perspective: "Operational complexity and deployment reliability",
            biases: ["operational simplicity", "reliability focus"],
            communication: {
              style: "practical",
              tone: "cautious"
            }
          },
          {
            id: "product-manager",
            name: "Carlos Martinez",
            expertise: ["product strategy", "feature delivery", "market timing"],
            background: "Product Manager focused on rapid feature delivery and market responsiveness",
            perspective: "Time-to-market and feature velocity",
            biases: ["speed over perfection", "customer-first thinking"],
            communication: {
              style: "business-focused",
              tone: "urgent"
            }
          }
        ],
        contributions: [
          {
            personaId: "senior-architect",
            content:
              "Our monolith is reaching scalability limits. Database bottlenecks and deployment coupling slow us down. Microservices would enable independent scaling and team autonomy.",
            type: "insight",
            confidence: 0.89
          },
          {
            personaId: "devops-engineer",
            content:
              "Microservices introduce significant operational complexity. We'd need service mesh, distributed tracing, and sophisticated monitoring. Our current team may not be ready.",
            type: "concern",
            confidence: 0.92
          },
          {
            personaId: "product-manager",
            content:
              "Migration would slow feature delivery for 6-9 months. We're in a competitive market where speed matters. Can we achieve our goals with targeted monolith optimizations?",
            type: "challenge",
            confidence: 0.86
          }
        ],
        disagreements: [
          {
            topic: "migration timeline vs feature delivery",
            positions: [
              {
                personaId: "senior-architect",
                position: "Comprehensive migration needed",
                arguments: ["Technical debt reduction", "Long-term scalability", "Architecture benefits"]
              },
              {
                personaId: "product-manager",
                position: "Minimal disruption preferred",
                arguments: ["Feature velocity", "Market timing", "Customer commitments"]
              }
            ]
          },
          {
            topic: "operational readiness",
            positions: [
              {
                personaId: "devops-engineer",
                position: "Team not ready for microservices",
                arguments: ["Operational complexity", "Monitoring challenges", "Skills gap"]
              },
              {
                personaId: "senior-architect",
                position: "Technical benefits outweigh concerns",
                arguments: ["Scalability gains", "Team learning opportunity", "Industry standard"]
              }
            ]
          }
        ]
      };

      const result = collaborativeReasoningServer.processCollaborativeReasoning(techArchitectureScenario);

      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toBeDefined();

      const responseText = result.content?.[0]?.text || "";

      // Should address technical considerations
      expect(responseText.toLowerCase()).toMatch(/microservices|monolith|architecture|scalability/);
      expect(responseText.length).toBeGreaterThan(150);

      // Should balance technical and business concerns
      expect(responseText.toLowerCase()).toMatch(/complexity|delivery|operational/);
    });
  });

  describe("Edge Cases and Error Recovery", () => {
    test("should handle session with no active persona", () => {
      const noActivePersonaData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      delete (noActivePersonaData as unknown as Record<string, unknown>)["activePersonaId"];

      const result = collaborativeReasoningServer.processCollaborativeReasoning(noActivePersonaData);

      // Should handle gracefully
      expect(result).toBeDefined();
      if (result.isError) {
        expect(result.content?.[0]?.text || "").toContain("active");
      } else {
        expect(result.content?.[0]?.text).toBeDefined();
      }
    });

    test("should handle session with mismatched persona references", () => {
      const mismatchedData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      mismatchedData.activePersonaId = "non-existent-persona";
      mismatchedData.contributions[0]!.personaId = "another-non-existent-persona";

      const result = collaborativeReasoningServer.processCollaborativeReasoning(mismatchedData);

      expect(result).toBeDefined();
      if (result.isError) {
        expect(result.content?.[0]?.text.toLowerCase()).toMatch(/persona|reference|found/);
      }
    });

    test("should handle extremely long session with many contributions", () => {
      const longSessionData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Add many contributions to simulate large dataset
      const contributionTypes = [...CONTRIBUTION_TYPES, "challenge", "synthesis"] as const;
      longSessionData.contributions = Array.from({ length: 50 }, (_, i) => ({
        personaId: longSessionData.personas?.[i % (longSessionData.personas?.length || 1)]?.id || "default-persona",
        content: `Large dataset contribution ${i}: This is a detailed analysis with substantial content.`,
        type: contributionTypes[i % contributionTypes.length] as Contribution["type"],
        confidence: 0.7 + (i % 3) * 0.1
      }));

      const startTime = Date.now();
      const result = collaborativeReasoningServer.processCollaborativeReasoning(longSessionData);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds under Bun

      if (!result.isError) {
        expect(result.content?.[0]?.text).toBeDefined();
        expect(result.content?.[0]?.text.length).toBeGreaterThan(100);
      }
    });

    test("should maintain consistency across rapid successive calls", () => {
      const baseData = TestHelpers.createMinimalValidData();
      const results = [];

      // Make 10 rapid calls with slight variations
      for (let i = 0; i < 10; i++) {
        const callData = TestHelpers.cloneTestData(baseData);
        callData.sessionId = `rapid-call-${i}`;
        callData.iteration = i + 1;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(callData);
        results.push(result);
      }

      // All calls should succeed
      results.forEach((result) => {
        expect(result.isError).toBe(false);
        expect(result.content?.[0]?.text).toBeDefined();
        expect(result.content?.[0]?.text.length).toBeGreaterThan(20);
      });

      // Results should be consistent in structure
      const responseLengths = results.map((r) => r.content?.[0]?.text.length || 0);
      const avgLength = responseLengths.reduce((a, b) => a + b, 0) / responseLengths.length;

      responseLengths.forEach((length) => {
        expect(Math.abs(length - avgLength)).toBeLessThan(avgLength * 0.5); // Within 50% of average
      });
    });
  });

  describe("Performance and Scalability", () => {
    test("should handle concurrent session processing", async () => {
      const concurrentSessions = Array.from({ length: 5 }, (_, i) => {
        const sessionData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        sessionData.sessionId = `concurrent-session-${i}`;
        return sessionData;
      });

      const startTime = Date.now();

      // Process all sessions concurrently
      const results = await Promise.all(
        concurrentSessions.map((sessionData) => collaborativeReasoningServer.processCollaborativeReasoning(sessionData))
      );

      const endTime = Date.now();

      // Should complete all sessions efficiently under Bun
      expect(endTime - startTime).toBeLessThan(1500); // 1.5s budget

      // All sessions should succeed
      results.forEach((result) => {
        expect(result.isError).toBe(false);
        expect(result.content?.[0]?.text).toBeDefined();
      });
    });

    test("should maintain performance with complex persona interactions", () => {
      const complexInteractionData: CollaborativeReasoningData = {
        sessionId: "complex-interaction-001",
        topic: "Multi-stakeholder strategic planning session",
        stage: "decision",
        iteration: 8,
        nextContributionNeeded: false,
        activePersonaId: "persona-0",
        personas: Array.from({ length: 8 }, (_, i) => ({
          id: `persona-${i}`,
          name: `Expert ${i}`,
          expertise: [`domain-${i}`, `skill-${i}-a`, `skill-${i}-b`],
          background: `Background for expert ${i} with extensive experience in their domain`,
          perspective: `Unique perspective ${i} based on their professional experience`,
          biases: [`bias-${i}-1`, `bias-${i}-2`],
          communication: {
            style: i % 2 === 0 ? "analytical" : "creative",
            tone: i % 3 === 0 ? "formal" : "collaborative"
          }
        })),
        contributions: Array.from({ length: 20 }, (_, i) => {
          const contributionTypes = [...CONTRIBUTION_TYPES, "challenge", "synthesis"] as const;
          return {
            personaId: `persona-${i % 8}`,
            content: `Contribution ${i}: This is a detailed analysis of the topic from perspective ${i % 8} with specific insights and recommendations.`,
            type: contributionTypes[i % contributionTypes.length] as (typeof contributionTypes)[number],
            confidence: 0.7 + (i % 3) * 0.1
          };
        }),
        disagreements: Array.from({ length: 3 }, (_, i) => ({
          topic: `disagreement-topic-${i}`,
          positions: [
            {
              personaId: `persona-${i}`,
              position: `Position A for disagreement ${i}`,
              arguments: [`Argument 1 for position A`, `Argument 2 for position A`]
            },
            {
              personaId: `persona-${i + 1}`,
              position: `Position B for disagreement ${i}`,
              arguments: [`Argument 1 for position B`, `Argument 2 for position B`]
            }
          ]
        }))
      };

      const startTime = Date.now();
      const result = collaborativeReasoningServer.processCollaborativeReasoning(complexInteractionData);
      const endTime = Date.now();

      expect(result.isError).toBe(false);
      expect(result.content?.[0]?.text).toBeDefined();
      expect(endTime - startTime).toBeLessThan(2000); // Should handle complexity efficiently

      const responseText = result.content?.[0]?.text || "";
      expect(responseText.length).toBeGreaterThan(200); // Should provide substantial response
    });
  });
});
