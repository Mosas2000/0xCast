import prompts from 'prompts';

/**
 * Fetch current Stacks block height with retry logic
 */
export async function fetchCurrentBlockHeight(
    network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet',
    maxRetries: number = 3
): Promise<number> {
    const apiUrl = network === 'mainnet'
        ? 'https://api.mainnet.hiro.so/v2/info'
        : network === 'testnet'
            ? 'https://api.testnet.hiro.so/v2/info'
            : 'http://localhost:3999/v2/info';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data && typeof data.stacks_tip_height === 'number') {
                return data.stacks_tip_height;
            }
            throw new Error('Invalid response format from API');
        } catch (error) {
            if (attempt < maxRetries) {
                console.warn(`⚠️  Block height fetch attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`);
                console.warn(`   Retrying in 2s...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error(`\n❌ Failed to fetch current block height after ${maxRetries} attempts.`);
                
                // Check if we are in an interactive environment
                if (process.stdout.isTTY) {
                    const response = await prompts({
                        type: 'number',
                        name: 'height',
                        message: 'Hiro API is unreachable. Please enter the current Stacks block height manually (check explorer.hiro.so):',
                        validate: value => value > 0 || 'Block height must be a positive number'
                    });

                    if (response.height) {
                        return response.height;
                    }
                }

                throw new Error('Network error: Hiro API unreachable and no manual override provided.');
            }
        }
    }

    throw new Error('Unexpected error in fetchCurrentBlockHeight');
}
