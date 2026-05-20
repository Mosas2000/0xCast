import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const accessControlContract = "access-control";
const migrationContract = "migration-manager";

describe("Access Control Vulnerability Scenarios", () => {
    describe("Privilege Escalation Scenarios", () => {
        it("should prevent unauthorized users from granting roles to themselves or others", () => {
            // Attempt to grant MOD role as an unauthorized wallet (wallet1)
            const { result } = simnet.callPublicFn(
                accessControlContract,
                "grant-role",
                [Cl.principal(wallet1), Cl.uint(2)], // Grant MOD role to self
                wallet1
            );
            expect(result).toBeErr(Cl.uint(980)); // E1: ERR-OWNER-ONLY

            // Verify role was not granted
            const hasRole = simnet.callReadOnlyFn(
                accessControlContract,
                "has-role",
                [Cl.principal(wallet1), Cl.uint(2)],
                deployer
            );
            expect(hasRole.result).toBeBool(false);
        });

        it("should prevent unauthorized users from revoking roles from valid users", () => {
            // First owner grants MOD role to wallet2
            simnet.callPublicFn(
                accessControlContract,
                "grant-role",
                [Cl.principal(wallet2), Cl.uint(2)],
                deployer
            );

            // wallet1 tries to revoke it
            const { result } = simnet.callPublicFn(
                accessControlContract,
                "revoke-role",
                [Cl.principal(wallet2), Cl.uint(2)],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(980)); // E1

            // Verify role is still active
            const hasRole = simnet.callReadOnlyFn(
                accessControlContract,
                "has-role",
                [Cl.principal(wallet2), Cl.uint(2)],
                deployer
            );
            expect(hasRole.result).toBeBool(true);
        });
    });

    describe("Unauthorized Migration and Upgrade Scenarios", () => {
        it("should reject registering migrations from non-owner accounts", () => {
            const dataHash = new Uint8Array(32);
            dataHash[0] = 1;
            
            const { result } = simnet.callPublicFn(
                migrationContract,
                "register-migration",
                [
                    Cl.uint(2), // version 2
                    Cl.stringUtf8("Malicious Migration"),
                    Cl.buffer(dataHash),
                    Cl.uint(100),
                    Cl.bool(true)
                ],
                wallet1
            );
            expect(result).toBeErr(Cl.uint(2000)); // ERR-NOT-AUTHORIZED
        });

        it("should prevent executing or rolling back migrations by unauthorized operators", () => {
            const dataHash = new Uint8Array(32);
            
            // Deployer registers migration
            simnet.callPublicFn(
                migrationContract,
                "register-migration",
                [
                    Cl.uint(2),
                    Cl.stringUtf8("Valid Migration"),
                    Cl.buffer(dataHash),
                    Cl.uint(100),
                    Cl.bool(true)
                ],
                deployer
            );

            // wallet1 tries to execute it
            const executeErr = simnet.callPublicFn(
                migrationContract,
                "execute-migration",
                [Cl.uint(0)],
                wallet1
            );
            expect(executeErr.result).toBeErr(Cl.uint(2000)); // ERR-NOT-AUTHORIZED
        });

        it("should prevent ownership transfer of the migration system by non-owners", () => {
            const transferErr = simnet.callPublicFn(
                migrationContract,
                "transfer-ownership",
                [Cl.principal(wallet2)],
                wallet1
            );
            expect(transferErr.result).toBeErr(Cl.uint(2000)); // ERR-NOT-AUTHORIZED
        });
    });
});
