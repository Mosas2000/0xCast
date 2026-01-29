import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Governance Token Tests", () => {
    beforeEach(() => {
        // Reset state before each test
    });

    describe("SIP-010 Standard Functions", () => {
        it("should return correct token name", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-name",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.stringAscii("0xCast Governance Token"));
        });

        it("should return correct token symbol", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-symbol",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.stringAscii("CAST"));
        });

        it("should return correct decimals", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-decimals",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.uint(6));
        });

        it("should show initial supply minted to deployer", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-balance",
                [Cl.principal(deployer)],
                deployer
            );
            expect(result).toBeOk(Cl.uint(100000000)); // 100M tokens
        });

        it("should return total supply", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-total-supply",
                [],
                deployer
            );
            expect(result).toBeOk(Cl.uint(100000000));
        });
    });

    describe("Token Transfer", () => {
        it("should transfer tokens successfully", () => {
            const transferAmount = 1000000;

            const { result } = simnet.callPublicFn(
                "governance-token",
                "transfer",
                [
                    Cl.uint(transferAmount),
                    Cl.principal(deployer),
                    Cl.principal(wallet1),
                    Cl.none()
                ],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            // Check balances
            const wallet1Balance = simnet.callReadOnlyFn(
                "governance-token",
                "get-balance",
                [Cl.principal(wallet1)],
                deployer
            );
            expect(wallet1Balance.result).toBeOk(Cl.uint(transferAmount));
        });

        it("should fail transfer from non-owner", () => {
            const { result } = simnet.callPublicFn(
                "governance-token",
                "transfer",
                [
                    Cl.uint(1000),
                    Cl.principal(deployer),
                    Cl.principal(wallet1),
                    Cl.none()
                ],
                wallet1 // Wrong sender
            );

            expect(result).toBeErr(Cl.uint(101)); // err-not-token-owner
        });

        it("should fail transfer with zero amount", () => {
            const { result } = simnet.callPublicFn(
                "governance-token",
                "transfer",
                [
                    Cl.uint(0),
                    Cl.principal(deployer),
                    Cl.principal(wallet1),
                    Cl.none()
                ],
                deployer
            );

            expect(result).toBeErr(Cl.uint(103)); // err-invalid-amount
        });
    });

    describe("Minting and Burning", () => {
        it("should allow owner to mint tokens", () => {
            const mintAmount = 5000000;

            const { result } = simnet.callPublicFn(
                "governance-token",
                "mint",
                [Cl.uint(mintAmount), Cl.principal(wallet1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            const balance = simnet.callReadOnlyFn(
                "governance-token",
                "get-balance",
                [Cl.principal(wallet1)],
                deployer
            );
            expect(balance.result).toBeOk(Cl.uint(mintAmount));
        });

        it("should prevent non-owner from minting", () => {
            const { result } = simnet.callPublicFn(
                "governance-token",
                "mint",
                [Cl.uint(1000), Cl.principal(wallet2)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(100)); // err-owner-only
        });

        it("should allow token holders to burn their tokens", () => {
            // First mint some tokens
            simnet.callPublicFn(
                "governance-token",
                "mint",
                [Cl.uint(10000), Cl.principal(wallet1)],
                deployer
            );

            // Then burn
            const { result } = simnet.callPublicFn(
                "governance-token",
                "burn",
                [Cl.uint(5000)],
                wallet1
            );

            expect(result).toBeOk(Cl.bool(true));

            const balance = simnet.callReadOnlyFn(
                "governance-token",
                "get-balance",
                [Cl.principal(wallet1)],
                deployer
            );
            expect(balance.result).toBeOk(Cl.uint(5000));
        });
    });

    describe("Voting Power Delegation", () => {
        it("should delegate voting power to another address", () => {
            const { result } = simnet.callPublicFn(
                "governance-token",
                "delegate-voting-power",
                [Cl.principal(wallet1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));

            const delegation = simnet.callReadOnlyFn(
                "governance-token",
                "get-delegation",
                [Cl.principal(deployer)],
                deployer
            );
            expect(delegation.result).toBeOk(Cl.some(Cl.principal(wallet1)));
        });

        it("should prevent self-delegation", () => {
            const { result } = simnet.callPublicFn(
                "governance-token",
                "delegate-voting-power",
                [Cl.principal(deployer)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(103)); // err-invalid-amount
        });

        it("should revoke delegation", () => {
            // First delegate
            simnet.callPublicFn(
                "governance-token",
                "delegate-voting-power",
                [Cl.principal(wallet1)],
                deployer
            );

            // Then revoke
            const { result } = simnet.callPublicFn(
                "governance-token",
                "revoke-delegation",
                [],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should return correct voting power", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-token",
                "get-voting-power",
                [Cl.principal(deployer)],
                deployer
            );

            expect(result).toBeOk(Cl.uint(100000000)); // Initial balance
        });
    });
});

describe("Governance Core Tests", () => {
    describe("Proposal Creation", () => {
        it("should create a new proposal", () => {
            const { result } = simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [
                    Cl.stringUtf8("Increase market creation fee"),
                    Cl.stringUtf8("This proposal suggests increasing the market creation fee from 10 STX to 20 STX to improve platform sustainability.")
                ],
                deployer
            );

            expect(result).toBeOk(Cl.uint(1)); // First proposal ID

            // Verify proposal was created
            const proposal = simnet.callReadOnlyFn(
                "governance-core",
                "get-proposal",
                [Cl.uint(1)],
                deployer
            );
            expect(proposal.result).toBeSome();
        });

        it("should increment proposal count", () => {
            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [
                    Cl.stringUtf8("Test Proposal 1"),
                    Cl.stringUtf8("Description 1")
                ],
                deployer
            );

            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [
                    Cl.stringUtf8("Test Proposal 2"),
                    Cl.stringUtf8("Description 2")
                ],
                deployer
            );

            const count = simnet.callReadOnlyFn(
                "governance-core",
                "get-proposal-count",
                [],
                deployer
            );
            expect(count.result).toBe(Cl.uint(2));
        });
    });

    describe("Voting", () => {
        beforeEach(() => {
            // Create a proposal before each voting test
            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [
                    Cl.stringUtf8("Test Proposal"),
                    Cl.stringUtf8("Test Description")
                ],
                deployer
            );

            // Advance blocks to make proposal active
            simnet.mineEmptyBlocks(15);
        });

        it("should allow voting on active proposal", () => {
            const { result } = simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(1)], // Vote FOR
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should prevent double voting", () => {
            // First vote
            simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(1)],
                deployer
            );

            // Second vote should fail
            const { result } = simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(0)],
                deployer
            );

            expect(result).toBeErr(Cl.uint(202)); // err-already-voted
        });

        it("should record vote correctly", () => {
            simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(1)],
                wallet1
            );

            const hasVoted = simnet.callReadOnlyFn(
                "governance-core",
                "has-voted",
                [Cl.uint(1), Cl.principal(wallet1)],
                deployer
            );
            expect(hasVoted.result).toBe(Cl.bool(true));
        });
    });

    describe("Proposal Lifecycle", () => {
        it("should queue successful proposal after voting period", () => {
            // Create proposal
            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [
                    Cl.stringUtf8("Test Proposal"),
                    Cl.stringUtf8("Test Description")
                ],
                deployer
            );

            // Activate and vote
            simnet.mineEmptyBlocks(15);
            simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(1)],
                deployer
            );

            // End voting period
            simnet.mineEmptyBlocks(1450);

            // Queue proposal
            const { result } = simnet.callPublicFn(
                "governance-core",
                "queue-proposal",
                [Cl.uint(1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should execute proposal after timelock", () => {
            // Create, vote, and queue proposal
            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [Cl.stringUtf8("Test"), Cl.stringUtf8("Test")],
                deployer
            );
            simnet.mineEmptyBlocks(15);
            simnet.callPublicFn(
                "governance-core",
                "cast-vote",
                [Cl.uint(1), Cl.uint(1)],
                deployer
            );
            simnet.mineEmptyBlocks(1450);
            simnet.callPublicFn(
                "governance-core",
                "queue-proposal",
                [Cl.uint(1)],
                deployer
            );

            // Wait for timelock
            simnet.mineEmptyBlocks(150);

            // Execute
            const { result } = simnet.callPublicFn(
                "governance-core",
                "execute-proposal",
                [Cl.uint(1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should allow proposal cancellation by proposer", () => {
            simnet.callPublicFn(
                "governance-core",
                "create-proposal",
                [Cl.stringUtf8("Test"), Cl.stringUtf8("Test")],
                deployer
            );

            const { result } = simnet.callPublicFn(
                "governance-core",
                "cancel-proposal",
                [Cl.uint(1)],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });
    });

    describe("Governance Parameters", () => {
        it("should return current governance parameters", () => {
            const { result } = simnet.callReadOnlyFn(
                "governance-core",
                "get-governance-parameters",
                [],
                deployer
            );

            expect(result).toBeTuple();
        });

        it("should allow owner to update parameters", () => {
            const { result } = simnet.callPublicFn(
                "governance-core",
                "update-governance-parameters",
                [
                    Cl.uint(2000000), // new threshold
                    Cl.uint(15), // new quorum
                    Cl.uint(2000), // new voting period
                    Cl.uint(200) // new timelock
                ],
                deployer
            );

            expect(result).toBeOk(Cl.bool(true));
        });

        it("should prevent non-owner from updating parameters", () => {
            const { result } = simnet.callPublicFn(
                "governance-core",
                "update-governance-parameters",
                [Cl.uint(2000000), Cl.uint(15), Cl.uint(2000), Cl.uint(200)],
                wallet1
            );

            expect(result).toBeErr(Cl.uint(200)); // err-owner-only
        });
    });
});
