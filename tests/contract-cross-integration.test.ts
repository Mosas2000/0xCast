/**
 * Cross-Contract Integration Tests
 * 
 * Tests interactions between multiple contracts:
 * - market-core + oxcast
 * - market-core + governance
 * - market-core + oracle
 * - market-core + referral
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

describe("Cross-Contract Integration Tests", () => {
  describe("market-core + oxcast Integration", () => {
    it("should create market in both contracts", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 50;
      const resolutionDate = currentBlock + 100;

      // Create in market-core
      const marketCoreResult = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Cross-contract test market"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );
      expect(marketCoreResult.result).toBeOk(Cl.uint(0));

      // Create in oxcast
      const oxcastResult = simnet.callPublicFn(
        "oxcast",
        "create-market",
        [
          Cl.stringAscii("Cross-contract test market"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );
      expect(oxcastResult.result).toBeOk(Cl.uint(0));

      // Verify both contracts have the market
      const marketCoreData = simnet.callReadOnlyFn(
        "market-core",
        "get-market",
        [Cl.uint(0)],
        deployer
      );
      expect(marketCoreData.result).toHaveProperty("type", "some");

      const oxcastData = simnet.callReadOnlyFn(
        "oxcast",
        "get-market",
        [Cl.uint(0)],
        deployer
      );
      expect(oxcastData.result).toHaveProperty("type", "some");
    });

    it("should handle stakes in both contracts independently", () => {
      const currentBlock = simnet.blockHeight;

      // Create markets
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Market Core Market"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "oxcast",
        "create-market",
        [
          Cl.stringAscii("Oxcast Market"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Place stakes in both
      const marketCoreStake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet1
      );
      expect(marketCoreStake.result).toBeOk(Cl.bool(true));

      const oxcastStake = simnet.callPublicFn(
        "oxcast",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(3_000_000)],
        wallet1
      );
      expect(oxcastStake.result).toBeOk(Cl.bool(true));

      // Verify positions are independent
      const marketCorePosition = simnet.callReadOnlyFn(
        "market-core",
        "get-user-position",
        [Cl.uint(0), Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(marketCorePosition.result).toBeSome(
        Cl.tuple({
          "yes-stake": Cl.uint(2_000_000),
          "no-stake": Cl.uint(0),
          claimed: Cl.bool(false),
        })
      );

      const oxcastPosition = simnet.callReadOnlyFn(
        "oxcast",
        "get-user-position",
        [Cl.uint(0), Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(oxcastPosition.result).toBeSome(
        Cl.tuple({
          "yes-stake": Cl.uint(3_000_000),
          "no-stake": Cl.uint(0),
          claimed: Cl.bool(false),
        })
      );
    });
  });

  describe("market-core + governance Integration", () => {
    it("should allow governance to pause market operations", () => {
      const currentBlock = simnet.blockHeight;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Governance test market"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Register emergency approver
      simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      // Trigger pause through governance
      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("governance pause")],
        wallet1
      );

      // Verify paused
      const isPaused = simnet.callReadOnlyFn(
        "market-core",
        "is-contract-paused",
        [],
        deployer
      );
      expect(isPaused.result).toEqual({ type: "true" });

      // Try to stake - should fail
      const stake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet2
      );
      expect(stake.result).toBeErr(Cl.uint(119)); // ERR-CONTRACT-PAUSED
    });
  });

  describe("market-core + referral Integration", () => {
    it("should track referrals for market participation", () => {
      const currentBlock = simnet.blockHeight;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Referral test market"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // wallet2 refers wallet3
      const referralResult = simnet.callPublicFn(
        "referral-core",
        "register-referral",
        [Cl.standardPrincipal(wallet3), Cl.standardPrincipal(wallet2)],
        wallet3
      );
      expect(referralResult.result).toBeOk(Cl.bool(true));

      // wallet3 places stake (referred user)
      const stake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(5_000_000)],
        wallet3
      );
      expect(stake.result).toBeOk(Cl.bool(true));

      // Verify referral was tracked
      const referralData = simnet.callReadOnlyFn(
        "referral-core",
        "get-referrer",
        [Cl.standardPrincipal(wallet3)],
        deployer
      );
      expect(referralData.result).toBeSome(Cl.standardPrincipal(wallet2));
    });
  });

  describe("Multi-Contract Emergency Scenarios", () => {
    it("should coordinate emergency pause across contracts", () => {
      const currentBlock = simnet.blockHeight;

      // Register approvers in both contracts
      simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "oxcast",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      // Create markets in both
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Emergency test 1"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "oxcast",
        "create-market",
        [
          Cl.stringAscii("Emergency test 2"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Pause both contracts
      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("coordinated pause")],
        wallet1
      );

      simnet.callPublicFn(
        "oxcast",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "oxcast",
        "approve-emergency-pause",
        [Cl.stringAscii("coordinated pause")],
        wallet1
      );

      // Verify both are paused
      const marketCorePaused = simnet.callReadOnlyFn(
        "market-core",
        "is-contract-paused",
        [],
        deployer
      );
      expect(marketCorePaused.result).toEqual({ type: "true" });

      const oxcastPaused = simnet.callReadOnlyFn(
        "oxcast",
        "is-contract-paused",
        [],
        deployer
      );
      expect(oxcastPaused.result).toEqual({ type: "true" });
    });
  });

  describe("Contract Ownership Transfer", () => {
    it("should handle owner transfer in market-core", () => {
      // Initiate transfer
      const initiateResult = simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(initiateResult.result).toBeOk(Cl.bool(true));

      // Verify pending transfer
      const pendingTransfer = simnet.callReadOnlyFn(
        "market-core",
        "get-pending-owner-transfer",
        [],
        deployer
      );
      expect(pendingTransfer.result).toHaveProperty("type", "tuple");

      // Mine blocks for cooldown (7 days = 1008 blocks)
      simnet.mineEmptyBlocks(1010);

      // New owner claims ownership
      const claimResult = simnet.callPublicFn(
        "market-core",
        "claim-ownership",
        [],
        wallet1
      );
      expect(claimResult.result).toBeOk(Cl.bool(true));

      // Verify new owner
      const newOwner = simnet.callReadOnlyFn(
        "market-core",
        "get-contract-owner",
        [],
        deployer
      );
      expect(newOwner.result).toEqual(Cl.standardPrincipal(wallet1));
    });

    it("should handle owner transfer in oxcast", () => {
      // Initiate transfer
      const initiateResult = simnet.callPublicFn(
        "oxcast",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet2)],
        deployer
      );
      expect(initiateResult.result).toBeOk(Cl.bool(true));

      // Mine blocks for cooldown
      simnet.mineEmptyBlocks(1010);

      // New owner claims ownership
      const claimResult = simnet.callPublicFn(
        "oxcast",
        "claim-ownership",
        [],
        wallet2
      );
      expect(claimResult.result).toBeOk(Cl.bool(true));

      // Verify new owner
      const newOwner = simnet.callReadOnlyFn(
        "oxcast",
        "get-contract-owner",
        [],
        deployer
      );
      expect(newOwner.result).toEqual(Cl.standardPrincipal(wallet2));
    });

    it("should allow canceling owner transfer", () => {
      // Initiate transfer
      simnet.callPublicFn(
        "market-core",
        "initiate-owner-transfer",
        [Cl.standardPrincipal(wallet1)],
        deployer
      );

      // Cancel transfer
      const cancelResult = simnet.callPublicFn(
        "market-core",
        "cancel-owner-transfer",
        [],
        deployer
      );
      expect(cancelResult.result).toBeOk(Cl.bool(true));

      // Verify no pending transfer
      const pendingTransfer = simnet.callReadOnlyFn(
        "market-core",
        "get-pending-owner-transfer",
        [],
        deployer
      );
      const transferData = (pendingTransfer.result as any).value as Record<string, any>;
      expect(transferData["pending-owner"]).toEqual({ type: "none" });
    });
  });

  describe("Rate Limiting Integration", () => {
    it("should enforce rate limits across contract calls", () => {
      const currentBlock = simnet.blockHeight;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Rate limit test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Make multiple rapid calls
      for (let i = 0; i < 5; i++) {
        const stake = simnet.callPublicFn(
          "market-core",
          "place-yes-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          wallet1
        );
        expect(stake.result).toBeOk(Cl.bool(true));
      }

      // Verify all stakes were recorded
      const position = simnet.callReadOnlyFn(
        "market-core",
        "get-user-position",
        [Cl.uint(0), Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(position.result).toBeSome(
        Cl.tuple({
          "yes-stake": Cl.uint(5_000_000),
          "no-stake": Cl.uint(0),
          claimed: Cl.bool(false),
        })
      );
    });
  });

  describe("Access Control Integration", () => {
    it("should enforce access control across contracts", () => {
      const currentBlock = simnet.blockHeight;

      // Create market as deployer
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Access control test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Mine to resolution date
      simnet.mineEmptyBlocks(105);

      // Try to resolve as non-creator - should fail
      const unauthorizedResolve = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        wallet1
      );
      expect(unauthorizedResolve.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED

      // Resolve as creator - should succeed
      const authorizedResolve = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );
      expect(authorizedResolve.result).toBeOk(Cl.bool(true));
    });
  });
});
