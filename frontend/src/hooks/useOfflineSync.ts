import { useState, useEffect } from 'react';
import { offlineDB } from '../utils/offlineDB';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => {
      console.log('App is online');
      setIsOnline(true);
      syncPendingTransactions();
    };
    
    const handleOffline = () => {
      console.log('App is offline');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check pending transactions on mount
    checkPendingCount();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  async function checkPendingCount() {
    const pending = await offlineDB.getPendingTransactions();
    setPendingCount(pending.length);
  }
  
  async function syncPendingTransactions() {
    if (!navigator.onLine) {
      console.log('Cannot sync - offline');
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const pending = await offlineDB.getPendingTransactions();
      console.log(`Syncing ${pending.length} pending transactions`);
      
      for (const tx of pending) {
        try {
          // TODO: Broadcast transaction based on type
          console.log('Syncing transaction:', tx);
          
          // Remove from queue on success
          await offlineDB.removePendingTransaction(tx.id!);
        } catch (error) {
          console.error('Failed to sync transaction:', tx.id, error);
          await offlineDB.markTransactionFailed(tx.id!);
        }
      }
      
      await checkPendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }
  
  async function cacheMarket(market: any) {
    await offlineDB.cacheMarket(market);
  }
  
  async function getCachedMarkets() {
    return await offlineDB.getCachedMarkets();
  }
  
  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncPendingTransactions,
    cacheMarket,
    getCachedMarkets
  };
}
