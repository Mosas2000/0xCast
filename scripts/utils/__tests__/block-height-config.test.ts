import { describe, it, expect } from 'vitest';
import {
    BLOCK_HEIGHT_CONFIG,
    blocksFromDays,
    blocksFromHours,
    daysFromBlocks,
    hoursFromBlocks,
    validateMarketBlocks,
    calculateMarketBlocks,
} from '../block-height-config';

describe('Block Height Configuration', () => {
    describe('Constants', () => {
        it('should have correct blocks per day', () => {
            expect(BLOCK_HEIGHT_CONFIG.BLOCKS_PER_DAY).toBe(144);
        });

        it('should have correct blocks per hour', () => {
            expect(BLOCK_HEIGHT_CONFIG.BLOCKS_PER_HOUR).toBe(6);
        });

        it('should have correct blocks per week', () => {
            expect(BLOCK_HEIGHT_CONFIG.BLOCKS_PER_WEEK).toBe(1008);
        });
    });

    describe('blocksFromDays', () => {
        it('should convert days to blocks correctly', () => {
            expect(blocksFromDays(1)).toBe(144);
            expect(blocksFromDays(7)).toBe(1008);
            expect(blocksFromDays(30)).toBe(4320);
        });

        it('should handle fractional days', () => {
            expect(blocksFromDays(0.5)).toBe(72);
            expect(blocksFromDays(1.5)).toBe(216);
        });
    });

    describe('blocksFromHours', () => {
        it('should convert hours to blocks correctly', () => {
            expect(blocksFromHours(1)).toBe(6);
            expect(blocksFromHours(24)).toBe(144);
            expect(blocksFromHours(12)).toBe(72);
        });
    });

    describe('daysFromBlocks', () => {
        it('should convert blocks to days correctly', () => {
            expect(daysFromBlocks(144)).toBe(1);
            expect(daysFromBlocks(1008)).toBe(7);
            expect(daysFromBlocks(4320)).toBe(30);
        });
    });

    describe('hoursFromBlocks', () => {
        it('should convert blocks to hours correctly', () => {
            expect(hoursFromBlocks(6)).toBe(1);
            expect(hoursFromBlocks(144)).toBe(24);
            expect(hoursFromBlocks(72)).toBe(12);
        });
    });

    describe('validateMarketBlocks', () => {
        const currentBlock = 1000000;

        it('should validate correct block heights', () => {
            const endBlock = currentBlock + 5000;
            const resolutionBlock = endBlock + 500;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject end block in the past', () => {
            const endBlock = currentBlock - 100;
            const resolutionBlock = endBlock + 500;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('must be in the future')
            );
        });

        it('should reject resolution block before end block', () => {
            const endBlock = currentBlock + 5000;
            const resolutionBlock = endBlock - 100;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('must be after end block')
            );
        });

        it('should reject too short market duration', () => {
            const endBlock = currentBlock + 100;
            const resolutionBlock = endBlock + 500;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('duration')
            );
        });

        it('should reject too long market duration', () => {
            const endBlock = currentBlock + 50000;
            const resolutionBlock = endBlock + 500;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('too long')
            );
        });

        it('should reject too short resolution buffer', () => {
            const endBlock = currentBlock + 5000;
            const resolutionBlock = endBlock + 10;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('buffer')
            );
        });

        it('should reject too long resolution buffer', () => {
            const endBlock = currentBlock + 5000;
            const resolutionBlock = endBlock + 2000;
            
            const result = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);
            
            expect(result.valid).toBe(false);
            expect(result.errors).toContain(
                expect.stringContaining('buffer')
            );
        });
    });

    describe('calculateMarketBlocks', () => {
        const currentBlock = 1000000;

        it('should calculate blocks with default values', () => {
            const result = calculateMarketBlocks(currentBlock);
            
            expect(result.endBlock).toBe(currentBlock + 5040);
            expect(result.resolutionBlock).toBe(currentBlock + 5472);
        });

        it('should calculate blocks with custom duration', () => {
            const result = calculateMarketBlocks(currentBlock, 7, 1);
            
            expect(result.endBlock).toBe(currentBlock + 1008);
            expect(result.resolutionBlock).toBe(currentBlock + 1152);
        });

        it('should return valid blocks that pass validation', () => {
            const result = calculateMarketBlocks(currentBlock, 10, 2);
            const validation = validateMarketBlocks(
                currentBlock,
                result.endBlock,
                result.resolutionBlock
            );
            
            expect(validation.valid).toBe(true);
        });
    });
});
