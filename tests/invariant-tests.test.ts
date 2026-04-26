import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;

const contractName = "market-core";

describe("Contract Invariants", () => {
    it("should maintain total pool equality (yes + no = total)", () => {
        const currentBlock = simnet.blockHeight;
        simnet.callPublicFn(
            contractName,
            "create-market",
            [
                Cl.stringAscii("Invariant test"),
                Cl.uint(currentBlock + 100),
                Cl.uint(currentBlock + 200),
                Cl.uint(1),
            ],
            deployer
        );

        const yesAmount = 500000;
        const noAmount = 300000;

        simnet.callPublicFn(contractName, "place-yes-stake", [Cl.uint(0), Cl.uint(yesAmount)], wallet1);
        simnet.callPublicFn(contractName, "place-no-stake", [Cl.uint(0), Cl.uint(noAmount)], wallet1);

        const poolSize = simnet.callReadOnlyFn(contractName, "get-market-pool-size", [Cl.uint(0)], deployer);
        expect(poolSize.result).toBeOk(Cl.uint(yesAmount + noAmount));
    });

    it("should respect resolution deadline abandonment invariant", () => {
        const currentBlock = simnet.blockHeight;
        const resDate = currentBlock + 100;
        simnet.callPublicFn(
            contractName,
            "create-market",
            [
                Cl.stringAscii("Abandonment invariant"),
                Cl.uint(currentBlock + 50),
                Cl.uint(resDate),
                Cl.uint(1),
            ],
            deployer
        );

        // Get resolution-deadline (usually resDate + 1008)
        const deadlineRes = simnet.callReadOnlyFn(contractName, "get-resolution-deadline", [Cl.uint(0)], deployer);
        
        // Result is (ok u...)
        // We can extract the value using Clarinet test helpers logic
        const deadlineValue = (deadlineRes.result as any).value;

        // Mine blocks until just before deadline
        // abandonment-period is 1008. resDate is currentBlock + 100.
        // deadline = currentBlock + 100 + 1008 = currentBlock + 1108.
        simnet.mineEmptyBlocks(1100);

        // Check if abandoned
        const abandonedBefore = simnet.callReadOnlyFn(contractName, "is-market-abandoned", [Cl.uint(0)], deployer);
        expect(abandonedBefore.result).toBeBool(false);

        // Mine more blocks to pass deadline
        simnet.mineEmptyBlocks(20);
        
        const abandonedAfter = simnet.callReadOnlyFn(contractName, "is-market-abandoned", [Cl.uint(0)], deployer);
        expect(abandonedAfter.result).toBeBool(true);
    });
});
