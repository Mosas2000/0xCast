import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import { useWallet } from '@/components/WalletProvider';

interface UserIdContextType {
  userId: string | null;
  setUserId: (id: string) => void;
  clearUserId: () => void;
}

const UserIdContext = createContext<UserIdContextType | undefined>(undefined);

export const UserIdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address } = useWallet();
  const [userId, setUserIdState] = React.useState<string | null>(null);

  const setUserId = useCallback((id: string) => {
    setUserIdState(id);
    logger.setUserId(id);
  }, []);

  const clearUserId = useCallback(() => {
    setUserIdState(null);
    logger.clearUserId();
  }, []);

  useEffect(() => {
    if (address) {
      setUserId(address);
    } else {
      clearUserId();
    }
  }, [address, setUserId, clearUserId]);

  useEffect(() => {
    return () => {
      logger.clearUserId();
    };
  }, []);

  const value = {
    userId,
    setUserId,
    clearUserId,
  };

  return <UserIdContext.Provider value={value}>{children}</UserIdContext.Provider>;
};

export const useUserId = (): UserIdContextType => {
  const context = useContext(UserIdContext);
  if (!context) {
    throw new Error('useUserId must be used within a UserIdProvider');
  }
  return context;
};
