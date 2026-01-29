import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const lp1 = accounts.get("wallet_1")!;
const lp2 = accounts.get("wallet_2")!;

describe("Liquidity Pool Tests", () => {
    it("should create a new liquidity pool", () => {
        const marketId = 1;
        const initialStx = 100000000; // 100 STX

        const { result } = simnet.callPublicFn(
            "liquidity-pool",
            "create-pool",
            [Cl.uint(marketId), Cl.uint(initialStx)],
            deployer
        );
        expect(result).toBeOk(Cl.bool(true));

        const pool = simnet.callReadOnlyFn(
            "liquidity-pool",
            "get-pool",
            [Cl.uint(marketId)],
            deployer
        );
        expect(pool.result).toBeSome();
    });

    it("should allow adding liquidity", () => {
        const marketId = 1;
        simnet.callPublicFn("liquidity-pool", "create-pool", [Cl.uint(marketId), Cl.uint(100000000)], deployer);

        const { result } = simnet.callPublicFn(
            "liquidity-pool",
            "add-liquidity",
            [Cl.uint(marketId), Cl.uint(50000000)], // 50 STX
            lp1
        );
        expect(result).toBeOk(Cl.uint(50000000)); // Expected shares

        const lpBalance = simnet.callReadOnlyFn(
            "liquidity-pool",
            "get-lp-balance",
            [Cl.uint(marketId), Cl.principal(lp1)],
            deployer
        );
        expect(lpBalance.result).toBe(Cl.uint(50000000));
    });

    it("should allow removing liquidity", () => {
        const marketId = 1;
        simnet.callPublicFn("liquidity-pool", "create-pool", [Cl.uint(marketId), Cl.uint(100000000)], deployer);
        simnet.callPublicFn("liquidity-pool", "add-liquidity", [Cl.uint(marketId), Cl.uint(100000000)], lp1);

        const { result } = simnet.callPublicFn(
            "liquidity-pool",
            "remove-liquidity",
            [Cl.uint(marketId), Cl.uint(50000000)],
            lp1
        );
        expect(result).toBeOk(Cl.uint(50000000));
    });

    it("should calculate correct output amount (CPMM)", () => {
        const input = 100000;
        const reserveIn = 1000000;
        const reserveOut = 1000000;

        const { result } = simnet.callReadOnlyFn(
            "liquidity-pool",
            "get-output-amount",
            [Cl.uint(input), Cl.uint(reserveIn), Cl.uint(reserveOut)],
            deployer
        );
        // Rough calculation check: (100000 * 0.997 * 1000000) / (1000000 + 100000 * 0.997)
        expect(result).toBe(Cl.uint(90661));
    });
});

describe("Liquidity Rewards Tests", () => {
    it("should update pool tracking", () => {
        const { result } = simnet.callPublicFn(
            "liquidity-rewards",
            "update-pool",
            [Cl.uint(1)],
            deployer
        );
        expect(result).toBeOk(Cl.bool(true));
    });

    it("should allow claiming rewards", () => {
        const { result } = simnet.callPublicFn(
            "liquidity-rewards",
            "claim-rewards",
            [Cl.uint(1)],
            lp1
        );
        expect(result).toBeOk(Cl.uint(1000));
    });
});
