/**
 * Utility for generating standardized governance documentation and metadata for proposals.
 */
export class DocGen {
    /**
     * Generates a markdown template for a new proposal.
     */
    static generateProposalMarkdown(params: { title: string, abstract: string, author: string }): string {
        return `
# ${params.title}
**Author:** ${params.author}
**Date:** ${new Date().toLocaleDateString()}

## Abstract
${params.abstract}

## Rationale
Detailed explanation of why this change is necessary for the protocol.

## Technical Specifications
Outline the smart contract changes or parameter adjustments.

## Implementation Plan
Steps required to deploy and verify the proposal.
    `.trim();
    }

    /**
     * Generates the metadata JSON required for on-chain proposal registration.
     */
    static generateProposalMetadata(id: string, title: string, hash: string): string {
        const metadata = {
            version: '1.0',
            proposalId: id,
            title: title,
            contentHash: hash,
            timestamp: Date.now(),
            schema: 'https://0xcast.com/schemas/proposal-v1.json'
        };
        return JSON.stringify(metadata, null, 2);
    }

    /**
     * Formats a resolution audit report for public viewing.
     */
    static formatAuditReport(marketId: string, outcome: string, proof: string): string {
        return `
AUDIT REPORT [MARKET #${marketId}]
---------------------------------
Outcome: ${outcome}
Proof Hash: ${proof}
Status: VERIFIED
Oracle: decentralized-oracle-cluster-v1
---------------------------------
    `.trim();
    }
}
