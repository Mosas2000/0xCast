import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const oracle1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

const oracleContract = "oracle-integration";
const marketContract = "market-core";

type TestMarket = {
    marketId: number;
    endDate: number;
    resolutionDate: number;
};

function registerOracle() {
    simnet.callPublicFn(oracleContract, "register-oracle", [Cl.principal(oracle1)], deployer);
}

function createTestMarket(): TestMarket {
    const currentBlock = simnet.blockHeight;
    const endDate = currentBlock + 5;
    const resolutionDate = currentBlock + 10;
    const { result } = simnet.callPublicFn(
        marketContract,
        "create-market",
        [
            Cl.stringAscii("Will BTC hit 150k?"),
            Cl.uint(endDate),
            Cl.uint(resolutionDate),
            Cl.uint(1),
        ],
        deployer
    );

    // Each test runs in a fresh simnet instance, so the first market is always `u0`.
    expect(result).toBeOk(Cl.uint(0));
    const marketId = Number((result as any).value.value);
    return { marketId, endDate, resolutionDate };
}

function mineUntil(targetBlock: number) {
    const current = simnet.blockHeight;
    const blocksToMine = Math.max(0, targetBlock - current);
    if (blocksToMine > 0) {
        simnet.mineEmptyBlocks(blocksToMine);
    }
}

