/**
 * Contract Performance Benchmark Tests
 * 
 * Performance and stress tests to establish baselines
 * and ensure contracts can handle high load
 */

import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

describe("Contract Performance Benchmarks", () => {
  describe("Market Creation Performance", () => {
    it("should create 50 markets efficiently", () => {
      const currentBlock = simnet.blockHeight;
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const result = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Performance test market ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint((i % 5) + 1),
          ],
          deployer
        );
        expect(result.result).toBeOk(Cl.uint(i));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Created 50 markets in ${duration}ms`);
      console.log(`Average: ${(duration / 50).toFixed(2)}ms per market`);

      // Verify all markets were created
      const counter = simnet.callReadOnlyFn(
        "market-core",
        "get-market-counter",
        [],
        deployer
      );
      expect(counter.result).toBeUint(50);
    });

    it("should handle rapid market creation", () => {
      const currentBlock = simnet.blockHeight;
      const marketCount = 100;

      for (let i = 0; i < marketCount; i++) {
        const result = simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Rapid creation ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint(1),
          ],
          deployer
        );
        expect(result.result).toBeOk(Cl.uint(i));
      }

      const counter = simnet.callReadOnlyFn(
        "market-core",
        "get-market-counter",
        [],
        deployer
      );
      expect(counter.result).toBeUint(marketCount);
    });
  });

  describe("Staking Performance", () => {
    it("should handle 100 stakes on single market", () => {
      const currentBlock = simnet.blockHeight;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("High volume staking test"),
          Cl.uint(currentBlock + 500),
          Cl.uint(currentBlock + 1000),
          Cl.uint(1),
        ],
        deployer
      );

      const startTime = Date.now();
      const users = [wallet1, wallet2, wallet3, wallet4];

      // Place 100 stakes
      for (let i = 0; i < 100; i++) {
        const user = users[i % users.length];
        const isYes = i % 2 === 0;

        const result = simnet.callPublicFn(
          "market-core",
          isYes ? "place-yes-stake" : "place-no-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          user
        );
        expect(result.result).toBeOk(Cl.bool(true));
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Placed 100 stakes in ${duration}ms`);
      console.log(`Average: ${(duration / 100).toFixed(2)}ms per stake`);

      // Verify pool size
      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(100_000_000)); // 100 STX
    });

    it("should handle large stake amounts", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Large stake test"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );

      const largeAmount = BigInt("10000000000000"); // 10 million STX

      const result = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(largeAmount)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(largeAmount));
    });
  });

  describe("Resolution and Claiming Performance", () => {
    it("should handle resolution with many participants", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 50;
      const resolutionDate = currentBlock + 100;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Many participants resolution"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      // 20 users stake
      const users = [wallet1, wallet2, wallet3, wallet4];
      for (let i = 0; i < 20; i++) {
        const user = users[i % users.length];
        simnet.callPublicFn(
          "market-core",
          i % 2 === 0 ? "place-yes-stake" : "place-no-stake",
          [Cl.uint(0), Cl.uint((i + 1) * 1_000_000)],
          user
        );
      }

      // Mine to resolution
      simnet.mineEmptyBlocks(105);

      const startTime = Date.now();

      // Resolve market
      const resolveResult = simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)], // YES wins
        deployer
      );
      expect(resolveResult.result).toBeOk(Cl.bool(true));

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Resolved market with 20 participants in ${duration}ms`);
    });

    it("should handle multiple claims efficiently", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 20;
      const resolutionDate = currentBlock + 40;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Multiple claims test"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      // Users stake
      const users = [wallet1, wallet2, wallet3, wallet4];
      users.forEach((user) => {
        simnet.callPublicFn(
          "market-core",
          "place-yes-stake",
          [Cl.uint(0), Cl.uint(2_000_000)],
          user
        );
      });

      // Resolve
      simnet.mineEmptyBlocks(45);
      simnet.callPublicFn(
        "market-core",
        "resolve-market",
        [Cl.uint(0), Cl.uint(1)],
        deployer
      );

      // Finalize
      simnet.mineEmptyBlocks(150);
      simnet.callPublicFn(
        "market-core",
        "finalize-market",
        [Cl.uint(0)],
        deployer
      );

      const startTime = Date.now();

      // All users claim
      users.forEach((user) => {
        const claim = simnet.callPublicFn(
          "market-core",
          "claim-winnings",
          [Cl.uint(0)],
          user
        );
        expect(claim.result).toBeOk(Cl.uint(2_000_000));
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Processed ${users.length} claims in ${duration}ms`);
      console.log(`Average: ${(duration / users.length).toFixed(2)}ms per claim`);
    });
  });

  describe("Read Operation Performance", () => {
    it("should efficiently query market data", () => {
      const currentBlock = simnet.blockHeight;

      // Create 10 markets
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Query test market ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint(1),
          ],
          deployer
        );
      }

      const startTime = Date.now();

      // Query all markets
      for (let i = 0; i < 10; i++) {
        const market = simnet.callReadOnlyFn(
          "market-core",
          "get-market",
          [Cl.uint(i)],
          deployer
        );
        expect(market.result).toHaveProperty("type", "some");
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Queried 10 markets in ${duration}ms`);
      console.log(`Average: ${(duration / 10).toFixed(2)}ms per query`);
    });

    it("should efficiently query user positions", () => {
      const currentBlock = simnet.blockHeight;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Position query test"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );

      // Users stake
      const users = [wallet1, wallet2, wallet3, wallet4];
      users.forEach((user) => {
        simnet.callPublicFn(
          "market-core",
          "place-yes-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          user
        );
      });

      const startTime = Date.now();

      // Query all positions
      users.forEach((user) => {
        const position = simnet.callReadOnlyFn(
          "market-core",
          "get-user-position",
          [Cl.uint(0), Cl.standardPrincipal(user)],
          deployer
        );
        expect(position.result).toHaveProperty("type", "some");
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Queried ${users.length} positions in ${duration}ms`);
    });

    it("should efficiently query category counts", () => {
      const currentBlock = simnet.blockHeight;

      // Create markets in different categories
      for (let i = 0; i < 25; i++) {
        simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Category test ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint((i % 5) + 1),
          ],
          deployer
        );
      }

      const startTime = Date.now();

      // Query all category counts
      for (let category = 1; category <= 5; category++) {
        const count = simnet.callReadOnlyFn(
          "market-core",
          "get-market-category-count",
          [Cl.uint(category)],
          deployer
        );
        expect(count.result).toBeUint(5);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Queried 5 category counts in ${duration}ms`);
    });
  });

  describe("Emergency Operations Performance", () => {
    it("should handle emergency pause quickly", () => {
      // Register approver
      simnet.callPublicFn(
        "market-core",
        "set-emergency-approver",
        [Cl.standardPrincipal(wallet1), Cl.bool(true)],
        deployer
      );

      const startTime = Date.now();

      // Trigger pause
      simnet.callPublicFn(
        "market-core",
        "set-contract-paused",
        [Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "market-core",
        "approve-emergency-pause",
        [Cl.stringAscii("performance test pause")],
        wallet1
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Emergency pause completed in ${duration}ms`);

      // Verify paused
      const isPaused = simnet.callReadOnlyFn(
        "market-core",
        "is-contract-paused",
        [],
        deployer
      );
      expect(isPaused.result).toEqual({ type: "true" });
    });

    it("should handle auto-refund for abandoned market", () => {
      const currentBlock = simnet.blockHeight;
      const endDate = currentBlock + 10;
      const resolutionDate = currentBlock + 20;
      const resolutionDeadline = resolutionDate + 1008;

      // Create market
      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Auto-refund performance"),
          Cl.uint(endDate),
          Cl.uint(resolutionDate),
          Cl.uint(1),
        ],
        deployer
      );

      // 10 users stake
      const users = [wallet1, wallet2, wallet3, wallet4];
      for (let i = 0; i < 10; i++) {
        const user = users[i % users.length];
        simnet.callPublicFn(
          "market-core",
          i % 2 === 0 ? "place-yes-stake" : "place-no-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          user
        );
      }

      // Mine past deadline
      const blocksToMine = Math.max(0, resolutionDeadline - simnet.blockHeight);
      simnet.mineEmptyBlocks(blocksToMine);

      const startTime = Date.now();

      // Trigger auto-refund
      const triggerResult = simnet.callPublicFn(
        "market-core",
        "trigger-auto-refund",
        [Cl.uint(0)],
        wallet1
      );
      expect(triggerResult.result).toBeOk(Cl.bool(true));

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Auto-refund triggered in ${duration}ms`);
    });
  });

  describe("Stress Tests", () => {
    it("should handle maximum concurrent operations", () => {
      const currentBlock = simnet.blockHeight;

      // Create 10 markets
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Stress test market ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint((i % 5) + 1),
          ],
          deployer
        );
      }

      // Each user stakes on each market
      const users = [wallet1, wallet2, wallet3, wallet4];
      const startTime = Date.now();

      for (let marketId = 0; marketId < 10; marketId++) {
        users.forEach((user, userIndex) => {
          const isYes = (marketId + userIndex) % 2 === 0;
          simnet.callPublicFn(
            "market-core",
            isYes ? "place-yes-stake" : "place-no-stake",
            [Cl.uint(marketId), Cl.uint(1_000_000)],
            user
          );
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const totalOperations = 10 * users.length;

      console.log(`Completed ${totalOperations} stake operations in ${duration}ms`);
      console.log(`Average: ${(duration / totalOperations).toFixed(2)}ms per operation`);
    });

    it("should handle extreme pool sizes", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Extreme pool size test"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );

      // Place very large stakes
      const extremeAmount = BigInt("100000000000000"); // 100 million STX

      const result = simnet.callPublicFn(
        "market-core",
        "place-yes-stake",
        [Cl.uint(0), Cl.uint(extremeAmount)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.bool(true));

      const poolSize = simnet.callReadOnlyFn(
        "market-core",
        "get-market-pool-size",
        [Cl.uint(0)],
        deployer
      );
      expect(poolSize.result).toBeOk(Cl.uint(extremeAmount));
    });
  });

  describe("Baseline Metrics", () => {
    it("should establish baseline for market creation", () => {
      const currentBlock = simnet.blockHeight;
      const iterations = 10;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        simnet.callPublicFn(
          "market-core",
          "create-market",
          [
            Cl.stringAscii(`Baseline market ${i}`),
            Cl.uint(currentBlock + 100),
            Cl.uint(currentBlock + 200),
            Cl.uint(1),
          ],
          deployer
        );

        const end = Date.now();
        durations.push(end - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      console.log("\n=== Market Creation Baseline ===");
      console.log(`Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`Min: ${minDuration}ms`);
      console.log(`Max: ${maxDuration}ms`);
    });

    it("should establish baseline for staking", () => {
      const currentBlock = simnet.blockHeight;

      simnet.callPublicFn(
        "market-core",
        "create-market",
        [
          Cl.stringAscii("Staking baseline"),
          Cl.uint(currentBlock + 100),
          Cl.uint(currentBlock + 200),
          Cl.uint(1),
        ],
        deployer
      );

      const iterations = 10;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();

        simnet.callPublicFn(
          "market-core",
          "place-yes-stake",
          [Cl.uint(0), Cl.uint(1_000_000)],
          wallet1
        );

        const end = Date.now();
        durations.push(end - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);

      console.log("\n=== Staking Baseline ===");
      console.log(`Average: ${avgDuration.toFixed(2)}ms`);
      console.log(`Min: ${minDuration}ms`);
      console.log(`Max: ${maxDuration}ms`);
    });
  });
});
