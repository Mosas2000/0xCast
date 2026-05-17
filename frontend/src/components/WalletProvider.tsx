/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { connect as stacksConnect } from '@stacks/connect';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import { SecureStorageV2Service } from '../services/SecureStorageV2Service';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
  isVerifying: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = '0xcast-wallet-address';

/**
 * WalletProvider component
 *
 * Provides wallet connection state management with:
 * - Persistent storage of wallet address
 * - Address validation on mount
 * - Stale connection cleanup
 * - Verification status tracking
 * - GDPR-compliant storage (wallet address stored under contract legal basis)
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Clear stale wallet connection data
  const clearWalletData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    SecureStorageV2Service.removeItem(STORAGE_KEY).catch(error => {
      console.error('Failed to clear wallet data from secure storage:', error);
    });
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
      let savedAddress = await SecureStorageV2Service.getItem<string>(STORAGE_KEY);
      
      if (!savedAddress) {
        savedAddress = localStorage.getItem(STORAGE_KEY);
      }
      
      if (!savedAddress) {
        setIsVerifying(false);
        return;
      }

      const isValid = await verifyConnection(savedAddress);
      
      if (isValid) {
        setIsConnected(true);
        setAddress(savedAddress);
      } else {
        clearWalletData();
      }
      
      setIsVerifying(false);
    };

    verifySavedConnection();
  }, [verifyConnection, clearWalletData]);

  const connect = useCallback(async () => {
    try {
      const result = await stacksConnect();

      if (result && result.addresses && result.addresses.length > 0) {
        const stacksAddress = result.addresses.find(
          (addr: { address: string }) =>
            addr.address.startsWith('SP') || addr.address.startsWith('ST')
        );

        if (stacksAddress) {
          setIsConnected(true);
          setAddress(stacksAddress.address);

          const consentCheck = GDPRComplianceService.checkConsentForStorage(
            { walletAddress: stacksAddress.address },
            'necessary'
          );

          if (consentCheck.allowed) {
            localStorage.setItem(STORAGE_KEY, stacksAddress.address);
            
            await SecureStorageV2Service.setItem(STORAGE_KEY, stacksAddress.address, {
              encrypt: true,
              category: 'necessary',
              requireConsent: false,
            });
          }
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
