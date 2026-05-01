/**
 * Contract Error Scenario Tests
 * 
 * Comprehensive error handling and edge case tests
 * to ensure contracts fail gracefully
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Contract Error Scenario Tests", () => {
  describe("Invalid Input Handling", () => {
    it("should reject market creation with invalid dates", () => {
      const currentBlock = simnet.blockHeight;

      // Resolution date before end date
      const result1 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Invalid dates"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 50), // Before end date
          Cl.uint(1),
        ],
        deployer
      );
      expect(result1.result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES

      // End date in the past
      const result2 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Past end date"),
          Cl.uint(Math.max(1, currentBlock - 10)),
          Cl.uint(currentBlock + 50),
          Cl.uint(1),
        ],
        deployer
      );
      expect(result2.result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
    });

    it("should reject invalid category values", () => {
      const currentBlock = simnet.blockHeight;

      // Category 0
      const result1 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Invalid category 0"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(0),
        ],
        deployer
      );
      expect(result1.result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY

      // Category > 5
      const result2 = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Invalid category 6"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(6),
        ],
        deployer
      );
      expect(result2.result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
    });

    it("should reject zero stake amounts", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Zero stake test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      const result = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(105)); // ERR-INVALID-AMOUNT
    });

    it("should reject invalid outcome values", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Invalid outcome test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(25);

      // Outcome 0 (NONE)
      const result1 = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(0)],
        deployer
      );
      expect(result1.result).toBeErr(Cl.uint(104)); // ERR-INVALID-OUTCOME

      // Outcome 3 (invalid)
      const result2 = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(3)],
        deployer
      );
      expect(result2.result).toBeErr(Cl.uint(104)); // ERR-INVALID-OUTCOME
    });
  });

  describe("Authorization Errors", () => {
    it("should reject non-creator resolution attempts", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Auth test market"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(25);

      const result = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should reject non-owner emergency operations", () => {
      const result = simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should reject unauthorized pause approvals", () => {
      const result = simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("unauthorized")],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(122)); // ERR-PAUSE-NOT-AUTHORIZED
    });
  });

  describe("State Transition Errors", () => {
    it("should reject stakes after market end date", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 5;
      const resolutionDate = currentBlock + 10;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Ended market test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(10);

      const result = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(107)); // ERR-MARKET-ENDED
    });

    it("should reject resolution before resolution date", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 100;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Early resolution test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      const result = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(103)); // ERR-MARKET-NOT-ENDED
    });

    it("should reject claims before finalization", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Claim before finalize"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet1
      );

      simnet.mineEmptyBlocks(25);

      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      // Try to claim before finalization
      const result = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(116)); // ERR-FINALIZATION-NOT-READY
    });

    it("should reject double claims", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Double claim test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet1
      );

      simnet.mineEmptyBlocks(25);

      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );

      // First claim succeeds
      const firstClaim = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(firstClaim.result).toBeOk(Cl.uint(2_000_000));

      // Second claim fails
      const secondClaim = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(secondClaim.result).toBeErr(Cl.uint(108)); // ERR-ALREADY-CLAIMED
    });
  });

  describe("Non-Existent Resource Errors", () => {
    it("should reject operations on non-existent markets", () => {
      // Stake on non-existent market
      const stake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(999), Cl.uint(1_000_000)],
        wallet1
      );
      expect(stake.result).toBeErr(Cl.uint(101)); // ERR-MARKET-NOT-FOUND

      // Resolve non-existent market
      const resolve = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(999), Cl.uint(1)],
        deployer
      );
      expect(resolve.result).toBeErr(Cl.uint(101)); // ERR-MARKET-NOT-FOUND

      // Claim from non-existent market
      const claim = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(999)],
        wallet1
      );
      expect(claim.result).toBeErr(Cl.uint(101)); // ERR-MARKET-NOT-FOUND
    });

    it("should reject claims with no position", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("No position claim test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(25);

      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );

      // wallet1 never staked
      const result = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(109)); // ERR-NO-WINNINGS
    });

    it("should reject claims from losing side", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Loser claim test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet1
      );

      simnet.mineEmptyBlocks(25);

      // YES wins
      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );

      // wallet1 staked NO but YES won
      const result = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(109)); // ERR-NO-WINNINGS
    });
  });

  describe("Emergency State Errors", () => {
    it("should reject operations while paused", () => {
      const currentBlock = simnet.blockHeight;

      // Register approver and pause
      simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("pause test")],
        wallet1
      );

      // Try to create market while paused
      const create = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Paused creation"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );
      expect(create.result).toBeErr(Cl.uint(119)); // ERR-CONTRACT-PAUSED
    });

    it("should reject resolution after deadline", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;
      const resolutionDeadline = resolutionDate + 1008;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Deadline test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      // Mine past deadline
      const blocksToMine = Math.max(0, resolutionDeadline - simnet.blockHeight);
      simnet.mineEmptyBlocks(blocksToMine);

      const result = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(112)); // ERR-MARKET-ABANDONED
    });

    it("should reject refund before deadline", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Early refund test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet1
      );

      simnet.mineEmptyBlocks(25);

      const result = simnet.callPublicFn(
        "market-core",
        "emergency-refund",
        [Cl.uint(0)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(115)); // ERR-REFUND-NOT-ALLOWED
    });
  });

  describe("Owner Transfer Errors", () => {
    it("should reject transfer to self", () => {
      const result = simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(deployer)],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(124)); // ERR-INVALID-NEW-OWNER
    });

    it("should reject claim before cooldown", () => {
      simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      // Try to claim immediately
      const result = simnet.callPublicFn(
        "market-core",
        "claim-ownership",
        [],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(125)); // ERR-OWNER-TRANSFER-COOLDOWN
    });

    it("should reject claim by wrong address", () => {
      simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      simnet.mineEmptyBlocks(1010);

      // wallet2 tries to claim (not the pending owner)
      const result = simnet.callPublicFn(
        "market-core",
        "claim-ownership",
        [],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });

    it("should reject cancel by non-owner", () => {
      simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      const result = simnet.callPublicFn(
        "market-core",
        "cancel-owner-transfer",
        [],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Edge Case Combinations", () => {
    it("should handle stake after resolution attempt", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Stake after resolve"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(25);

      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      // Try to stake after resolution
      const result = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(102)); // ERR-MARKET-ALREADY-RESOLVED
    });

    it("should handle multiple resolution attempts", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Double resolve"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.mineEmptyBlocks(25);

      // First resolution succeeds
      const first = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );
      expect(first.result).toBeOk(Cl.bool(true));

      // Second resolution fails
      const second = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(2)],
        deployer
      );
      expect(second.result).toBeErr(Cl.uint(102)); // ERR-MARKET-ALREADY-RESOLVED
    });
  });
});
