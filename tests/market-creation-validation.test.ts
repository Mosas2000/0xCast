/**
 * Market Creation Validation Tests
 * 
 * Comprehensive tests for input validation on market creation parameters
 * Tests cover edge cases, boundary conditions, and security scenarios
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

describe("Market Creation Validation Tests", () => {
  describe("Question Length Validation", () => {
    it("should reject questions that are too short (< 10 characters)", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Short"),  // 5 characters
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(126)); // ERR-QUESTION-TOO-SHORT
    });

    it("should accept minimum valid question length (10 characters)", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("1234567890"),  // Exactly 10 characters
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should accept maximum valid question length (256 characters)", () => {
      const currentBlock = simnet.blockHeight;
      const maxQuestion = "a".repeat(256);
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii(maxQuestion),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should accept typical question length", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Will Bitcoin reach $150k by end of 2026?"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Market Duration Validation", () => {
    it("should reject market duration that is too short (< 6 blocks)", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 5),  // Only 5 blocks
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(128)); // ERR-MARKET-DURATION-TOO-SHORT
    });

    it("should accept minimum valid market duration (6 blocks)", () => {
      simnet.mineEmptyBlocks(150); // Reset rate limit
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 6),  // Exactly 6 blocks
          Cl.uint(currentBlock + 20),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should reject market duration that is too long (> 1 year)", () => {
      simnet.mineEmptyBlocks(150); // Reset rate limit
      const currentBlock = simnet.blockHeight;
      const oneYearPlus = 52561; // 52,560 + 1
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + oneYearPlus),
          Cl.uint(currentBlock + oneYearPlus + 100),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(129)); // ERR-MARKET-DURATION-TOO-LONG
    });

    it("should accept maximum valid market duration (1 year)", () => {
      simnet.mineEmptyBlocks(150); // Reset rate limit
      const currentBlock = simnet.blockHeight;
      const oneYear = 52560;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + oneYear),
          Cl.uint(currentBlock + oneYear + 100),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Resolution Window Validation", () => {
    it("should reject resolution window that is too short (< 6 blocks)", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 105),  // Only 5 blocks window
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(130)); // ERR-RESOLUTION-WINDOW-TOO-SHORT
    });

    it("should accept minimum valid resolution window (6 blocks)", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 106),  // Exactly 6 blocks window
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should reject resolution window that is too long (> 30 days)", () => {
      const currentBlock = simnet.blockHeight;
      const thirtyDaysPlus = 4321; // 4,320 + 1
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 100 + thirtyDaysPlus),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(131)); // ERR-RESOLUTION-WINDOW-TOO-LONG
    });

    it("should accept maximum valid resolution window (30 days)", () => {
      const currentBlock = simnet.blockHeight;
      const thirtyDays = 4320;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 100 + thirtyDays),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Total Duration Validation", () => {
    it("should reject total duration that exceeds maximum (> 1.5 years)", () => {
      const currentBlock = simnet.blockHeight;
      const oneAndHalfYearsPlus = 78841; // 78,840 + 1
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 50000),
          Cl.uint(currentBlock + oneAndHalfYearsPlus),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(132)); // ERR-TOTAL-DURATION-TOO-LONG
    });

    it("should accept maximum valid total duration (1.5 years)", () => {
      const currentBlock = simnet.blockHeight;
      const oneAndHalfYears = 78840;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 50000),
          Cl.uint(currentBlock + oneAndHalfYears),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });
  });

  describe("Category Validation", () => {
    it("should reject category 0", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(0),  // Invalid category
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
    });

    it("should reject category above 5", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(6),  // Invalid category
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
    });

    it("should accept all valid categories (1-5)", () => {
      const currentBlock = simnet.blockHeight;
      
      for (let category = 1; category <= 5; category++) {
        const result = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Category ${category} market`),
            Cl.uint(currentBlock + 100 + category),
            Cl.uint(currentBlock + 200 + category),
            Cl.uint(category),
          ],
          deployer
        );
        
        expect(result.result).toBeOk(Cl.uint(category - 1));
      }
    });
  });

  describe("Date Ordering Validation", () => {
    it("should reject end-date in the past", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(Math.max(1, currentBlock - 10)),  // Past date
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
    });

    it("should reject resolution-date before end-date", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(currentBlock + 200),
          Cl.uint(currentBlock + 100),  // Before end-date
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
    });

    it("should reject resolution-date equal to end-date", () => {
      const currentBlock = simnet.blockHeight;
      const sameDate = currentBlock + 100;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(sameDate),
          Cl.uint(sameDate),  // Same as end-date
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeErr(Cl.uint(130)); // ERR-RESOLUTION-WINDOW-TOO-SHORT (0 blocks)
    });
  });

  describe("Edge Cases and Security Scenarios", () => {
    it("should handle maximum valid parameters", () => {
      const currentBlock = simnet.blockHeight;
      const maxQuestion = "a".repeat(256);
      const oneYear = 52560;
      const thirtyDays = 4320;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii(maxQuestion),
          Cl.uint(currentBlock + oneYear),
          Cl.uint(currentBlock + oneYear + thirtyDays),
          Cl.uint(5),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should handle minimum valid parameters", () => {
      const currentBlock = simnet.blockHeight;
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("1234567890"),  // Min length
          Cl.uint(currentBlock + 6),      // Min duration
          Cl.uint(currentBlock + 12),     // Min window
          Cl.uint(1),
        ],
        deployer
      );
      
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should prevent integer overflow attempts", () => {
      const currentBlock = simnet.blockHeight;
      const maxUint = BigInt("340282366920938463463374607431768211455"); // u128 max
      
      const result = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question here"),
          Cl.uint(maxUint),
          Cl.uint(maxUint),
          Cl.uint(1),
        ],
        deployer
      );
      
      // Should fail validation (dates too far in future)
      expect(result.result).toBeErr(Cl.uint(129)); // ERR-MARKET-DURATION-TOO-LONG
    });

    it("should handle rapid sequential market creation with validation", () => {
      const currentBlock = simnet.blockHeight;
      
      for (let i = 0; i < 3; i++) {
        const result = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Rapid market ${i}`),
            Cl.uint(currentBlock + 100 + i),
            Cl.uint(currentBlock + 200 + i),
            Cl.uint((i % 5) + 1),
          ],
          deployer
        );
        
        expect(result.result).toBeOk(Cl.uint(i));
      }
    });

    it("should validate parameters from different users", () => {
      const currentBlock = simnet.blockHeight;
      
      // Valid market from deployer
      const result1 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Deployer market"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result1.result).toBeOk(Cl.uint(0));
      
      // Invalid market from wallet1 (too short question)
      const result2 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Short"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        wallet1
      );
      expect(result2.result).toBeErr(Cl.uint(126)); // ERR-QUESTION-TOO-SHORT
    });
  });

  describe("Boundary Condition Tests", () => {
    it("should test question length boundaries", () => {
      const currentBlock = simnet.blockHeight;
      
      // 9 characters - should fail
      const result1 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("123456789"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result1.result).toBeErr(Cl.uint(126));
      
      // 10 characters - should pass
      const result2 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("1234567890"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result2.result).toBeOk(Cl.uint(0));
      
      // 11 characters - should pass
      const result3 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("12345678901"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result3.result).toBeOk(Cl.uint(1));
    });

    it("should test market duration boundaries", () => {
      const currentBlock = simnet.blockHeight;
      
      // 5 blocks - should fail
      const result1 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question"),
          Cl.uint(currentBlock + 5),
          Cl.uint(currentBlock + 20),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result1.result).toBeErr(Cl.uint(128));
      
      // 6 blocks - should pass
      const result2 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question"),
          Cl.uint(currentBlock + 6),
          Cl.uint(currentBlock + 20),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result2.result).toBeOk(Cl.uint(0));
      
      // 7 blocks - should pass
      const result3 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Valid question"),
          Cl.uint(currentBlock + 7),
          Cl.uint(currentBlock + 20),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result3.result).toBeOk(Cl.uint(1));
    });
  });
});
