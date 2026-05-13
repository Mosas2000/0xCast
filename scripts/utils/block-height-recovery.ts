import { fetchCurrentBlockHeight } from './block-height.js';
import { calculateMarketBlocks, validateMarketBlocks } from './block-height-config.js';

export interface RecoveryOptions {
    maxRetries?: number;
    retryDelayMs?: number;
    fallbackDurationDays?: number;
    fallbackBufferDays?: number;
}

export interface RecoveryResult {
    success: boolean;
    currentBlock?: number;
    endBlock?: number;
    resolutionBlock?: number;
    error?: string;
    attempts: number;
}

export async function recoverBlockHeights(
    network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet',
    durationDays: number = 35,
    bufferDays: number = 3,
    options: RecoveryOptions = {}
): Promise<RecoveryResult> {
    const {
        maxRetries = 5,
        retryDelayMs = 3000,
        fallbackDurationDays = 30,
        fallbackBufferDays = 3,
    } = options;

    let attempts = 0;
    let lastError: string | undefined;

    while (attempts < maxRetries) {
        attempts++;

        try {
            const currentBlock = await fetchCurrentBlockHeight(network, 3, 2000, 5000, attempts === 1);

            const { endBlock, resolutionBlock } = calculateMarketBlocks(
                currentBlock,
                durationDays,
                bufferDays
            );

            const validation = validateMarketBlocks(currentBlock, endBlock, resolutionBlock);

            if (!validation.valid) {
                if (attempts < maxRetries) {
                    console.warn(`⚠️  Validation failed on attempt ${attempts}/${maxRetries}`);
                    console.warn(`   Trying with fallback durations...`);
                    
                    const fallbackResult = calculateMarketBlocks(
                        currentBlock,
                        fallbackDurationDays,
                        fallbackBufferDays
                    );

                    const fallbackValidation = validateMarketBlocks(
                        currentBlock,
                        fallbackResult.endBlock,
                        fallbackResult.resolutionBlock
                    );

                    if (fallbackValidation.valid) {
                        return {
                            success: true,
                            currentBlock,
                            endBlock: fallbackResult.endBlock,
                            resolutionBlock: fallbackResult.resolutionBlock,
                            attempts
                        };
                    }
                }

                lastError = validation.errors.join('; ');
                continue;
            }

            return {
                success: true,
                currentBlock,
                endBlock,
                resolutionBlock,
                attempts
            };

        } catch (error) {
            lastError = error instanceof Error ? error.message : String(error);
            
            if (attempts < maxRetries) {
                console.warn(`⚠️  Attempt ${attempts}/${maxRetries} failed: ${lastError}`);
                console.warn(`   Retrying in ${retryDelayMs / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
            }
        }
    }

    return {
        success: false,
        error: lastError || 'Failed to recover block heights after maximum retries',
        attempts
    };
}

export async function safeGetBlockHeights(
    network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet',
    durationDays: number = 35,
    bufferDays: number = 3
): Promise<{ currentBlock: number; endBlock: number; resolutionBlock: number }> {
    const result = await recoverBlockHeights(network, durationDays, bufferDays);

    if (!result.success || !result.currentBlock || !result.endBlock || !result.resolutionBlock) {
        throw new Error(
            `Failed to get valid block heights: ${result.error || 'Unknown error'}. ` +
            `Attempted ${result.attempts} times.`
        );
    }

    return {
        currentBlock: result.currentBlock,
        endBlock: result.endBlock,
        resolutionBlock: result.resolutionBlock
    };
}
