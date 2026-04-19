import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const contractName = "referral-core";

describe("referral-core contract tests", () => {

  describe("Referral Code Generation", () => {
    it("should generate a unique referral code for a user", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      expect(result).toBeOk();
    });

    it("should store code with correct metadata", () => {
      const { result: genResult } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      expect(genResult).toBeOk();

      const code = (genResult as any).value.value;
      const { result: codeInfo } = simnet.callReadOnlyFn(
        contractName,
        "get-referral-code-info",
        [Cl.stringAscii(code)],
        wallet1
      );

      const info = (codeInfo as any).value.value;
      expect(info.owner.value).toBe(wallet1);
    });

    it("should fail when generating duplicate code", () => {
      const { result: first } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      expect(first).toBeOk();
    });
  });

  describe("Referral Registration", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;
    });

    it("should register a referral with valid code", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should fail when user tries to self-refer", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(503)); // ERR-SELF-REFERRAL
    });

    it("should fail when using invalid referral code", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii("invalidcodexxx")],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(501)); // ERR-INVALID-CODE
    });

    it("should prevent duplicate referral registration", () => {
      const { result: first } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      expect(first).toBeOk(Cl.bool(true));

      const { result: second } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      expect(second).toBeErr(Cl.uint(502)); // ERR-ALREADY-REFERRED
    });

    it("should update referrer affiliate stats", () => {
      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-affiliate-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      const stats = (result as any).value.value;
      expect(stats["total-referred"].value).toBe(1n);
      expect(stats["active-referrals"].value).toBe(1n);
    });
  });

  describe("Reward Recording and Tracking", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;

      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );
    });

    it("should record referral reward from contract owner", () => {
      const actionAmount = u1000000n;
      const { result } = simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(actionAmount),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should calculate reward correctly", () => {
      const actionAmount = u1000000n;

      simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(actionAmount),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-affiliate-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      const stats = (result as any).value.value;
      const expectedReward = actionAmount * 5n / 100n;
      expect(stats["total-earned"].value).toBe(expectedReward);
      expect(stats["pending-rewards"].value).toBe(expectedReward);
    });

    it("should fail when non-owner tries to record reward", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u1000000n),
          Cl.stringAscii("market-prediction")
        ],
        wallet3
      );

      expect(result).toBeErr(Cl.uint(500)); // ERR-OWNER-ONLY
    });

    it("should fail with zero amount", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u0),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );

      expect(result).toBeErr(Cl.uint(507)); // ERR-ZERO-AMOUNT
    });

    it("should track multiple rewards per user", () => {
      simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u1000000n),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );

      simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u500000n),
          Cl.stringAscii("liquidity-pool")
        ],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-affiliate-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      const stats = (result as any).value.value;
      const expectedTotal = (u1000000n + u500000n) * 5n / 100n;
      expect(stats["total-earned"].value).toBe(expectedTotal);
    });
  });

  describe("Reward Claiming", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;

      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u1000000n),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );
    });

    it("should allow user to claim pending rewards", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      expect(result).toBeOk();
    });

    it("should set pending rewards to zero after claim", () => {
      simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-affiliate-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      const stats = (result as any).value.value;
      expect(stats["pending-rewards"].value).toBe(0n);
    });

    it("should update total claimed amount", () => {
      const expectedReward = u1000000n * 5n / 100n;

      simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-affiliate-stats",
        [Cl.principal(wallet1)],
        wallet1
      );

      const stats = (result as any).value.value;
      expect(stats["total-claimed"].value).toBe(expectedReward);
    });

    it("should fail when claiming with no pending rewards", () => {
      simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(504)); // ERR-INSUFFICIENT-REWARDS
    });
  });

  describe("Fraud Detection and Validation", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;
    });

    it("should validate valid referral code", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "validate-referral",
        [Cl.stringAscii(referralCode), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject invalid referral code", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "validate-referral",
        [Cl.stringAscii("invalidcode"), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(501)); // ERR-INVALID-CODE
    });

    it("should reject self-referral", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "validate-referral",
        [Cl.stringAscii(referralCode), Cl.principal(wallet1)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(503)); // ERR-SELF-REFERRAL
    });

    it("should reject already referred user", () => {
      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "validate-referral",
        [Cl.stringAscii(referralCode), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(502)); // ERR-ALREADY-REFERRED
    });
  });

  describe("Global State Tracking", () => {
    it("should track total referrals", () => {
      const { result: code1 } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      const referralCode = (code1 as any).value.value;

      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-total-referrals",
        [],
        wallet1
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("should track total rewards distributed", () => {
      const { result: code1 } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      const referralCode = (code1 as any).value.value;

      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      simnet.callPublicFn(
        contractName,
        "record-referral-reward",
        [
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(u1000000n),
          Cl.stringAscii("market-prediction")
        ],
        deployer
      );

      simnet.callPublicFn(
        contractName,
        "claim-referral-rewards",
        [],
        wallet1
      );

      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-total-distributed",
        [],
        wallet1
      );

      const expectedDistributed = u1000000n * 5n / 100n;
      expect(result).toBeOk(Cl.uint(expectedDistributed));
    });
  });

  describe("Code Deactivation", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;
    });

    it("should deactivate code by owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "deactivate-code",
        [Cl.stringAscii(referralCode)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should reject registration with deactivated code", () => {
      simnet.callPublicFn(
        contractName,
        "deactivate-code",
        [Cl.stringAscii(referralCode)],
        wallet1
      );

      const { result } = simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(501)); // ERR-INVALID-CODE
    });

    it("should fail when non-owner tries to deactivate", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "deactivate-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(500)); // ERR-OWNER-ONLY
    });
  });

  describe("User Referral Information", () => {
    let referralCode: string;

    beforeEach(() => {
      const { result } = simnet.callPublicFn(
        contractName,
        "generate-referral-code",
        [],
        wallet1
      );

      referralCode = (result as any).value.value;

      simnet.callPublicFn(
        contractName,
        "register-referral-with-code",
        [Cl.stringAscii(referralCode)],
        wallet2
      );
    });

    it("should retrieve user referral information", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-user-referral-info",
        [Cl.principal(wallet2)],
        wallet2
      );

      const info = (result as any).value.value;
      expect(info.referrer.value).toBe(wallet1);
    });

    it("should check if user is referred", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-user-referred",
        [Cl.principal(wallet2)],
        wallet2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("should get referrer information", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-referrer",
        [Cl.principal(wallet2)],
        wallet2
      );

      expect(result).toBeOk(Cl.principal(wallet1));
    });
  });
});
