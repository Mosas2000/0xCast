/**
 * Governance Contract Configuration
 * 
 * Configuration for governance-core and governance-token contracts.
 */

export const GOVERNANCE_CONFIG = {
  // Contract addresses (mainnet)
  GOVERNANCE_CORE: {
    address: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
    name: 'governance-core',
  },
  GOVERNANCE_TOKEN: {
    address: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
    name: 'governance-token',
  },
  
  // Proposal status constants (match contract)
  STATUS: {
    PENDING: 0,
    ACTIVE: 1,
    SUCCEEDED: 2,
    DEFEATED: 3,
    QUEUED: 4,
    EXECUTED: 5,
    CANCELLED: 6,
  },
  
  // Vote type constants
  VOTE_TYPE: {
    AGAINST: 0,
    FOR: 1,
    ABSTAIN: 2,
  },
  
  // Token decimals
  TOKEN_DECIMALS: 6,
  
  // Blocks per day (approximately 144 blocks = 1 day on Stacks)
  BLOCKS_PER_DAY: 144,
};

// Map contract status to UI status
export function mapProposalStatus(
  contractStatus: number,
  startBlock: number,
  endBlock: number,
  currentBlock: number
): 'pending' | 'active' | 'passed' | 'rejected' | 'queued' | 'executed' | 'cancelled' {
  // If explicitly executed or cancelled, return that
  if (contractStatus === GOVERNANCE_CONFIG.STATUS.EXECUTED) return 'executed';
  if (contractStatus === GOVERNANCE_CONFIG.STATUS.CANCELLED) return 'cancelled';
  if (contractStatus === GOVERNANCE_CONFIG.STATUS.QUEUED) return 'queued';
  
  // Otherwise, determine based on block timing
  if (currentBlock < startBlock) return 'pending';
  if (currentBlock <= endBlock) return 'active';
  
  // Voting ended - check result
  if (contractStatus === GOVERNANCE_CONFIG.STATUS.SUCCEEDED) return 'passed';
  if (contractStatus === GOVERNANCE_CONFIG.STATUS.DEFEATED) return 'rejected';
  
  // Default to rejected if voting ended but not explicitly succeeded
  return 'rejected';
}

// Format block number to estimated time remaining
export function formatBlocksRemaining(blocks: number): string {
  if (blocks <= 0) return 'Ended';
  
  const minutes = Math.round((blocks * 10) / 60); // ~10 minutes per block
  
  if (minutes < 60) return `~${minutes}m remaining`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `~${hours}h remaining`;
  
  const days = Math.floor(hours / 24);
  return `~${days}d remaining`;
}
