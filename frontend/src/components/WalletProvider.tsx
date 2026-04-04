import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { connect as stacksConnect } from '@stacks/connect';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
  isVerifying: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = '0xcast-wallet-address';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Clear stale wallet connection data
  const clearWalletData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsConnected(false);
    setAddress(null);
  }, []);

  // Verify stored wallet connection is still valid
  const verifyConnection = useCallback(async (savedAddress: string): Promise<boolean> => {
    try {
      // Attempt to verify the connection with Hiro wallet
      // Note: Stacks Connect doesn't provide a direct verification API
      // We rely on the user initiating a new connection if state is stale
      // For now, we'll accept saved address but mark it as unverified
      // The user will know if it's invalid when they try to transact
      return true;
    } catch (error) {
      console.error('Error verifying connection:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check localStorage for saved address
    const savedAddress = localStorage.getItem(STORAGE_KEY);
    if (savedAddress) {
      setIsConnected(true);
      setAddress(savedAddress);
    }
  }, []);

  const connect = useCallback(async () => {
    console.log('Attempting to connect wallet...');
    
    try {
      const result = await stacksConnect();
      console.log('Connect result:', result);
      
      if (result && result.addresses && result.addresses.length > 0) {
        // Find the Stacks address (not BTC)
        const stacksAddress = result.addresses.find(
          (addr: { address: string }) => addr.address.startsWith('SP') || addr.address.startsWith('ST')
        );
        
        if (stacksAddress) {
          setIsConnected(true);
          setAddress(stacksAddress.address);
          localStorage.setItem(STORAGE_KEY, stacksAddress.address);
          console.log('Connected with address:', stacksAddress.address);
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsConnected(false);
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}
