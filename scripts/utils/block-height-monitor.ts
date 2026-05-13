#!/usr/bin/env tsx

import { fetchCurrentBlockHeight } from './block-height.js';

interface BlockHeightSnapshot {
    height: number;
    timestamp: number;
    network: string;
}

export class BlockHeightMonitor {
    private snapshots: BlockHeightSnapshot[] = [];
    private network: 'mainnet' | 'testnet' | 'devnet';
    private intervalId?: NodeJS.Timeout;

    constructor(network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet') {
        this.network = network;
    }

    async takeSnapshot(): Promise<BlockHeightSnapshot> {
        const height = await fetchCurrentBlockHeight(this.network);
        const snapshot: BlockHeightSnapshot = {
            height,
            timestamp: Date.now(),
            network: this.network
        };
        
        this.snapshots.push(snapshot);
        return snapshot;
    }

    startMonitoring(intervalMs: number = 60000): void {
        if (this.intervalId) {
            console.warn('Monitoring already started');
            return;
        }

        console.log(`📊 Starting block height monitoring (${intervalMs / 1000}s interval)...`);
        
        this.intervalId = setInterval(async () => {
            try {
                const snapshot = await this.takeSnapshot();
                console.log(`Block: ${snapshot.height.toLocaleString()} at ${new Date(snapshot.timestamp).toLocaleTimeString()}`);
            } catch (error) {
                console.error('Failed to take snapshot:', error instanceof Error ? error.message : error);
            }
        }, intervalMs);
    }

    stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
            console.log('📊 Monitoring stopped');
        }
    }

    getSnapshots(): BlockHeightSnapshot[] {
        return [...this.snapshots];
    }

    getLatestSnapshot(): BlockHeightSnapshot | null {
        return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
    }

    calculateBlockRate(): number | null {
        if (this.snapshots.length < 2) {
            return null;
        }

        const first = this.snapshots[0];
        const last = this.snapshots[this.snapshots.length - 1];

        const blockDiff = last.height - first.height;
        const timeDiff = last.timestamp - first.timestamp;

        return (blockDiff / timeDiff) * 1000 * 60;
    }

    getAverageBlockTime(): number | null {
        const rate = this.calculateBlockRate();
        return rate ? 60 / rate : null;
    }

    printStatistics(): void {
        if (this.snapshots.length === 0) {
            console.log('No snapshots available');
            return;
        }

        console.log('\n📊 Block Height Statistics');
        console.log('='.repeat(50));
        console.log(`Network: ${this.network}`);
        console.log(`Snapshots: ${this.snapshots.length}`);
        
        const latest = this.getLatestSnapshot();
        if (latest) {
            console.log(`Latest block: ${latest.height.toLocaleString()}`);
            console.log(`Last updated: ${new Date(latest.timestamp).toLocaleString()}`);
        }

        const rate = this.calculateBlockRate();
        if (rate) {
            console.log(`Block rate: ${rate.toFixed(2)} blocks/minute`);
        }

        const avgTime = this.getAverageBlockTime();
        if (avgTime) {
            console.log(`Average block time: ${avgTime.toFixed(2)} minutes`);
        }

        console.log('='.repeat(50) + '\n');
    }

    exportToJSON(filename: string): void {
        const fs = require('fs');
        const data = {
            network: this.network,
            snapshots: this.snapshots,
            statistics: {
                totalSnapshots: this.snapshots.length,
                blockRate: this.calculateBlockRate(),
                averageBlockTime: this.getAverageBlockTime(),
            }
        };

        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`📁 Exported to ${filename}`);
    }

    clear(): void {
        this.snapshots = [];
        console.log('🗑️  Snapshots cleared');
    }
}

async function main() {
    const monitor = new BlockHeightMonitor('mainnet');

    console.log('Taking initial snapshot...');
    await monitor.takeSnapshot();

    console.log('Starting 5-minute monitoring...');
    monitor.startMonitoring(30000);

    setTimeout(() => {
        monitor.stopMonitoring();
        monitor.printStatistics();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        monitor.exportToJSON(`block-height-monitor-${timestamp}.json`);
    }, 5 * 60 * 1000);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
