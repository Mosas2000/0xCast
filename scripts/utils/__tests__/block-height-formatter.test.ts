import { describe, it, expect } from 'vitest';
import {
    formatBlockHeight,
    formatBlockDuration,
    formatBlockRange,
    formatBlockTimeline,
    formatBlockProgress,
    estimateBlockTime,
} from '../block-height-formatter';

describe('Block Height Formatter', () => {
    describe('formatBlockHeight', () => {
        it('should format block height with commas', () => {
            expect(formatBlockHeight(1000000)).toBe('1,000,000');
            expect(formatBlockHeight(7936081)).toBe('7,936,081');
        });
    });

    describe('formatBlockDuration', () => {
        it('should format days and hours', () => {
            expect(formatBlockDuration(5040)).toBe('35 days');
            expect(formatBlockDuration(150)).toBe('1d 1h');
        });

        it('should format hours only', () => {
            expect(formatBlockDuration(72)).toBe('12 hours');
        });

        it('should format blocks only for small durations', () => {
            expect(formatBlockDuration(5)).toBe('5 blocks');
        });
    });

    describe('formatBlockRange', () => {
        it('should format block range', () => {
            const result = formatBlockRange(1000000, 1005000);
            expect(result).toContain('1,000,000');
            expect(result).toContain('1,005,000');
            expect(result).toContain('→');
        });
    });

    describe('formatBlockTimeline', () => {
        it('should format complete timeline', () => {
            const result = formatBlockTimeline(1000000, 1005000, 1005500);
            expect(result).toContain('Current');
            expect(result).toContain('End');
            expect(result).toContain('Resolution');
        });
    });

    describe('formatBlockProgress', () => {
        it('should calculate progress percentage', () => {
            const result = formatBlockProgress(1002500, 1000000, 1005000);
            expect(result).toContain('50.0%');
        });

        it('should handle 0% progress', () => {
            const result = formatBlockProgress(1000000, 1000000, 1005000);
            expect(result).toContain('0.0%');
        });

        it('should handle 100% progress', () => {
            const result = formatBlockProgress(1005000, 1000000, 1005000);
            expect(result).toContain('100.0%');
        });
    });

    describe('estimateBlockTime', () => {
        it('should estimate days', () => {
            const result = estimateBlockTime(1005000, 1000000, 0.1);
            expect(result).toContain('days');
        });

        it('should estimate hours', () => {
            const result = estimateBlockTime(1000100, 1000000, 0.1);
            expect(result).toContain('hours');
        });

        it('should estimate minutes', () => {
            const result = estimateBlockTime(1000010, 1000000, 0.1);
            expect(result).toContain('minutes');
        });
    });
});
