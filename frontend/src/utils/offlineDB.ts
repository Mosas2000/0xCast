import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDBSchema extends DBSchema {
  markets: {
    key: number;
    value: {
      id: number;
      question: string;
      creator: string;
      totalYesStake: number;
      totalNoStake: number;
      status: number;
      endDate: number;
      resolutionDate: number;
      createdAt: number;
      cachedAt: number;
    };
    indexes: { 'by-status': number };
  };
  
  positions: {
    key: string;
    value: {
      marketId: number;
      userAddress: string;
      yesStake: number;
      noStake: number;
      claimed: boolean;
      cachedAt: number;
    };
  };
  
  pendingTx: {
    key: number;
    value: {
      id?: number;
      type: 'create' | 'stake-yes' | 'stake-no' | 'resolve' | 'claim';
      marketId?: number;
      amount?: number;
      params: any;
      timestamp: number;
      status: 'pending' | 'failed';
    };
    autoIncrement: true;
  };
  
  userData: {
    key: string;
    value: any;
  };
}

class OfflineDB {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private dbName = '0xcast-offline';
  private version = 1;
  
  async init() {
    if (this.db) return this.db;
    
    this.db = await openDB<OfflineDBSchema>(this.dbName, this.version, {
      upgrade(db) {
        // Markets store
        if (!db.objectStoreNames.contains('markets')) {
          const marketStore = db.createObjectStore('markets', { keyPath: 'id' });
          marketStore.createIndex('by-status', 'status');
        }
        
        // Positions store
        if (!db.objectStoreNames.contains('positions')) {
          db.createObjectStore('positions', { keyPath: 'id' });
        }
        
        // Pending transactions
        if (!db.objectStoreNames.contains('pendingTx')) {
          db.createObjectStore('pendingTx', { 
            keyPath: 'id',
            autoIncrement: true 
          });
        }
        
        // User data
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'key' });
        }
      }
    });
    
    return this.db;
  }
  
  // Market operations
  async cacheMarket(market: OfflineDBSchema['markets']['value']) {
    const db = await this.init();
    await db.put('markets', {
      ...market,
      cachedAt: Date.now()
    });
  }
  
  async getCachedMarkets(): Promise<OfflineDBSchema['markets']['value'][]> {
    const db = await this.init();
    return await db.getAll('markets');
  }
  
  async getCachedMarket(id: number): Promise<OfflineDBSchema['markets']['value'] | undefined> {
    const db = await this.init();
    return await db.get('markets', id);
  }
  
  async clearOldMarketCache(maxAge: number = 24 * 60 * 60 * 1000) {
    const db = await this.init();
    const markets = await db.getAll('markets');
    const now = Date.now();
    
    for (const market of markets) {
      if (now - market.cachedAt > maxAge) {
        await db.delete('markets', market.id);
      }
    }
  }
  
  // Position operations
  async cachePosition(position: OfflineDBSchema['positions']['value']) {
    const db = await this.init();
    const key = `${position.marketId}-${position.userAddress}`;
    await db.put('positions', {
      ...position,
      cachedAt: Date.now()
    });
  }
  
  async getCachedPositions(userAddress: string): Promise<OfflineDBSchema['positions']['value'][]> {
    const db = await this.init();
    const allPositions = await db.getAll('positions');
    return allPositions.filter(p => p.userAddress === userAddress);
  }
  
  // Pending transaction operations
  async queueTransaction(tx: Omit<OfflineDBSchema['pendingTx']['value'], 'id'>) {
    const db = await this.init();
    const id = await db.add('pendingTx', {
      ...tx,
      status: 'pending'
    });
    console.log('Transaction queued:', id);
    return id;
  }
  
  async getPendingTransactions(): Promise<OfflineDBSchema['pendingTx']['value'][]> {
    const db = await this.init();
    return await db.getAll('pendingTx');
  }
  
  async removePendingTransaction(id: number) {
    const db = await this.init();
    await db.delete('pendingTx', id);
  }
  
  async markTransactionFailed(id: number) {
    const db = await this.init();
    const tx = await db.get('pendingTx', id);
    if (tx) {
      await db.put('pendingTx', {
        ...tx,
        status: 'failed'
      });
    }
  }
  
  // User data operations
  async setUserData(key: string, value: any) {
    const db = await this.init();
    await db.put('userData', { key, value });
  }
  
  async getUserData(key: string): Promise<any> {
    const db = await this.init();
    const data = await db.get('userData', key);
    return data?.value;
  }
  
  // Clear all data
  async clearAll() {
    const db = await this.init();
    await db.clear('markets');
    await db.clear('positions');
    await db.clear('pendingTx');
    await db.clear('userData');
  }
}

// Export singleton instance
export const offlineDB = new OfflineDB();
