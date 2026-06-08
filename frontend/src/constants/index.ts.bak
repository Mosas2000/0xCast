// Re-export contract configuration from unified source
import { 
  MARKET_CONTRACT, 
  CURRENT_NETWORK,
  getContractAddress,
  getContractIdentifier,
  CONTRACT_NAMES,
} from '@/config/contracts';
import { getApiUrl } from '@/config/network';

// Contract deployed on Stacks (uses unified config)
export const CONTRACT_ADDRESS = MARKET_CONTRACT.address;
export const CONTRACT_NAME = MARKET_CONTRACT.name;
export const CONTRACT_IDENTIFIER = MARKET_CONTRACT.identifier;

// Stacks API endpoint (uses unified config)
export const STACKS_API_URL = getApiUrl();

// Network configuration (uses unified config)
export const NETWORK = CURRENT_NETWORK;

// Re-export for convenience
export { getContractAddress, getContractIdentifier, CONTRACT_NAMES };

// App constants
export const APP_NAME = '0xCast';
export const APP_DESCRIPTION = 'Decentralized Prediction Markets on Bitcoin';

// Conversion constants
export const MICROSTX_PER_STX = 1_000_000;

// Helper functions
export const stxToMicroStx = (stx: number): number => Math.floor(stx * MICROSTX_PER_STX);
export const microStxToStx = (microStx: number): number => microStx / MICROSTX_PER_STX;

// Default values
export const DEFAULT_STAKE_AMOUNT = 10;
export const MIN_STAKE = 1;
export const MAX_STAKE = 10000;
