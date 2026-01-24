import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

describe("Multi-Outcome Markets", () => {
  describe("Market Creation", () => {
    it("should create a multi-outcome market with valid parameters", () => {
      const outcomes = [
        "Lakers",
        "Celtics", 
        "Nuggets",
        "Warriors",
        "Other"
      ];
      
      const { result } = simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Who will win 2026 NBA Championship?"),
          Cl.list(outcomes.map(o => Cl.stringUtf8(o))),
          Cl.uint(1000), // end-date
          Cl.uint(1100)  // resolution-date
        ],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(1));
    });
    
    it("should fail with insufficient outcomes (less than 3)", () => {
      const { result } = simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Binary market?"),
          Cl.list([Cl.stringUtf8("Yes"), Cl.stringUtf8("No")]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(104)); // ERR-INSUFFICIENT-OUTCOMES
    });
    
    it("should fail with too many outcomes (more than 10)", () => {
      const outcomes = Array.from({ length: 11 }, (_, i) => `Outcome ${i + 1}`);
      
      const { result } = simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Too many outcomes"),
          Cl.list(outcomes.map(o => Cl.stringUtf8(o))),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(105)); // ERR-TOO-MANY-OUTCOMES
    });
    
    it("should fail when end-date is after resolution-date", () => {
      const { result } = simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Invalid dates"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(1100),
          Cl.uint(1000)
        ],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(106));
    });
  });
  
  describe("Staking", () => {
    it("should allow staking on specific outcome", () => {
      // Create market first
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([
            Cl.stringUtf8("A"),
            Cl.stringUtf8("B"),
            Cl.stringUtf8("C")
          ]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      // Stake on outcome 0
      const { result } = simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [
          Cl.uint(1),
          Cl.uint(0),
          Cl.uint(500000) // 0.5 STX
        ],
        user1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
    
    it("should fail when staking on invalid outcome index", () => {
      // Create market with 3 outcomes (0, 1, 2)
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([
            Cl.stringUtf8("A"),
            Cl.stringUtf8("B"),
            Cl.stringUtf8("C")
          ]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      // Try to stake on outcome 5 (doesn't exist)
      const { result } = simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [
          Cl.uint(1),
          Cl.uint(5),
          Cl.uint(500000)
        ],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(102)); // ERR-INVALID-OUTCOME
    });
    
    it("should accumulate stakes from multiple users", () => {
      // Create market
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([
            Cl.stringUtf8("A"),
            Cl.stringUtf8("B"),
            Cl.stringUtf8("C")
          ]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      // User1 stakes on outcome 0
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(0), Cl.uint(300000)],
        user1
      );
      
      // User2 also stakes on outcome 0
      const { result } = simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(0), Cl.uint(200000)],
        user2
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });
  
  describe("Resolution", () => {
    it("should allow creator to resolve market", () => {
      // Create and stake
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(10),
          Cl.uint(20)
        ],
        deployer
      );
      
      // Advance to resolution date
      simnet.mineEmptyBlocks(25);
      
      // Resolve
      const { result } = simnet.callPublicFn(
        "market-multi",
        "resolve-multi-market",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
    
    it("should fail when non-creator tries to resolve", () => {
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(10),
          Cl.uint(20)
        ],
        deployer
      );
      
      simnet.mineEmptyBlocks(25);
      
      const { result } = simnet.callPublicFn(
        "market-multi",
        "resolve-multi-market",
        [Cl.uint(1), Cl.uint(0)],
        user1
      );
      
      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });
  
  describe("Claiming", () => {
    it("should allow winner to claim proportional payout", () => {
      // Create market
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(10),
          Cl.uint(20)
        ],
        deployer
      );
      
      // Stake: user1 on outcome 0, user2 on outcome 1
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(0), Cl.uint(1000000)], // 1 STX
        user1
      );
      
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(1), Cl.uint(500000)], // 0.5 STX
        user2
      );
      
      // Resolve to outcome 0 (user1 wins)
      simnet.mineEmptyBlocks(25);
      simnet.callPublicFn(
        "market-multi",
        "resolve-multi-market",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );
      
      // User1 claims
      const { result } = simnet.callPublicFn(
        "market-multi",
        "claim-multi-winnings",
        [Cl.uint(1), Cl.uint(0)],
        user1
      );
      
      expect(result).toBeOk(Cl.uint(1500000)); // Gets 1.5 STX (all the pool)
    });
    
    it("should fail when non-winner tries to claim", () => {
      // Create and stake
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test market"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(10),
          Cl.uint(20)
        ],
        deployer
      );
      
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(1), Cl.uint(500000)],
        user2
      );
      
      // Resolve to outcome 0 (not user2's outcome)
      simnet.mineEmptyBlocks(25);
      simnet.callPublicFn(
        "market-multi",
        "resolve-multi-market",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );
      
      // User2 tries to claim
      const { result } = simnet.callPublicFn(
        "market-multi",
        "claim-multi-winnings",
        [Cl.uint(1), Cl.uint(1)],
        user2
      );
      
      expect(result).toBeErr(Cl.uint(115)); // Wrong outcome
    });
  });
  
  describe("Read-Only Functions", () => {
    it("should get market details", () => {
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Test question"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      const { result } = simnet.callReadOnlyFn(
        "market-multi",
        "get-multi-market",
        [Cl.uint(1)],
        deployer
      );
      
      expect(result).toBeSome();
    });
    
    it("should calculate outcome odds correctly", () => {
      // Create market and stake
      simnet.callPublicFn(
        "market-multi",
        "create-multi-market",
        [
          Cl.stringUtf8("Odds test"),
          Cl.list([Cl.stringUtf8("A"), Cl.stringUtf8("B"), Cl.stringUtf8("C")]),
          Cl.uint(1000),
          Cl.uint(1100)
        ],
        deployer
      );
      
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(0), Cl.uint(6000000)], // 6 STX on outcome 0
        user1
      );
      
      simnet.callPublicFn(
        "market-multi",
        "stake-on-outcome",
        [Cl.uint(1), Cl.uint(1), Cl.uint(4000000)], // 4 STX on outcome 1
        user2
      );
      
      // Check odds for outcome 0 (should be 60% = 6000 basis points)
      const { result } = simnet.callReadOnlyFn(
        "market-multi",
        "get-outcome-odds",
        [Cl.uint(1), Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeOk(Cl.uint(6000));
    });
  });
});
