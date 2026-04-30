import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";
import * as fc from "fast-check";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

const contractName = "market-core";

describe("Market Creation Fuzzing", () => {
    it("should correctly handle various end and resolution dates", () => {
        const startBlock = simnet.blockHeight;
        
        fc.assert(
            fc.property(
                fc.integer({ min: 10, max: 100 }), // endOffset
                fc.integer({ min: 10, max: 100 }), // resolutionDelta
                (endOffset, resDelta) => {
                    const currentBlock = simnet.blockHeight;
                    const endDate = currentBlock + endOffset;
                    const resolutionDate = endDate + resDelta;
                    
                    const { result } = simnet.callPublicFn(
                        contractName,
                        "create-market",
                        [
                            Cl.stringAscii("Fuzz Market"),
                            Cl.uint(endDate),
                            Cl.uint(resolutionDate),
                            Cl.uint(1),
                        ],
                        deployer
                    );

                    expect(result.type).toBe("ok");
                }
            ),
            { numRuns: 20 }
        );
    });

    it("should reject invalid date sequences", () => {
        const startBlock = simnet.blockHeight;
        
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 100 }), // endOffset
                fc.integer({ min: 0, max: 100 }), // invalidDelta (resDate <= endDate)
                (endOffset, invDelta) => {
                    const currentBlock = simnet.blockHeight;
                    const endDate = currentBlock + endOffset;
                    const resolutionDate = Math.max(0, endDate - invDelta);
                    
                    const { result } = simnet.callPublicFn(
                        contractName,
                        "create-market",
                        [
                            Cl.stringAscii("Fuzz Invalid Dates"),
                            Cl.uint(endDate),
                            Cl.uint(resolutionDate),
                            Cl.uint(1),
                        ],
                        deployer
                    );

                    expect(result).toBeErr(Cl.uint(106)); // ERR-INVALID-DATES
                }
            ),
            { numRuns: 20 }
        );
    });

    it("should only allow categories between 1 and 5", () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 100 }), // category
                (category) => {
                    const currentBlock = simnet.blockHeight;
                    
                    const { result } = simnet.callPublicFn(
                        contractName,
                        "create-market",
                        [
                            Cl.stringAscii("Category Fuzz"),
                            Cl.uint(currentBlock + 100),
                            Cl.uint(currentBlock + 200),
                            Cl.uint(category),
                        ],
                        deployer
                    );

                    if (category >= 1 && category <= 5) {
                        expect(result.type).toBe("ok");
                    } else {
                        expect(result).toBeErr(Cl.uint(111)); // ERR-INVALID-CATEGORY
                    }
                }
            ),
            { numRuns: 20 }
        );
    });
});
