import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';

interface RequestIdContextType {
  requestId: string;
  setRequestId: (id: string) => void;
  clearRequestId: () => void;
}

const RequestIdContext = createContext<RequestIdContextType | undefined>(undefined);

export const RequestIdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requestId, setRequestIdState] = React.useState<string>(() => {
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    logger.setRequestId(id);
    return id;
  });

  const setRequestId = useCallback((id: string) => {
    setRequestIdState(id);
    logger.setRequestId(id);
  }, []);

  const clearRequestId = useCallback(() => {
    setRequestIdState('');
    logger.clearRequestId();
  }, []);

  useEffect(() => {
    return () => {
      logger.clearRequestId();
    };
  }, []);

  const value = {
    requestId,
    setRequestId,
    clearRequestId,
  };

  return <RequestIdContext.Provider value={value}>{children}</RequestIdContext.Provider>;
};

export const useRequestId = (): RequestIdContextType => {
  const context = useContext(RequestIdContext);
  if (!context) {
    throw new Error('useRequestId must be used within a RequestIdProvider');
  }
  return context;
};

export const withRequestId = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { requestId } = useRequestId();
    return <Component {...(props as P)} requestId={requestId} />;
  };
};
