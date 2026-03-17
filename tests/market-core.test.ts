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
                    Cl.uint(1), // CATEGORY-CRYPTO
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
                    Cl.uint(1),
                ],
                deployer
            );

            expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
        });
    });

    describe("Market Categories", () => {
        it("should store category in market data", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 100;
            const resolutionDate = currentBlock + 200;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Crypto category market"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1), // CATEGORY-CRYPTO
                ],
                deployer
            );
            const createdAtBlock = simnet.blockHeight;

            const counter = simnet.callReadOnlyFn(
                contractName,
                "get-market-counter",
                [],
                deployer
            );
            const marketCount = Number(counter.result.value);
            const lastMarketId = marketCount - 1;

            const market = simnet.callReadOnlyFn(
                contractName,
                "get-market",
                [Cl.uint(lastMarketId)],
                deployer
            );

            expect(market.result).toBeSome(Cl.tuple({
                question: Cl.stringAscii("Crypto category market"),
                creator: Cl.standardPrincipal(deployer),
                category: Cl.uint(1),
                "end-date": Cl.uint(endDate),
                "resolution-date": Cl.uint(resolutionDate),
                "resolution-deadline": Cl.uint(resolutionDate + 1008),
                "total-yes-stake": Cl.uint(0),
                "total-no-stake": Cl.uint(0),
                status: Cl.uint(0),
                outcome: Cl.uint(0),
                "created-at": Cl.uint(createdAtBlock),
                "resolved-at": Cl.uint(0),
                "finalizes-at": Cl.uint(0),
                finalized: Cl.bool(false),
                "resolved-by": Cl.none(),
                "resolution-source": Cl.stringAscii(""),
            }));
        });

        it("should reject category 0", () => {
            const currentBlock = simnet.blockHeight;
            const { result } = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Invalid category test"),
                    Cl.uint(currentBlock + 100),
                    Cl.uint(currentBlock + 200),
                    Cl.uint(0),
                ],
                deployer
            );
            expect(result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
        });

        it("should reject category above 5", () => {
            const currentBlock = simnet.blockHeight;
            const { result } = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Invalid category test"),
                    Cl.uint(currentBlock + 100),
                    Cl.uint(currentBlock + 200),
                    Cl.uint(6),
                ],
                deployer
            );
            expect(result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
        });

        it("should index markets by category for filtering", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 100;
            const resolutionDate = currentBlock + 200;

            // Create 2 crypto markets and 1 sports market
            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Crypto market 1"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1), // CATEGORY-CRYPTO
                ],
                deployer
            );

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Sports market 1"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(2), // CATEGORY-SPORTS
                ],
                deployer
            );

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Crypto market 2"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1), // CATEGORY-CRYPTO
                ],
                deployer
            );

            // Verify category counts
            const cryptoCount = simnet.callReadOnlyFn(
                contractName,
                "get-market-category-count",
                [Cl.uint(1)],
                deployer
            );
            expect(cryptoCount.result).toBeUint(2);

            const sportsCount = simnet.callReadOnlyFn(
                contractName,
                "get-market-category-count",
                [Cl.uint(2)],
                deployer
            );
            expect(sportsCount.result).toBeUint(1);

            // Verify category index lookups
            const cryptoFirst = simnet.callReadOnlyFn(
                contractName,
                "get-market-by-category",
                [Cl.uint(1), Cl.uint(0)],
                deployer
            );
            expect(cryptoFirst.result).toBeSome(
                Cl.tuple({ "market-id": Cl.uint(0) })
            );

            const cryptoSecond = simnet.callReadOnlyFn(
                contractName,
                "get-market-by-category",
                [Cl.uint(1), Cl.uint(1)],
                deployer
            );
            expect(cryptoSecond.result).toBeSome(
                Cl.tuple({ "market-id": Cl.uint(2) })
            );
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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
                    Cl.uint(1),
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

    describe("Resolution Deadline", () => {
        it("should allow anyone to trigger auto-refund after the resolution deadline", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            const { result: createResult } = simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Abandoned market auto-refund"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                deployer
            );
            expect(createResult).toBeOk(Cl.uint(0));
            const createdAtBlock = simnet.blockHeight;

            simnet.callPublicFn(contractName, "place-yes-stake", [Cl.uint(0), Cl.uint(1_000_000)], wallet1);

            // Mine past resolution deadline (resolutionDate + abandonmentPeriod + 1)
            simnet.mineEmptyBlocks(10 + 1008 + 2);

            const { result } = simnet.callPublicFn(
                contractName,
                "trigger-auto-refund",
                [Cl.uint(0)],
                wallet2
            );
            expect(result).toBeOk(Cl.bool(true));
            const resolvedAtBlock = simnet.blockHeight;

            const market = simnet.callReadOnlyFn(contractName, "get-market", [Cl.uint(0)], deployer);
            expect(market.result).toBeSome(
                Cl.tuple({
                    question: Cl.stringAscii("Abandoned market auto-refund"),
                    creator: Cl.standardPrincipal(deployer),
                    category: Cl.uint(1),
                    "end-date": Cl.uint(endDate),
                    "resolution-date": Cl.uint(resolutionDate),
                    "resolution-deadline": Cl.uint(resolutionDate + 1008),
                    "total-yes-stake": Cl.uint(1_000_000),
                    "total-no-stake": Cl.uint(0),
                    status: Cl.uint(3),
                    outcome: Cl.uint(0),
                    "created-at": Cl.uint(createdAtBlock),
                    "resolved-at": Cl.uint(resolvedAtBlock),
                    "finalizes-at": Cl.uint(resolvedAtBlock),
                    finalized: Cl.bool(true),
                    "resolved-by": Cl.some(Cl.standardPrincipal(wallet2)),
                    "resolution-source": Cl.stringAscii("deadline-refund"),
                })
            );
        });

        it("should reject auto-refund trigger before the deadline", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Too early auto-refund"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                deployer
            );

            simnet.mineEmptyBlocks(12);

            const { result } = simnet.callPublicFn(
                contractName,
                "trigger-auto-refund",
                [Cl.uint(0)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(115)); // ERR-REFUND-NOT-ALLOWED
        });

        it("should reject creator resolution after the deadline", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 5;
            const resolutionDate = currentBlock + 10;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Late resolution blocked"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                deployer
            );

            // Mine to after deadline
            simnet.mineEmptyBlocks(10 + 1008 + 2);

            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(112)); // ERR-MARKET-ABANDONED
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
                    Cl.uint(1),
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

            // 4b. Wait out dispute window and finalize (claims gated until finalized)
            simnet.mineEmptyBlocks(150);
            const finalizeResult = simnet.callPublicFn(
                contractName,
                "finalize-market",
                [Cl.uint(0)],
                deployer
            );
            expect(finalizeResult.result).toBeOk(Cl.bool(true));

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
