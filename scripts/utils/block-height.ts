import prompts from 'prompts';

export interface BlockHeightInfo {
    height: number;
    timestamp: number;
    source: 'api' | 'manual' | 'cache';
}

let cachedBlockHeight: BlockHeightInfo | null = null;
const CACHE_TTL_MS = 60000;

/**
 * Fetch current Stacks block height with retry logic and caching
 */
export async function fetchCurrentBlockHeight(
    network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet',
    maxRetries: number = 3,
    retryDelayMs: number = 2000,
    timeoutMs: number = 5000,
    useCache: boolean = true
): Promise<number> {
    if (useCache && cachedBlockHeight) {
        const age = Date.now() - cachedBlockHeight.timestamp;
        if (age < CACHE_TTL_MS) {
            console.log(`📦 Using cached block height: ${cachedBlockHeight.height} (${Math.floor(age / 1000)}s old)`);
            return cachedBlockHeight.height;
        }
    }

    const apiUrl = network === 'mainnet'
        ? 'https://api.mainnet.hiro.so/v2/info'
        : network === 'testnet'
            ? 'https://api.testnet.hiro.so/v2/info'
            : 'http://localhost:3999/v2/info';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, { signal: AbortSignal.timeout(timeoutMs) });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data && typeof data.stacks_tip_height === 'number') {
                const height = data.stacks_tip_height;
                
                cachedBlockHeight = {
                    height,
                    timestamp: Date.now(),
                    source: 'api'
                };
                
                return height;
            }
            throw new Error('Invalid response format from API');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            if (attempt < maxRetries) {
                console.warn(`⚠️  Block height fetch attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);
                console.warn(`   Retrying in ${retryDelayMs / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
            } else {
                console.error(`\n❌ Failed to fetch current block height after ${maxRetries} attempts.`);
                console.error(`   Last error: ${errorMessage}`);
                console.error(`   API URL: ${apiUrl}\n`);
                
                if (process.stdout.isTTY) {
                    console.log('💡 You can find the current block height at:');
                    console.log('   https://explorer.hiro.so\n');
                    
                    const response = await prompts({
                        type: 'number',
                        name: 'height',
                        message: 'Please enter the current Stacks block height manually:',
                        validate: value => {
                            if (!value || value <= 0) {
                                return 'Block height must be a positive number';
                            }
                            if (value < 1000000) {
                                return 'Block height seems too low. Please verify the value.';
                            }
                            return true;
                        }
                    });

                    if (response.height) {
                        cachedBlockHeight = {
                            height: response.height,
                            timestamp: Date.now(),
                            source: 'manual'
                        };
                        return response.height;
                    }
                }

                throw new Error(
                    `Network error: Hiro API unreachable and no manual override provided. ` +
                    `Please check your internet connection and try again.`
                );
            }
        }
    }

    throw new Error('Unexpected error in fetchCurrentBlockHeight');
}

/**
 * Clear the cached block height
 */
export function clearBlockHeightCache(): void {
    cachedBlockHeight = null;
}

/**
 * Get cached block height info if available
 */
export function getCachedBlockHeight(): BlockHeightInfo | null {
    if (cachedBlockHeight) {
        const age = Date.now() - cachedBlockHeight.timestamp;
        if (age < CACHE_TTL_MS) {
            return cachedBlockHeight;
        }
    }
    return null;
}
