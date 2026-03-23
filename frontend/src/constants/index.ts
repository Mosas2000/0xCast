// Contract deployed on Stacks Mainnet
export const CONTRACT_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';
export const CONTRACT_NAME = 'market-core';
export const CONTRACT_IDENTIFIER = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

// Stacks API endpoint
export const STACKS_API_URL = 'https://api.mainnet.hiro.so';

// Network configuration
export const NETWORK = 'mainnet';

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
