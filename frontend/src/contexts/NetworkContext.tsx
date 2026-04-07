/**
 * Network Context Provider
 * 
 * Provides network state and switching functionality throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { StacksNetwork } from '@stacks/network';
import { NetworkType, type NetworkConfig, NETWORK_CONFIGS } from '../types/network';
import { 
  getStacksNetwork, 
  loadNetworkPreference, 
  saveNetworkPreference,
  getContractAddress,
  getContractName,
  isMainnet,
  isTestnet,
} from '../utils/networkUtils';

interface NetworkContextType {
  network: NetworkType;
  networkConfig: NetworkConfig;
  stacksNetwork: StacksNetwork;
  contractAddress: string;
  contractName: string;
  isMainnet: boolean;
  isTestnet: boolean;
  setNetwork: (network: NetworkType) => void;
  toggleNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<NetworkType>(() => loadNetworkPreference());

  const networkConfig = NETWORK_CONFIGS[network];
  const stacksNetwork = getStacksNetwork(network);
  const contractAddress = getContractAddress(network);
  const contractName = getContractName();

  const setNetwork = useCallback((newNetwork: NetworkType) => {
    setNetworkState(newNetwork);
    saveNetworkPreference(newNetwork);
  }, []);

  const toggleNetwork = useCallback(() => {
    const newNetwork = network === NetworkType.MAINNET ? NetworkType.TESTNET : NetworkType.MAINNET;
    setNetwork(newNetwork);
  }, [network, setNetwork]);

  // Log network changes in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Network] Switched to ${networkConfig.label} (${contractAddress})`);
    }
  }, [network, networkConfig.label, contractAddress]);

  const value: NetworkContextType = {
    network,
    networkConfig,
    stacksNetwork,
    contractAddress,
    contractName,
    isMainnet: isMainnet(network),
    isTestnet: isTestnet(network),
    setNetwork,
    toggleNetwork,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
