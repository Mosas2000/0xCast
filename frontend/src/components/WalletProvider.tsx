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
      // Basic validation: Check if address format is valid
      if (!savedAddress || savedAddress.length === 0) {
        return false;
      }
      
      // Check if it's a valid Stacks address (starts with SP or ST)
      if (!savedAddress.startsWith('SP') && !savedAddress.startsWith('ST')) {
        return false;
      }
      
      // Address format is valid - we'll trust it until a transaction fails
      // Note: Stacks Connect doesn't provide account verification API
      // The wallet extension handles account switching internally
      return true;
    } catch (error) {
      console.error('Error verifying connection:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Verify saved connection on mount
    const verifySavedConnection = async () => {
      const savedAddress = localStorage.getItem(STORAGE_KEY);
      
      if (!savedAddress) {
        // No saved address, mark verification complete
        setIsVerifying(false);
        return;
      }

      // Verify the saved address is still valid
      const isValid = await verifyConnection(savedAddress);
      
      if (isValid) {
        setIsConnected(true);
        setAddress(savedAddress);
      } else {
        // Clear stale data
        clearWalletData();
      }
      
      setIsVerifying(false);
    };

    verifySavedConnection();
  }, [verifyConnection, clearWalletData]);

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
    clearWalletData();
  }, [clearWalletData]);

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect, isVerifying }}>
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
