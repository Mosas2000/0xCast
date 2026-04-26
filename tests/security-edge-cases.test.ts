import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const contractName = "market-core";

describe("Security and Edge Case Scenarios", () => {

    describe("Unauthorized Access", () => {
        it("should prevent non-creator from resolving a market", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 10;
            const resolutionDate = currentBlock + 20;

            // Create market as wallet1
            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Security test market"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                wallet1
            );

            simnet.mineEmptyBlocks(25);

            // Attempt to resolve as wallet2
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                wallet2
            );

            expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });
    });

    describe("Integrity and State Transitions", () => {
        it("should prevent resolving a market multiple times", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 10;
            const resolutionDate = currentBlock + 20;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Double resolution test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                deployer
            );

            simnet.mineEmptyBlocks(25);

            // First resolution
            simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                deployer
            );

            // Second resolution attempt
            const { result } = simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(2)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(102)); // ERR-MARKET-ALREADY-RESOLVED
        });

        it("should prevent claiming winnings twice", () => {
            const currentBlock = simnet.blockHeight;
            const endDate = currentBlock + 10;
            const resolutionDate = currentBlock + 20;

            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Double claim test"),
                    Cl.uint(endDate),
                    Cl.uint(resolutionDate),
                    Cl.uint(1),
                ],
                deployer
            );

            const stakeAmount = 1000000;
            simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(stakeAmount)],
                wallet1
            );

            simnet.mineEmptyBlocks(25);

            // Resolve as YES
            simnet.callPublicFn(
                contractName,
                "resolve-market",
                [Cl.uint(0), Cl.uint(1)],
                deployer
            );

            // Advance blocks to pass dispute period (144 blocks)
            simnet.mineEmptyBlocks(150);

            // Finalize market
            simnet.callPublicFn(
                contractName,
                "finalize-market",
                [Cl.uint(0)],
                deployer
            );

            // First claim
            const firstClaim = simnet.callPublicFn(
                contractName,
                "claim-winnings",
                [Cl.uint(0)],
                wallet1
            );
            expect(firstClaim.result).toBeOk(Cl.uint(stakeAmount));

            // Second claim attempt
            const { result } = simnet.callPublicFn(
                contractName,
                "claim-winnings",
                [Cl.uint(0)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(108)); // ERR-ALREADY-CLAIMED
        });
    });

    describe("Extreme Values", () => {
        it("should handle extremely small stakes (1 microSTX)", () => {
            const currentBlock = simnet.blockHeight;
            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Dust stake test"),
                    Cl.uint(currentBlock + 10),
                    Cl.uint(currentBlock + 20),
                    Cl.uint(1),
                ],
                deployer
            );

            const { result } = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(1)],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should handle extremely large stakes", () => {
            const currentBlock = simnet.blockHeight;
            simnet.callPublicFn(
                contractName,
                "create-market",
                [
                    Cl.stringAscii("Whale stake test"),
                    Cl.uint(currentBlock + 10),
                    Cl.uint(currentBlock + 20),
                    Cl.uint(1),
                ],
                deployer
            );

            // 100,000 STX
            const whaleStake = 100000000000;
            const { result } = simnet.callPublicFn(
                contractName,
                "place-yes-stake",
                [Cl.uint(0), Cl.uint(whaleStake)],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));
        });
    });

    describe("Oracle Gated Functions", () => {
        it("should prevent non-oracle from calling oracle-resolve", () => {
            const currentBlock = simnet.blockHeight;
            simnet.callPublicFn(
                contractName,
                "create-market",
                [Cl.stringAscii("Oracle test"), Cl.uint(currentBlock + 10), Cl.uint(currentBlock + 20), Cl.uint(1)],
                deployer
            );
            const { result } = simnet.callPublicFn(
                contractName,
                "oracle-resolve",
                [Cl.uint(0), Cl.uint(1)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });

        it("should prevent non-oracle from setting dispute period", () => {
            const { result } = simnet.callPublicFn(
                contractName,
                "set-dispute-period",
                [Cl.uint(200)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
        });
    });
});
