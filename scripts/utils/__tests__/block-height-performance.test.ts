import { describe, it, expect } from 'vitest';
import { fetchCurrentBlockHeight, clearBlockHeightCache } from '../block-height.js';
import { calculateMarketBlocks, validateMarketBlocks } from '../block-height-config.js';

describe('Block Height Performance', () => {
    it('should fetch block height within reasonable time', async () => {
        const start = Date.now();
        await fetchCurrentBlockHeight('mainnet');
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(10000);
    }, 15000);

    it('should use cache for subsequent calls', async () => {
        clearBlockHeightCache();
        
        const start1 = Date.now();
        await fetchCurrentBlockHeight('mainnet');
        const duration1 = Date.now() - start1;
        
        const start2 = Date.now();
        await fetchCurrentBlockHeight('mainnet');
        const duration2 = Date.now() - start2;
        
        expect(duration2).toBeLessThan(duration1);
        expect(duration2).toBeLessThan(100);
    }, 15000);

    it('should calculate blocks quickly', () => {
        const start = Date.now();
        
        for (let i = 0; i < 1000; i++) {
            calculateMarketBlocks(1000000, 30, 3);
        }
        
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(100);
    });

    it('should validate blocks quickly', () => {
        const start = Date.now();
        
        for (let i = 0; i < 1000; i++) {
            validateMarketBlocks(1000000, 1005000, 1005500);
        }
        
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests efficiently', async () => {
        clearBlockHeightCache();
        
        const start = Date.now();
        
        await Promise.all([
            fetchCurrentBlockHeight('mainnet'),
            fetchCurrentBlockHeight('mainnet'),
            fetchCurrentBlockHeight('mainnet'),
            fetchCurrentBlockHeight('mainnet'),
            fetchCurrentBlockHeight('mainnet'),
        ]);
        
        const duration = Date.now() - start;
        
        expect(duration).toBeLessThan(15000);
    }, 20000);
});