describe("Oracle Integration Tests", () => {
    describe("Oracle Registration", () => {
        it("should allow owner to register an oracle", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "register-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const isRegistered = simnet.callReadOnlyFn(
                oracleContract,
                "is-registered-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(isRegistered.result).toBeBool(true);
        });

        it("should prevent non-owners from registering oracles", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "register-oracle",
                [Cl.principal(wallet2)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(300));
        });

        it("should allow owner to remove an oracle", () => {
            registerOracle();

            const { result } = simnet.callPublicFn(
                oracleContract,
                "remove-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const isRegistered = simnet.callReadOnlyFn(
                oracleContract,
                "is-registered-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(isRegistered.result).toBeBool(false);
        });
    });

    describe("Oracle Source Configuration", () => {
        it("should allow owner to configure oracle source for a market", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "configure-oracle-source",
                [
                    Cl.uint(0),
                    Cl.stringAscii("redstone"),
                    Cl.stringAscii("BTC/USD"),
                    Cl.uint(150000),
                ],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const source = simnet.callReadOnlyFn(
                oracleContract,
                "get-oracle-source",
                [Cl.uint(0)],
                deployer
            );
            expect(source.result).toBeSome(
                Cl.tuple({
                    "oracle-type": Cl.stringAscii("redstone"),
                    "data-feed": Cl.stringAscii("BTC/USD"),
                    "threshold-price": Cl.uint(150000),
                    configured: Cl.bool(true),
                })
            );
        });

        it("should prevent non-owner from configuring oracle source", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "configure-oracle-source",
                [
                    Cl.uint(0),
                    Cl.stringAscii("redstone"),
                    Cl.stringAscii("BTC/USD"),
                    Cl.uint(150000),
                ],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(300));
        });
    });

    describe("Price Feed Submission", () => {
        beforeEach(() => {
            registerOracle();
            simnet.callPublicFn(
                oracleContract,
                "configure-oracle-source",
                [Cl.uint(0), Cl.stringAscii("redstone"), Cl.stringAscii("BTC/USD"), Cl.uint(150000)],
                deployer
            );
        });

        it("should allow registered oracle to submit price feed", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-price-feed",
                [Cl.uint(0), Cl.uint(155000)],
                oracle1
            );
            const submitBlock = simnet.blockHeight;
            expect(result).toBeOk(Cl.bool(true));

            const feed = simnet.callReadOnlyFn(
                oracleContract,
                "get-price-feed",
                [Cl.uint(0)],
                deployer
            );
            expect(feed.result).toBeSome(Cl.tuple({
                price: Cl.uint(155000),
                timestamp: Cl.uint(submitBlock),
                oracle: Cl.standardPrincipal(oracle1),
                confirmed: Cl.bool(true),
            }));
        });

        it("should reject zero price", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-price-feed",
                [Cl.uint(0), Cl.uint(0)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(313));
        });

        it("should reject unregistered oracle", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-price-feed",
                [Cl.uint(0), Cl.uint(155000)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(301));
        });

        it("should reject submission for unconfigured market", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-price-feed",
                [Cl.uint(999), Cl.uint(155000)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(314));
        });
    });

    describe("Resolution Submission", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
        });

        it("should allow registered oracle to submit resolution", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-resolution",
                [Cl.uint(marketId), Cl.uint(1)],
                oracle1
            );
            const resolvedBlock = simnet.blockHeight;
            expect(result).toBeOk(Cl.bool(true));

            const resolution = simnet.callReadOnlyFn(
                oracleContract,
                "get-market-resolution",
                [Cl.uint(marketId)],
                deployer
            );
            expect(resolution.result).toBeSome(Cl.tuple({
                oracle: Cl.standardPrincipal(oracle1),
                result: Cl.uint(1),
                "resolved-at": Cl.uint(resolvedBlock),
                finalized: Cl.bool(false),
                "dispute-end": Cl.uint(resolvedBlock + 144),
            }));
        });

        it("should prevent unauthorized oracles from submitting resolution", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-resolution",
                [Cl.uint(marketId), Cl.uint(1)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(301));
        });

        it("should prevent double resolution", () => {
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-resolution",
                [Cl.uint(marketId), Cl.uint(2)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(303));
        });

        it("should reject invalid result values", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-resolution",
                [Cl.uint(marketId), Cl.uint(0)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(304));
        });

        it("should update oracle stats on resolution", () => {
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);

            const stats = simnet.callReadOnlyFn(
                oracleContract,
                "get-oracle-stats",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(stats.result).toBeTuple({
                "total-resolutions": Cl.uint(1),
                "successful-resolutions": Cl.uint(0),
                "disputed-resolutions": Cl.uint(0),
            });
        });
    });

    describe("Auto-Resolution with Oracle", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(
                oracleContract,
                "configure-oracle-source",
                [Cl.uint(marketId), Cl.stringAscii("redstone"), Cl.stringAscii("BTC/USD"), Cl.uint(150000)],
                deployer
            );
        });

        it("should auto-resolve YES when price meets threshold", () => {
            simnet.callPublicFn(oracleContract, "submit-price-feed", [Cl.uint(0), Cl.uint(160000)], oracle1);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "auto-resolve-with-oracle",
                [Cl.uint(marketId)],
                oracle1
            );
            expect(result).toBeOk(Cl.uint(1));
        });

        it("should auto-resolve NO when price is below threshold", () => {
            simnet.callPublicFn(oracleContract, "submit-price-feed", [Cl.uint(0), Cl.uint(140000)], oracle1);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "auto-resolve-with-oracle",
                [Cl.uint(marketId)],
                oracle1
            );
            expect(result).toBeOk(Cl.uint(2));
        });
    });

    describe("Resolution Finalization", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);
        });

        it("should reject finalization during dispute period", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "finalize-resolution",
                [Cl.uint(marketId)],
                deployer
            );
            expect(result).toBeErr(Cl.uint(315));
        });

        it("should allow finalization after dispute period", () => {
            simnet.mineEmptyBlocks(150);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "finalize-resolution",
                [Cl.uint(marketId)],
                deployer
            );
            expect(result).toBeOk(Cl.uint(1));

            const isFinalized = simnet.callReadOnlyFn(
                oracleContract,
                "is-resolution-finalized",
                [Cl.uint(marketId)],
                deployer
            );
            expect(isFinalized.result).toBeBool(true);
        });

        it("should update oracle successful resolution count", () => {
            simnet.mineEmptyBlocks(150);
            simnet.callPublicFn(oracleContract, "finalize-resolution", [Cl.uint(marketId)], deployer);

            const stats = simnet.callReadOnlyFn(
                oracleContract,
                "get-oracle-stats",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(stats.result).toBeTuple({
                "total-resolutions": Cl.uint(1),
                "successful-resolutions": Cl.uint(1),
                "disputed-resolutions": Cl.uint(0),
            });
        });
    });

    describe("Dispute Mechanism", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);
        });

        it("should allow submitting a dispute with sufficient stake", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Oracle submitted wrong result"), Cl.uint(5000000)],
                wallet2
            );
            expect(result).toBeOk(Cl.uint(0));
        });

        it("should reject dispute with insufficient stake", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Low stake dispute"), Cl.uint(1000000)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(307));
        });

        it("should prevent duplicate disputes on same market", () => {
            simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("First dispute"), Cl.uint(5000000)],
                wallet2
            );

            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Second dispute"), Cl.uint(5000000)],
                wallet3
            );
            expect(result).toBeErr(Cl.uint(308));
        });

        it("should prevent dispute after period expires", () => {
            simnet.mineEmptyBlocks(150);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Late dispute"), Cl.uint(5000000)],
                wallet2
            );
            expect(result).toBeErr(Cl.uint(305));
        });

        it("should update oracle disputed count", () => {
            simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Disputing"), Cl.uint(5000000)],
                wallet2
            );

            const stats = simnet.callReadOnlyFn(
                oracleContract,
                "get-oracle-stats",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(stats.result).toBeTuple({
                "total-resolutions": Cl.uint(1),
                "successful-resolutions": Cl.uint(0),
                "disputed-resolutions": Cl.uint(1),
            });
        });
    });

    describe("Dispute Voting", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);
            simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Wrong result"), Cl.uint(5000000)],
                wallet2
            );
        });

        it("should allow voting YES on a dispute", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "vote-on-dispute",
                [Cl.uint(marketId), Cl.uint(1)],
                wallet3
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should allow voting NO on a dispute", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "vote-on-dispute",
                [Cl.uint(marketId), Cl.uint(2)],
                wallet3
            );
            expect(result).toBeOk(Cl.bool(true));
        });

        it("should prevent double voting", () => {
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], wallet3);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "vote-on-dispute",
                [Cl.uint(marketId), Cl.uint(2)],
                wallet3
            );
            expect(result).toBeErr(Cl.uint(310));
        });

        it("should reject invalid vote value", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "vote-on-dispute",
                [Cl.uint(marketId), Cl.uint(3)],
                wallet3
            );
            expect(result).toBeErr(Cl.uint(304));
        });

        it("should reject voting after voting period ends", () => {
            simnet.mineEmptyBlocks(300);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "vote-on-dispute",
                [Cl.uint(marketId), Cl.uint(1)],
                wallet3
            );
            expect(result).toBeErr(Cl.uint(311));
        });
    });

    describe("Dispute Resolution", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);
            simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Wrong result"), Cl.uint(5000000)],
                wallet2
            );
        });

        it("should uphold dispute when YES votes exceed NO votes", () => {
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], wallet3);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], wallet4);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(2)], deployer);

            simnet.mineEmptyBlocks(300);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "resolve-dispute",
                [Cl.uint(marketId)],
                deployer
            );
            expect(result).toBeOk(Cl.uint(1));
        });

        it("should reject dispute when NO votes exceed YES votes", () => {
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(2)], wallet3);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(2)], wallet4);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], deployer);

            simnet.mineEmptyBlocks(300);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "resolve-dispute",
                [Cl.uint(marketId)],
                deployer
            );
            expect(result).toBeOk(Cl.uint(2));

            const isFinalized = simnet.callReadOnlyFn(
                oracleContract,
                "is-resolution-finalized",
                [Cl.uint(marketId)],
                deployer
            );
            expect(isFinalized.result).toBeBool(true);
        });

        it("should reject resolution before voting period ends", () => {
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], wallet3);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(1)], wallet4);
            simnet.callPublicFn(oracleContract, "vote-on-dispute", [Cl.uint(marketId), Cl.uint(2)], deployer);

            const { result } = simnet.callPublicFn(
                oracleContract,
                "resolve-dispute",
                [Cl.uint(marketId)],
                deployer
            );
            expect(result).toBeErr(Cl.uint(311));
        });
    });

    describe("Admin Dispute Override", () => {
        let marketId: number;

        beforeEach(() => {
            registerOracle();
            const market = createTestMarket();
            marketId = market.marketId;
            mineUntil(market.resolutionDate);
            simnet.callPublicFn(oracleContract, "submit-resolution", [Cl.uint(marketId), Cl.uint(1)], oracle1);
            simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(marketId), Cl.stringUtf8("Admin override test"), Cl.uint(5000000)],
                wallet2
            );
        });

        it("should allow admin to override dispute with new result", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "admin-resolve-dispute",
                [Cl.uint(marketId), Cl.uint(2)],
                deployer
            );
            const adminBlock = simnet.blockHeight;
            expect(result).toBeOk(Cl.bool(true));

            const resolution = simnet.callReadOnlyFn(
                oracleContract,
                "get-market-resolution",
                [Cl.uint(marketId)],
                deployer
            );
            expect(resolution.result).toBeSome(Cl.tuple({
                oracle: Cl.standardPrincipal(oracle1),
                result: Cl.uint(2),
                "resolved-at": Cl.uint(adminBlock),
                finalized: Cl.bool(true),
                "dispute-end": Cl.uint(adminBlock),
            }));
        });

        it("should reject admin override from non-owner", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "admin-resolve-dispute",
                [Cl.uint(marketId), Cl.uint(2)],
                wallet3
            );
            expect(result).toBeErr(Cl.uint(300));
        });
    });

    describe("Admin Settings", () => {
        it("should allow owner to set dispute period", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "set-dispute-period",
                [Cl.uint(288)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const period = simnet.callReadOnlyFn(oracleContract, "get-dispute-period", [], deployer);
            expect(period.result).toBeUint(288);
        });

        it("should allow owner to set voting period", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "set-voting-period",
                [Cl.uint(576)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const period = simnet.callReadOnlyFn(oracleContract, "get-voting-period", [], deployer);
            expect(period.result).toBeUint(576);
        });

        it("should allow owner to set min dispute stake", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "set-min-dispute-stake",
                [Cl.uint(10000000)],
                deployer
            );
            expect(result).toBeOk(Cl.bool(true));

            const stake = simnet.callReadOnlyFn(oracleContract, "get-min-dispute-stake", [], deployer);
            expect(stake.result).toBeUint(10000000);
        });

        it("should reject settings changes from non-owner", () => {
            const { result } = simnet.callPublicFn(
                oracleContract,
                "set-dispute-period",
                [Cl.uint(288)],
                oracle1
            );
            expect(result).toBeErr(Cl.uint(300));
        });
    });
});
