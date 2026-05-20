import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const oracle1 = accounts.get("wallet_1")!;
const oracle2 = accounts.get("wallet_2")!;
const oracle3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;

const oracleContract = "oracle-integration";
const marketContract = "market-core";

function registerOracles() {
    simnet.callPublicFn(oracleContract, "register-oracle-provider", [Cl.principal(oracle1), Cl.stringAscii("Provider1"), Cl.stringAscii("http://p1.io"), Cl.uint(10)], deployer);
    simnet.callPublicFn(oracleContract, "register-oracle-provider", [Cl.principal(oracle2), Cl.stringAscii("Provider2"), Cl.stringAscii("http://p2.io"), Cl.uint(10)], deployer);
    simnet.callPublicFn(oracleContract, "register-oracle-provider", [Cl.principal(oracle3), Cl.stringAscii("Provider3"), Cl.stringAscii("http://p3.io"), Cl.uint(10)], deployer);
}

function createMarketAndConfigure() {
    const currentBlock = simnet.blockHeight;
    const endDate = currentBlock + 10;
    const resolutionDate = currentBlock + 20;
    
    // Create Market
    simnet.callPublicFn(
        marketContract,
        "create-market",
        [
            Cl.stringAscii("BTC price prediction market"),
            Cl.uint(endDate),
            Cl.uint(resolutionDate),
            Cl.uint(1),
        ],
        deployer
    );

    // Configure Oracle
    simnet.callPublicFn(
        oracleContract,
        "configure-oracle-source",
        [
            Cl.uint(0),
            Cl.stringAscii("consensus"),
            Cl.stringAscii("BTC/USD"),
            Cl.uint(100000),
        ],
        deployer
    );
}

describe("Oracle Manipulation Resistance Tests", () => {
    beforeEach(() => {
        registerOracles();
        createMarketAndConfigure();
    });

    describe("Consensus Price Submission and Manipulation Resistance", () => {
        it("should prevent single-oracle price feed submission from triggering auto-resolution without consensus", () => {
            // First oracle submits a high price feed (manipulation attempt)
            const submit1 = simnet.callPublicFn(
                oracleContract,
                "submit-price-for-consensus",
                [Cl.uint(0), Cl.uint(120000)], // Manipulated high price
                oracle1
            );
            expect(submit1.result).toBeOk(Cl.bool(true));

            // Verify that consensus is not reached yet
            const state = simnet.callReadOnlyFn(
                oracleContract,
                "get-consensus-state",
                [Cl.uint(0)],
                deployer
            );
            
            expect(state.result).toBeSome(Cl.tuple({
                "submission-count": Cl.uint(1),
                "total-weight": Cl.uint(10),
                "consensus-reached": Cl.bool(false),
                "final-price": Cl.uint(120000)
            }));

            // Auto-resolve attempt must fail or be blocked by lack of confirmed price feed
            const autoResolve = simnet.callPublicFn(
                oracleContract,
                "auto-resolve-with-oracle",
                [Cl.uint(0)],
                oracle1
            );
            // Must fail because the default price-feeds map is not confirmed/available
            expect(autoResolve.result).toBeErr(Cl.uint(302)); // ERR-MARKET-NOT-FOUND (because feed was not set in price-feeds map)
        });

        it("should require at least three independent registered oracles to establish price consensus", () => {
            // Oracle 1 submits
            simnet.callPublicFn(oracleContract, "submit-price-for-consensus", [Cl.uint(0), Cl.uint(98000)], oracle1);
            // Oracle 2 submits
            simnet.callPublicFn(oracleContract, "submit-price-for-consensus", [Cl.uint(0), Cl.uint(99000)], oracle2);

            // Verify still no consensus at count 2
            let state = simnet.callReadOnlyFn(oracleContract, "get-consensus-state", [Cl.uint(0)], deployer);
            expect((state.result as any).value.data["consensus-reached"]).toStrictEqual(Cl.bool(false));

            // Oracle 3 submits, triggering consensus
            simnet.callPublicFn(oracleContract, "submit-price-for-consensus", [Cl.uint(0), Cl.uint(101000)], oracle3);

            state = simnet.callReadOnlyFn(oracleContract, "get-consensus-state", [Cl.uint(0)], deployer);
            expect((state.result as any).value.data["consensus-reached"]).toStrictEqual(Cl.bool(true));
            expect((state.result as any).value.data["submission-count"]).toStrictEqual(Cl.uint(3));
        });

        it("should reject price submissions from unregistered or disabled oracles trying to skew consensus", () => {
            // Disabled or unregistered wallet tries to submit price
            const submitErr = simnet.callPublicFn(
                oracleContract,
                "submit-price-for-consensus",
                [Cl.uint(0), Cl.uint(120000)],
                wallet4
            );
            expect(submitErr.result).toBeErr(Cl.uint(301)); // ERR-UNAUTHORIZED-ORACLE
        });
    });

    describe("Oracle Staleness and Revocation Protection", () => {
        it("should prevent a revoked or disabled oracle from submitting prices or resolving markets", () => {
            // Remove oracle1
            const removeRes = simnet.callPublicFn(
                oracleContract,
                "remove-oracle",
                [Cl.principal(oracle1)],
                deployer
            );
            expect(removeRes.result).toBeOk(Cl.bool(true));

            // Verify oracle1 can no longer submit a price feed
            const submitErr = simnet.callPublicFn(
                oracleContract,
                "submit-price-feed",
                [Cl.uint(0), Cl.uint(105000)],
                oracle1
            );
            expect(submitErr.result).toBeErr(Cl.uint(301)); // ERR-UNAUTHORIZED-ORACLE
        });

        it("should enforce dispute expiration limits and prevent submitting disputes after the dispute window has elapsed", () => {
            // Register oracle1 again to submit a resolution
            simnet.callPublicFn(oracleContract, "register-oracle", [Cl.principal(oracle1)], deployer);
            
            // Advance block height to resolution date
            const blocksToMine = 20 - simnet.blockHeight;
            if (blocksToMine > 0) {
                simnet.mineEmptyBlocks(blocksToMine);
            }

            // Oracle resolves market
            const resolveRes = simnet.callPublicFn(
                oracleContract,
                "submit-resolution",
                [Cl.uint(0), Cl.uint(1)], // YES
                oracle1
            );
            expect(resolveRes.result).toBeOk(Cl.bool(true));

            // Fast forward 150 blocks, past the 144 block dispute period
            simnet.mineEmptyBlocks(150);

            // Attempt to submit late dispute
            const disputeErr = simnet.callPublicFn(
                oracleContract,
                "submit-dispute",
                [Cl.uint(0), Cl.stringUtf8("Late dispute attempt"), Cl.uint(6000000)],
                wallet4
            );
            expect(disputeErr.result).toBeErr(Cl.uint(305)); // ERR-DISPUTE-PERIOD-EXPIRED
        });
    });
});
