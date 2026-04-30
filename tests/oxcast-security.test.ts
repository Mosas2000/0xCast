import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const contractName = "oxcast";

describe("OxCast MVP Security and Edge Cases", () => {
    it("should prevent non-owner from resolving a market", () => {
        const { result } = simnet.callPublicFn(
            contractName,
            "create-market",
            [Cl.stringAscii("MVP test"), Cl.uint(100)],
            wallet1
        );
        const marketId = (result as any).value;
        
        simnet.mineEmptyBlocks(110);
        
        const resolveResult = simnet.callPublicFn(
            contractName,
            "resolve-market",
            [marketId, Cl.uint(1)],
            wallet2
        );
        expect(resolveResult.result).toBeErr(Cl.uint(100)); // ERR-OWNER-ONLY
    });

    it("should prevent prediction after end-block", () => {
        const { result } = simnet.callPublicFn(
            contractName,
            "create-market",
            [Cl.stringAscii("Expiry test"), Cl.uint(10)],
            deployer
        );
        const marketId = (result as any).value;
        
        simnet.mineEmptyBlocks(20);
        
        const predictResult = simnet.callPublicFn(
            contractName,
            "predict",
            [marketId, Cl.uint(1), Cl.uint(1000000)],
            wallet1
        );
        expect(predictResult.result).toBeErr(Cl.uint(103)); // ERR-MARKET-ENDED
    });

    it("should handle claim-winnings with empty opposite pool", () => {
        const { result } = simnet.callPublicFn(
            contractName,
            "create-market",
            [Cl.stringAscii("Empty pool test"), Cl.uint(10)],
            deployer
        );
        const marketId = (result as any).value;
        
        // Only YES stake (10 STX)
        const stakeAmount = 10000000;
        simnet.callPublicFn(contractName, "predict", [marketId, Cl.uint(1), Cl.uint(stakeAmount)], wallet1);
        
        simnet.mineEmptyBlocks(20);
        simnet.callPublicFn(contractName, "resolve-market", [marketId, Cl.uint(1)], deployer);
        
        const claimResult = simnet.callPublicFn(contractName, "claim-winnings", [marketId], wallet1);
        
        // PLATFORM-FEE is 200 bp (2%)
        const netAmount = stakeAmount - (stakeAmount * 200 / 10000);
        expect(claimResult.result).toBeOk(Cl.uint(netAmount));
    });

    it("should prevent claiming winnings from a non-existent market", () => {
        const { result } = simnet.callPublicFn(
            contractName,
            "claim-winnings",
            [Cl.uint(999)],
            wallet1
        );
        expect(result).toBeErr(Cl.uint(101)); // ERR-NOT-FOUND
    });
});
