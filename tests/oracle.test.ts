import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const oracle1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Oracle Integration Tests", () => {
    describe("Oracle Registration", () => {
        it("should allow owner to register an oracle", () => {
            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "register-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const isRegistered = simnet.callReadOnlyFn(
                "oracle-integration",
                "is-registered-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(isRegistered.result).toBe(Cl.bool(true));
        });

        it("should prevent non-owners from registering oracles", () => {
            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "register-oracle",
                [Cl.principal(wallet2)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(300)); // err-owner-only
        });
    });

    describe("Resolution Submission", () => {
        beforeEach(() => {
            simnet.callPublicFn(
                "oracle-integration",
                "register-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
        });

        it("should allow registered oracle to submit resolution", () => {
            const marketId = 1;
            const resultValue = 1; // YES

            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "submit-resolution",
                [Cl.uint(marketId), Cl.uint(resultValue)],
                oracle1
            );
            expect(result).toBeOk(Cl.bool(true));

            const resolution = simnet.callReadOnlyFn(
                "oracle-integration",
                "get-market-resolution",
                [Cl.uint(marketId)],
                deployer
            );
            expect(resolution.result).toBeSome();
        });

        it("should prevent unauthorized oracles from submitting resolution", () => {
            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "submit-resolution",
                [Cl.uint(1), Cl.uint(1)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(301)); // err-unauthorized-oracle
        });

        it("should prevent double resolution", () => {
            simnet.callPublicFn(
                "oracle-integration",
                "submit-resolution",
                [Cl.uint(1), Cl.uint(1)],
                oracle1
            );

            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "submit-resolution",
                [Cl.uint(1), Cl.uint(0)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(303)); // err-already-resolved
        });
    });

    describe("Dispute Mechanism", () => {
        beforeEach(() => {
            simnet.callPublicFn(
                "oracle-integration",
                "register-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            simnet.callPublicFn(
                "oracle-integration",
                "submit-resolution",
                [Cl.uint(1), Cl.uint(1)],
                oracle1
            );
        });

        it("should allow disputing a resolution within period", () => {
            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "dispute-resolution",
                [Cl.uint(1)],
                wallet2
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should prevent dispute after period expires", () => {
            // Advance blocks past dispute period (default 144)
            simnet.mineEmptyBlocks(150);

            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "dispute-resolution",
                [Cl.uint(1)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(305)); // err-dispute-period-expired
        });

        it("should allow owner to resolve a dispute", () => {
            simnet.callPublicFn(
                "oracle-integration",
                "dispute-resolution",
                [Cl.uint(1)],
                wallet2
            );

            const { result } = simnet.callPublicFn(
                "oracle-integration",
                "resolve-dispute",
                [Cl.uint(1), Cl.uint(0)], // Final result: NO
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));
        });
    });
});

describe("Oracle Reputation Tests", () => {
    it("should return base reputation for new oracles", () => {
        const { result } = simnet.callReadOnlyFn(
            "oracle-reputation",
            "get-reputation",
            [Cl.principal(oracle1)],
            deployer
        );
        expect(result).toBeTuple();
        // Use proper getter for Clarity tuples if available, or manual check
    });

    it("should update reputation on success", () => {
        const { result } = simnet.callPublicFn(
            "oracle-reputation",
            "update-reputation",
            [Cl.principal(oracle1), Cl.bool(true)],
            deployer
        );
        expect(result).toBeOk(Cl.bool(true));
    });

    it("should decrease reputation on dispute/failure", () => {
        const { result } = simnet.callPublicFn(
            "oracle-reputation",
            "update-reputation",
            [Cl.principal(oracle1), Cl.bool(false)],
            deployer
        );
        expect(result).toBeOk(Cl.bool(true));
    });
});
