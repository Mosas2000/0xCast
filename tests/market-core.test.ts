import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const contractName = "market-core";

describe("market-core contract tests", () => {

    describe("Market Creation", () => {
        it("should create a market successfully with valid parameters", () => {
            const question = "Will Bitcoin reach $100k by end of 2026?";
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 100;
            const resolutionDate = currentBlock + 200;

            const { result } = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii(question),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            expect(result).toBeOk(Cl.uint(0)); // First market ID should be 0

            // Verify market counter incremented
            const counter = simnet.callReadOnlyFn(
                contractName,
                "get-market-counter",
                [],
                deployer
            );
            expect(counter.result).toBeUint(1);
        });

        it("should fail when resolution-date is before end-date", () => {
            const question = "Invalid market";
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 200;
            const resolutionDate = currentBlock + 100; // Before end-date!

            const { result } = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii(question),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
        });
    });

    describe("Placing Stakes", () => {
        it("should allow placing YES stake on active market", () => {
            // Create market first
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 100;
            const resolutionDate = currentBlock + 200;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Test market for YES stake"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Place YES stake
            const stakeAmount = 1000000; // 1 STX in microSTX
            const { result } = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(stakeAmount)],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should allow placing NO stake on active market", () => {
            // Create market first
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 100;
            const resolutionDate = currentBlock + 200;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Test market for NO stake"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Place NO stake
            const stakeAmount = 2000000; // 2 STX in microSTX
            const { result } = simnet.callPublicFn(
                contractName,
                "place-no-stake",
                [Cl.uint(0), Cl.uint(stakeAmount)],
                wallet2
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail when placing stake after market end-date", () => {
            // Create market with very short duration
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Short duration market"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Mine blocks to pass end-date
            simnet.mineEmptyBlocks(10);

            // Try to place stake after end-date
            const { result } = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(1000000)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(107)); // ERR-MARKET-ENDED
        });

        it("should fail when placing stake on non-existent market", () => {
            const { result } = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(999), Cl.uint(1000000)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(101)); // ERR-MARKET-NOT-FOUND
        });
    });

    describe("Market Resolution", () => {
        it("should allow creator to resolve market with YES outcome", () => {
            // Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Market to resolve YES"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Mine blocks to pass resolution date
            simnet.mineEmptyBlocks(15);

            // Resolve market with YES outcome
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)], // OUTCOME-YES = 1
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should allow creator to resolve market with NO outcome", () => {
            // Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Market to resolve NO"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Mine blocks to pass resolution date
            simnet.mineEmptyBlocks(15);

            // Resolve market with NO outcome
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(2)], // OUTCOME-NO = 2
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should fail when non-creator tries to resolve market", () => {
            // Create market as deployer
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Market for auth test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Mine blocks to pass resolution date
            simnet.mineEmptyBlocks(15);

            // Try to resolve as wallet1 (not creator)
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should fail when resolving before resolution-date", () => {
            // Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 100;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Early resolution test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Try to resolve immediately (before resolution-date)
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(103)); // ERR-MARKET-NOT-ENDED
        });

        it("should fail when resolving with invalid outcome", () => {
            // Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Invalid outcome test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Mine blocks to pass resolution date
            simnet.mineEmptyBlocks(15);

            // Try to resolve with invalid outcome (3)
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(3)], // Invalid outcome
                deployer
            );

            expect(result).toBeErr(Cl.uint(104)); // ERR-INVALID-OUTCOME
        });
    });

    describe("Claiming Winnings", () => {
        it("should fail when claiming from unresolved market", () => {
            // Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 10;
            const resolutionDate = currentBlock + 20;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Unresolved claim test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            // Place stake
            simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(1000000)],
                wallet1
            );

            // Try to claim without resolving
            const { result } = simnet.callPublicFn(
                contractName,
                "claim-winnings",
                [Cl.uint(0)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(110)); // ERR-MARKET-NOT-RESOLVED
        });
    });

    describe("Complete Flow", () => {
        it("should handle complete market lifecycle: create → stake → resolve → claim", () => {
            // 1. Create market
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 20;
            const resolutionDate = currentBlock + 40;

            const createResult = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Will ETH flip BTC?"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                ],
                deployer
            );

            expect(createResult.result).toBeOk(Cl.uint(0));

            // 2. Multiple users place stakes
            const yesStake1 = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(3000000)], // 3 STX
                wallet1
            );
            expect(yesStake1.result).toBeOk(Cl.bool(true));

            const noStake1 = simnet.callPublicFn(
                contractName,
                "place-no-stake",
                [Cl.uint(0), Cl.uint(1000000)], // 1 STX
                wallet2
            );
            expect(noStake1.result).toBeOk(Cl.bool(true));

            // Verify pool size
            const poolSize = simnet.callReadOnlyFn(
                contractName,
                "get-market-pool-size",
                [Cl.uint(0)],
                deployer
            );
            expect(poolSize.result).toBeOk(Cl.uint(4000000)); // 4 STX total

            // 3. Mine blocks to pass resolution date
            simnet.mineEmptyBlocks(45);

            // 4. Resolve market with NO outcome
            const resolveResult = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(2)], // NO wins
                deployer
            );
            expect(resolveResult.result).toBeOk(Cl.bool(true));

            // 5. Loser (wallet1) tries to claim - should fail with no winnings
            const loserClaim = simnet.callPublicFn(
                contractName,
                "claim-winnings",
                [Cl.uint(0)],
                wallet1
            );
            expect(loserClaim.result).toBeErr(Cl.uint(109)); // ERR-NO-WINNINGS
        });
    });
});
