/**
 * Utility for implementing an emergency "Circuit Breaker" to pause protocol actions in case of identified exploits or extreme volatility.
 */
export class CircuitBreaker {
    private static IS_PAUSED = false;
    private static VOLATILITY_THRESHOLD = 0.5; // 50% change in unexpected window

    /**
     * Checks if the protocol is currently paused.
     */
    static isProtocolPaused(): boolean {
        return this.IS_PAUSED;
    }

    /**
     * Analyzes current market state to determine if an emergency pause should be triggered.
     * @param priceChanges Array of recent price deltas
     * @param volumeSpike Ratio of current volume to average volume
     */
    static shouldTrigger(priceChanges: number[], volumeSpike: number): boolean {
        const extremeVolatility = priceChanges.some(p => Math.abs(p) > this.VOLATILITY_THRESHOLD);
        const extremeVolume = volumeSpike > 10; // 10x normal volume

        return extremeVolatility || extremeVolume;
    }

    /**
     * Simulates the emergency pause action.
     */
    static triggerEmergencyPause(): string {
        this.IS_PAUSED = true;
        return 'CRITICAL: Protocol Paused. All market resolutions and disbursements suspended.';
    }

    /**
     * Generates a status report for the security dashboard.
     */
    static getSecurityStatus(): { status: string, riskLevel: string } {
        return {
            status: this.IS_PAUSED ? 'PAUSED' : 'OPERATIONAL',
            riskLevel: this.IS_PAUSED ? 'CRITICAL' : 'STABLE'
        };
    }

    /**
     * Calculates "Cool Down" time required before resuming.
     */
    static getRequiredCoolDown(severity: number): string {
        const hours = Math.ceil(severity * 12);
        return `${hours} Hours`;
    }
}
