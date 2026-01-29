import { openDB, IDBPDatabase } from 'idb';

export interface PendingTransaction {
    id: string;
    type: string;
    data: any;
    timestamp: number;
}

const DB_NAME = '0xcast-pwa-db';
const STORE_NAME = 'pending-transactions';

export class OfflineQueue {
    private dbPromise: Promise<IDBPDatabase>;

    constructor() {
        this.dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            },
        });
    }

    async addTransaction(type: string, data: any) {
        const tx: PendingTransaction = {
            id: crypto.randomUUID(),
            type,
            data,
            timestamp: Date.now(),
        };
        const db = await this.dbPromise;
        await db.put(STORE_NAME, tx);
        console.log('Transaction added to offline queue:', tx.id);

        // Request a background sync if available
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            await (registration as any).sync.register('sync-transactions');
        }
    }

    async getPendingTransactions(): Promise<PendingTransaction[]> {
        const db = await this.dbPromise;
        return db.getAll(STORE_NAME);
    }

    async removeTransaction(id: string) {
        const db = await this.dbPromise;
        await db.delete(STORE_NAME, id);
    }
}

export const offlineQueue = new OfflineQueue();
