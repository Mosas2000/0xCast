import React, { createContext, useContext, useCallback } from 'react';
import { logger } from '../utils/logger';

interface TransactionIdContextType {
  transactionId: string | null;
  setTransactionId: (id: string) => void;
  clearTransactionId: () => void;
}

const TransactionIdContext = createContext<TransactionIdContextType | undefined>(undefined);

export const TransactionIdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactionId, setTransactionIdState] = React.useState<string | null>(null);

  const setTransactionId = useCallback((id: string) => {
    setTransactionIdState(id);
    logger.setTransactionId(id);
  }, []);

  const clearTransactionId = useCallback(() => {
    setTransactionIdState(null);
    logger.clearTransactionId();
  }, []);

  const value = {
    transactionId,
    setTransactionId,
    clearTransactionId,
  };

  return (
    <TransactionIdContext.Provider value={value}>
      {children}
    </TransactionIdContext.Provider>
  );
};

export const useTransactionId = (): TransactionIdContextType => {
  const context = useContext(TransactionIdContext);
  if (!context) {
    throw new Error('useTransactionId must be used within a TransactionIdProvider');
  }
  return context;
};

export const withTransactionId = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { transactionId } = useTransactionId();
    return <Component {...(props as P)} transactionId={transactionId} />;
  };
};
