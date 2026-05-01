/**
 * End-to-End Contract Integration Tests
 * 
 * Comprehensive integration tests covering all contract interactions
 * and complete user flows across multiple contracts
 */

import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

describe("End-to-End Contract Integration Tests", () => {
  describe("Complete Market Lifecycle with Multiple Users", () => {
    it("should handle complete flow: create → multiple stakes → resolve → multiple claims", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 50;
      const resolutionDate = currentBlock + 100;

      // 1. Create market
      const createResult = simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Will BTC reach $150k in 2026?"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1), // CATEGORY-CRYPTO
        ],
        deployer
      );
      expect(createResult.result).toBeOk(Cl.uint(0));

      // 2. Multiple users place YES stakes
      const yesStake1 = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(5_000_000)], // 5 STX
        wallet1
      );
      expect(yesStake1.result).toBeOk(Cl.bool(true));

      const yesStake2 = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(3_000_000)], // 3 STX
        wallet2
      );
      expect(yesStake2.result).toBeOk(Cl.bool(true));

      // 3. Multiple users place NO stakes
      const noStake1 = simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(2_000_000)], // 2 STX
        wallet3
      );
      expect(noStake1.result).toBeOk(Cl.bool(true));

      const noStake2 = simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(1_000_000)], // 1 STX
        wallet4
      );
      expect(noStake2.result).toBeOk(Cl.bool(true));

      // 4. Verify pool size
      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(11_000_000)); // 11 STX total

      // 5. Mine blocks to pass resolution date
      simnet.mineEmptyBlocks(105);

      // 6. Resolve market with YES outcome
      const resolveResult = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)], // YES wins
        deployer
      );
      expect(resolveResult.result).toBeOk(Cl.bool(true));

      // 7. Wait out dispute window and finalize
      simnet.mineEmptyBlocks(150);
      const finalizeResult = simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );
      expect(finalizeResult.result).toBeOk(Cl.bool(true));

      // 8. Winners claim their winnings
      const claim1 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(claim1.result).toBeOk(Cl.uint(6_875_000)); // 5/8 of 11 STX

      const claim2 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet2
      );
      expect(claim2.result).toBeOk(Cl.uint(4_125_000)); // 3/8 of 11 STX

      // 9. Losers try to claim - should fail
      const loserClaim1 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet3
      );
      expect(loserClaim1.result).toBeErr(Cl.uint(109)); // ERR-NO-WINNINGS

      const loserClaim2 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet4
      );
      expect(loserClaim2.result).toBeErr(Cl.uint(109)); // ERR-NO-WINNINGS
    });

    it("should handle market with only YES stakes", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 20;
      const resolutionDate = currentBlock + 40;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("One-sided market"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(5_000_000)],
        wallet1
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(3_000_000)],
        wallet2
      );

      simnet.mineEmptyBlocks(45);

      const resolveResult = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)], // YES wins
        deployer
      );
      expect(resolveResult.result).toBeOk(Cl.bool(true));

      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );

      // Winners should get their stakes back
      const claim1 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(claim1.result).toBeOk(Cl.uint(5_000_000));

      const claim2 = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet2
      );
      expect(claim2.result).toBeOk(Cl.uint(3_000_000));
    });
  });

  describe("Multi-Market Interactions", () => {
    it("should handle multiple concurrent markets", () => {
      const currentBlock = simnet.blockHeight;

      // Create 3 markets
      for (let i = 0; i < 3; i++) {
        const createResult = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Market ${i + 1}`),
            Cl.uint(currentBlock + 50),
            Cl.uint(currentBlock + 100),
            Cl.uint(1),
          ],
          deployer
        );
        expect(createResult.result).toBeOk(Cl.uint(i));
      }

      // Users stake on different markets
      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet1
      );

      simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(1), Cl.uint(3_000_000)],
        wallet1
      );

      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(2), Cl.uint(1_000_000)],
        wallet1
      );

      // Verify market counter
      const counter = simnet.callReadOnlyFn(
        "market-core",
        "get-market-counter",
        [],
        deployer
      );
      expect(counter.result).toBeUint(3);
    });

    it("should handle user participating in multiple markets", () => {
      const currentBlock = simnet.blockHeight;

      // Create 2 markets
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Market A"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Market B"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(2),
        ],
        deployer
      );

      // wallet1 stakes on both markets
      const stake1 = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(5_000_000)],
        wallet1
      );
      expect(stake1.result).toBeOk(Cl.bool(true));

      const stake2 = simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(1), Cl.uint(3_000_000)],
        wallet1
      );
      expect(stake2.result).toBeOk(Cl.bool(true));

      // Verify stakes
      const position1 = simnet.callReadOnlyFn(
        "market-core",
        "get-user-position",
        [Cl.uint(0), Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(position1.result).toBeSome(
        Cl.tuple({
          "yes-stake": Cl.uint(5_000_000),
          "no-stake": Cl.uint(0),
          claimed: Cl.bool(false),
        })
      );

      const position2 = simnet.callReadOnlyFn(
        "market-core",
        "get-user-position",
        [Cl.uint(1), Cl.standardPrincipal(wallet1)],
        deployer
      );
      expect(position2.result).toBeSome(
        Cl.tuple({
          "yes-stake": Cl.uint(0),
          "no-stake": Cl.uint(3_000_000),
          claimed: Cl.bool(false),
        })
      );
    });
  });

  describe("Emergency Scenarios", () => {
    it("should handle emergency pause during active trading", () => {
      const currentBlock = simnet.blockHeight;

      // Register emergency approver
      simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Emergency test market"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );

      // Place initial stakes
      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet2
      );

      // Trigger emergency pause
      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("emergency pause test")],
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

      // Try to place stake while paused - should fail
      const pausedStake = simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet3
      );
      expect(pausedStake.result).toBeErr(Cl.uint(119)); // ERR-CONTRACT-PAUSED

      // Resume operations
      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(false)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-resume",
        [Cl.stringAscii("resume operations")],
        wallet1
      );

      // Verify resumed
      const isResumed = simnet.callReadOnlyFn(
        "market-core",
        "is-contract-paused",
        [],
        deployer
      );
      expect(isResumed.result).toEqual({ type: "false" });

      // Should be able to stake again
      const resumedStake = simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(1_000_000)],
        wallet3
      );
      expect(resumedStake.result).toBeOk(Cl.bool(true));
    });

    it("should handle abandoned market with auto-refund", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;
      const resolutionDeadline = resolutionDate + 1008;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Abandoned market"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      // Place stakes
      simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(3_000_000)],
        wallet1
      );

      simnet.callPublicFn(
        "market-core",
        "place-no-stake",
        [Cl.uint(0), Cl.uint(2_000_000)],
        wallet2
      );

      // Mine past resolution deadline
      const blocksToMine = Math.max(0, resolutionDeadline - simnet.blockHeight);
      simnet.mineEmptyBlocks(blocksToMine);

      // Trigger auto-refund
      const triggerResult = simnet.callPublicFn(
        "market-core",
        "trigger-auto-refund",
        [Cl.uint(0)],
        wallet3
      );
      expect(triggerResult.result).toBeOk(Cl.bool(true));

      // Users claim refunds
      const refund1 = simnet.callPublicFn(
        "market-core",
        "claim-refund",
        [Cl.uint(0)],
        wallet1
      );
      expect(refund1.result).toBeOk(Cl.uint(3_000_000));

      const refund2 = simnet.callPublicFn(
        "market-core",
        "claim-refund",
        [Cl.uint(0)],
        wallet2
      );
      expect(refund2.result).toBeOk(Cl.uint(2_000_000));
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle zero-stake attempts", () => {
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

      const zeroStake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(0)],
        wallet1
      );
      expect(zeroStake.result).toBeErr(Cl.uint(105)); // ERR-MARKET-STILL-ACTIVE
    });

    it("should handle double claim attempts", () => {
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

      // First claim should succeed
      const firstClaim = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(firstClaim.result).toBeOk(Cl.uint(2_000_000));

      // Second claim should fail
      const secondClaim = simnet.callPublicFn(
        "market-core",
        "claim-winnings",
        [Cl.uint(0)],
        wallet1
      );
      expect(secondClaim.result).toBeErr(Cl.uint(108)); // ERR-ALREADY-CLAIMED
    });

    it("should handle market with very large stakes", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Large stakes test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      const largeStake = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(1_000_000_000_000)], // 1 million STX
        wallet1
      );
      expect(largeStake.result).toBeOk(Cl.bool(true));

      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(1_000_000_000_000));
    });

    it("should handle rapid sequential stakes from same user", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Rapid stakes test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Place multiple stakes rapidly
      for (let i = 0; i < 5; i++) {
        const stake = simnet.callPublicFn(
          "market-core",
          "place-yes-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          wallet1
        );
        expect(stake.result).toBeOk(Cl.bool(true));
      }

      // Verify total stake
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

  describe("Category-Based Market Filtering", () => {
    it("should correctly index markets by category", () => {
      const currentBlock = simnet.blockHeight;

      // Create markets in different categories
      const categories = [1, 2, 3, 1, 2]; // Crypto, Sports, Politics, Crypto, Sports

      for (let i = 0; i < categories.length; i++) {
        simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Category ${categories[i]} Market ${i}`),
            Cl.uint(currentBlock + 50),
            Cl.uint(currentBlock + 100),
            Cl.uint(categories[i]),
          ],
          deployer
        );
      }

      // Verify category counts
      const cryptoCount = simnet.callReadOnlyFn(
        "market-core",
        "get-market-category-count",
        [Cl.uint(1)],
        deployer
      );
      expect(cryptoCount.result).toBeUint(2);

      const sportsCount = simnet.callReadOnlyFn(
        "market-core",
        "get-market-category-count",
        [Cl.uint(2)],
        deployer
      );
      expect(sportsCount.result).toBeUint(2);

      const politicsCount = simnet.callReadOnlyFn(
        "market-core",
        "get-market-category-count",
        [Cl.uint(3)],
        deployer
      );
      expect(politicsCount.result).toBeUint(1);
    });
  });

  describe("Performance and Stress Tests", () => {
    it("should handle many markets efficiently", () => {
      const marketCount = 20;

      for (let i = 0; i < marketCount; i++) {
        // Mine blocks every 5 markets to reset rate limit window
        if (i > 0 && i % 5 === 0) {
          simnet.mineEmptyBlocks(150); // Reset rate limit window
        }
        
        const currentBlock = simnet.blockHeight;
        const createResult = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Stress test market ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint((i % 5) + 1), // Rotate through categories
          ],
          deployer
        );
        expect(createResult.result).toBeOk(Cl.uint(i));
      }

      const counter = simnet.callReadOnlyFn(
        "market-core",
        "get-market-counter",
        [],
        deployer
      );
      expect(counter.result).toBeUint(marketCount);
    });

    it("should handle many users staking on same market", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Many users test"),
          Cl.uint(currentBlock + 50),
          Cl.uint(currentBlock + 100),
          Cl.uint(1),
        ],
        deployer
      );

      // Multiple users stake
      const users = [wallet1, wallet2, wallet3, wallet4];
      users.forEach((user, index) => {
        const stake = simnet.callPublicFn(
          "market-core",
          index % 2 === 0 ? "place-yes-stake" : "place-no-stake",
          [Cl.uint(0), Cl.uint((index + 1) * 1_000_000)],
          user
        );
        expect(stake.result).toBeOk(Cl.bool(true));
      });

      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(10_000_000)); // 1+2+3+4 = 10 STX
    });
  });
});
