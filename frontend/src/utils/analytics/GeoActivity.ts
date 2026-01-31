/**
 * Utility for analyzing the geographic distribution of users and activity (mocked based on node distribution).
 */
export class GeoActivity {
    /**
     * Returns a top-5 list of countries by activity volume.
     */
    static getTopRegions(): string[] {
        return ['United States', 'South Korea', 'Germany', 'Japan', 'United Kingdom'];
    }

    /**
     * Calculates "Timezone Density" to identify peak liquidity periods based on global regions.
     * @param currentHourUTC (0-23)
     */
    static getTimezoneDensity(currentHourUTC: number): 'HIGH' | 'MEDIUM' | 'LOW' {
        // Peak Asia/Europe crossover
        if (currentHourUTC >= 7 && currentHourUTC <= 10) return 'HIGH';
        // Peak Europe/US crossover
        if (currentHourUTC >= 13 && currentHourUTC <= 17) return 'HIGH';

        if (currentHourUTC >= 22 || currentHourUTC <= 4) return 'LOW';
        return 'MEDIUM';
    }

    /**
     * Identifies if a market has localized interest (e.g., local election).
     * @param countryTags Tags associated with the market
     */
    static looksLocalized(countryTags: string[]): boolean {
        return countryTags.length > 0 && countryTags.length < 3;
    }

    /**
     * Generates a "Regional Pulse" report.
     */
    static getRegionalPulseSummary(): string {
        return 'East Asian markets are leading in volume for the current 24h cycle, driven by high STX node density in the region.';
    }
}
