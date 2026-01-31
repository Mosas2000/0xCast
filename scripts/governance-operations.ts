#!/usr/bin/env tsx

import {
    makeContractCall,
    AnchorMode,
    PostConditionMode,
    uintCV,
    stringAsciiCV,
    boolCV,
    principalCV,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import prompts from 'prompts';
import * as dotenv from 'dotenv';
import {
    getPrivateKey,
    broadcastWithRetry,
    sleep,
    formatSTX,
    toMicroSTX,
    logTransaction,
    displayProgress,
    TransactionTracker,
} from './utils/transaction-helpers.js';

// Load environment variables
dotenv.config();

// Contract details
const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
const GOVERNANCE_CONTRACT = 'governance-core';
const TOKEN_CONTRACT = 'governance-token';

// Network configuration
const network = STACKS_MAINNET;

// Proposal types
const PROPOSAL_TYPES = {
    PARAMETER_UPDATE: 'parameter-update',
    CONTRACT_UPGRADE: 'contract-upgrade',
    TREASURY_ALLOCATION: 'treasury-allocation',
    EMERGENCY_ACTION: 'emergency-action',
};

/**
 * Get current block height
 */
async function getCurrentBlockHeight(): Promise<number> {
    try {
        const response = await fetch('https://api.mainnet.hiro.so/v2/info');
        const data = await response.json();
        return data.stacks_tip_height;
    } catch (error) {
        console.warn('Could not fetch current block height');
        return 6040000; // Fallback
    }
}

/**
 * Create a governance proposal
 */
async function createProposal(
    privateKey: string,
    title: string,
    description: string,
    proposalType: string,
    votingEndBlock: number
): Promise<string> {
    console.log(`\n📝 Creating governance proposal...`);
    console.log(`   Title: "${title}"`);
    console.log(`   Type: ${proposalType}`);
    console.log(`   Voting ends at block: ${votingEndBlock}`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: GOVERNANCE_CONTRACT,
        functionName: 'create-proposal',
        functionArgs: [
            stringAsciiCV(title),
            stringAsciiCV(description),
            uintCV(votingEndBlock),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Vote on a proposal
 */
async function voteOnProposal(
    privateKey: string,
    proposalId: number,
    vote: boolean
): Promise<string> {
    const voteStr = vote ? 'YES' : 'NO';
    console.log(`\n🗳️  Voting ${voteStr} on proposal ${proposalId}...`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: GOVERNANCE_CONTRACT,
        functionName: 'vote',
        functionArgs: [
            uintCV(proposalId),
            boolCV(vote),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Execute a passed proposal
 */
async function executeProposal(
    privateKey: string,
    proposalId: number
): Promise<string> {
    console.log(`\n⚡ Executing proposal ${proposalId}...`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: GOVERNANCE_CONTRACT,
        functionName: 'execute-proposal',
        functionArgs: [
            uintCV(proposalId),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Delegate voting power
 */
async function delegateVotes(
    privateKey: string,
    delegateTo: string
): Promise<string> {
    console.log(`\n🤝 Delegating voting power to ${delegateTo}...`);

    const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: GOVERNANCE_CONTRACT,
        functionName: 'delegate',
        functionArgs: [
            principalCV(delegateTo),
        ],
        senderKey: privateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastWithRetry(transaction, network);

    return result.txid;
}

/**
 * Batch vote on multiple proposals
 */
async function batchVote(
    privateKey: string,
    proposalIds: number[],
    voteStrategy: 'all-yes' | 'all-no' | 'alternating' | 'custom',
    customVotes?: boolean[],
    delaySeconds: number = 3
) {
    const tracker = new TransactionTracker();
    const total = proposalIds.length;

    console.log(`\n🗳️  Batch voting on ${total} proposals...`);
    console.log(`   Strategy: ${voteStrategy}\n`);

    for (let i = 0; i < total; i++) {
        const proposalId = proposalIds[i];

        try {
            let vote: boolean;

            if (voteStrategy === 'all-yes') {
                vote = true;
            } else if (voteStrategy === 'all-no') {
                vote = false;
            } else if (voteStrategy === 'alternating') {
                vote = i % 2 === 0;
            } else { // custom
                vote = customVotes?.[i] ?? true;
            }

            console.log(`\n[${i + 1}/${total}] Voting ${vote ? 'YES' : 'NO'} on proposal ${proposalId}...`);

            const txid = await voteOnProposal(privateKey, proposalId, vote);

            tracker.add(`Vote on Proposal ${proposalId}`, txid, {
                proposalId,
                vote: vote ? 'YES' : 'NO',
            });

            logTransaction(
                'Vote',
                txid,
                'mainnet',
                `Proposal: ${proposalId}, Vote: ${vote ? 'YES' : 'NO'}`
            );

            displayProgress(i + 1, total, 'Voting Progress');

            if (i < total - 1) {
                await sleep(delaySeconds * 1000);
            }

        } catch (error) {
            console.error(`❌ Failed to vote on proposal ${proposalId}:`,
                error instanceof Error ? error.message : error);
            console.log('Continuing with next vote...\n');
        }
    }

    return tracker;
}

/**
 * Predefined proposal templates
 */
const PROPOSAL_TEMPLATES = {
    'fee-reduction': {
        title: 'Reduce Platform Fees',
        description: 'Proposal to reduce platform fees from 0.3% to 0.2% to increase competitiveness',
        type: PROPOSAL_TYPES.PARAMETER_UPDATE,
    },
    'increase-timelock': {
        title: 'Increase Governance Timelock',
        description: 'Increase timelock period from 24 hours to 48 hours for enhanced security',
        type: PROPOSAL_TYPES.PARAMETER_UPDATE,
    },
    'treasury-grant': {
        title: 'Treasury Grant for Development',
        description: 'Allocate 10,000 STX from treasury for frontend development',
        type: PROPOSAL_TYPES.TREASURY_ALLOCATION,
    },
    'oracle-upgrade': {
        title: 'Upgrade Oracle Contract',
        description: 'Deploy new oracle contract with improved data verification',
        type: PROPOSAL_TYPES.CONTRACT_UPGRADE,
    },
    'emergency-pause': {
        title: 'Emergency Market Pause',
        description: 'Pause all market creation due to detected vulnerability',
        type: PROPOSAL_TYPES.EMERGENCY_ACTION,
    },
};

/**
 * Main execution function
 */
async function main() {
    console.log('🚀 0xCast Governance Operations');
    console.log('================================\n');
    console.log(`Contract: ${CONTRACT_ADDRESS}.${GOVERNANCE_CONTRACT}`);
    console.log(`Network: Stacks Mainnet\n`);

    try {
        // Select operation mode
        const modeResponse = await prompts({
            type: 'select',
            name: 'mode',
            message: 'Select operation mode:',
            choices: [
                { title: 'Create Proposal', value: 'create' },
                { title: 'Vote on Proposal', value: 'vote' },
                { title: 'Execute Proposal', value: 'execute' },
                { title: 'Batch Vote', value: 'batch-vote' },
                { title: 'Delegate Voting Power', value: 'delegate' },
                { title: 'Create from Template', value: 'template' },
            ],
            initial: 0,
        });

        const { mode } = modeResponse;

        // Get private key
        const privateKey = await getPrivateKey();

        if (mode === 'create') {
            // Create custom proposal
            const createResponse = await prompts([
                {
                    type: 'text',
                    name: 'title',
                    message: 'Proposal title (max 100 chars):',
                    validate: value => value.length > 0 && value.length <= 100 || 'Title must be 1-100 characters',
                },
                {
                    type: 'text',
                    name: 'description',
                    message: 'Proposal description (max 500 chars):',
                    validate: value => value.length > 0 && value.length <= 500 || 'Description must be 1-500 characters',
                },
                {
                    type: 'select',
                    name: 'proposalType',
                    message: 'Proposal type:',
                    choices: [
                        { title: 'Parameter Update', value: PROPOSAL_TYPES.PARAMETER_UPDATE },
                        { title: 'Contract Upgrade', value: PROPOSAL_TYPES.CONTRACT_UPGRADE },
                        { title: 'Treasury Allocation', value: PROPOSAL_TYPES.TREASURY_ALLOCATION },
                        { title: 'Emergency Action', value: PROPOSAL_TYPES.EMERGENCY_ACTION },
                    ],
                },
                {
                    type: 'number',
                    name: 'votingDays',
                    message: 'Voting period (days):',
                    initial: 7,
                    min: 1,
                    max: 30,
                },
            ]);

            const { title, description, proposalType, votingDays } = createResponse;

            // Calculate voting end block (144 blocks per day)
            const currentBlock = await getCurrentBlockHeight();
            const votingEndBlock = currentBlock + (votingDays * 144);

            const txid = await createProposal(privateKey, title, description, proposalType, votingEndBlock);

            console.log(`\n✅ Proposal creation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'template') {
            // Create from template
            const templateResponse = await prompts([
                {
                    type: 'select',
                    name: 'template',
                    message: 'Select proposal template:',
                    choices: [
                        { title: 'Reduce Platform Fees', value: 'fee-reduction' },
                        { title: 'Increase Governance Timelock', value: 'increase-timelock' },
                        { title: 'Treasury Grant', value: 'treasury-grant' },
                        { title: 'Oracle Upgrade', value: 'oracle-upgrade' },
                        { title: 'Emergency Pause', value: 'emergency-pause' },
                    ],
                },
                {
                    type: 'number',
                    name: 'votingDays',
                    message: 'Voting period (days):',
                    initial: 7,
                    min: 1,
                    max: 30,
                },
            ]);

            const template = PROPOSAL_TEMPLATES[templateResponse.template as keyof typeof PROPOSAL_TEMPLATES];
            const currentBlock = await getCurrentBlockHeight();
            const votingEndBlock = currentBlock + (templateResponse.votingDays * 144);

            const txid = await createProposal(
                privateKey,
                template.title,
                template.description,
                template.type,
                votingEndBlock
            );

            console.log(`\n✅ Proposal creation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'vote') {
            // Vote on single proposal
            const voteResponse = await prompts([
                {
                    type: 'number',
                    name: 'proposalId',
                    message: 'Enter proposal ID:',
                    min: 0,
                },
                {
                    type: 'select',
                    name: 'vote',
                    message: 'Your vote:',
                    choices: [
                        { title: 'YES', value: true },
                        { title: 'NO', value: false },
                    ],
                },
            ]);

            const { proposalId, vote } = voteResponse;

            const txid = await voteOnProposal(privateKey, proposalId, vote);

            console.log(`\n✅ Vote transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'batch-vote') {
            // Batch vote on multiple proposals
            const batchResponse = await prompts([
                {
                    type: 'text',
                    name: 'proposalIds',
                    message: 'Enter proposal IDs (comma-separated):',
                    validate: value => {
                        const ids = value.split(',').map((id: string) => id.trim());
                        return ids.every((id: string) => !isNaN(parseInt(id))) || 'Please enter valid proposal IDs';
                    }
                },
                {
                    type: 'select',
                    name: 'strategy',
                    message: 'Voting strategy:',
                    choices: [
                        { title: 'All YES', value: 'all-yes' },
                        { title: 'All NO', value: 'all-no' },
                        { title: 'Alternating (YES, NO, YES...)', value: 'alternating' },
                    ],
                },
                {
                    type: 'number',
                    name: 'delaySeconds',
                    message: 'Delay between votes (seconds):',
                    initial: 3,
                    min: 1,
                    max: 30,
                },
            ]);

            const proposalIds = batchResponse.proposalIds
                .split(',')
                .map((id: string) => parseInt(id.trim()));

            const tracker = await batchVote(
                privateKey,
                proposalIds,
                batchResponse.strategy,
                undefined,
                batchResponse.delaySeconds
            );

            tracker.printSummary('mainnet');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `governance-votes-${timestamp}.json`;
            tracker.exportToJSON(filename);

        } else if (mode === 'execute') {
            // Execute passed proposal
            const executeResponse = await prompts({
                type: 'number',
                name: 'proposalId',
                message: 'Enter proposal ID to execute:',
                min: 0,
            });

            const { proposalId } = executeResponse;

            const txid = await executeProposal(privateKey, proposalId);

            console.log(`\n✅ Proposal execution transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);

        } else if (mode === 'delegate') {
            // Delegate voting power
            const delegateResponse = await prompts({
                type: 'text',
                name: 'delegateTo',
                message: 'Enter delegate address (principal):',
                validate: value => value.startsWith('SP') || value.startsWith('ST') || 'Invalid Stacks address',
            });

            const { delegateTo } = delegateResponse;

            const txid = await delegateVotes(privateKey, delegateTo);

            console.log(`\n✅ Delegation transaction broadcast!`);
            console.log(`Transaction ID: ${txid}`);
            console.log(`View on Explorer: https://explorer.hiro.so/txid/${txid}?chain=mainnet`);
        }

        console.log('\n✅ Governance operations completed!');
        console.log(`\n📊 View contract activity:`);
        console.log(`https://explorer.hiro.so/address/${CONTRACT_ADDRESS}.${GOVERNANCE_CONTRACT}?chain=mainnet`);

    } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the script
main();
