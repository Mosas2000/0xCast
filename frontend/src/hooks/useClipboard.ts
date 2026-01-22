import { useState, useCallback } from 'react';

interface UseClipboardResult {
    copied: boolean;
    copy: (text: string) => Promise<void>;
}

/**
 * Hook for copying text to clipboard with feedback
 * Returns copied status and copy function
 */
export function useClipboard(duration: number = 2000): UseClipboardResult {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(
        async (text: string) => {
            if (!navigator?.clipboard) {
                console.warn('Clipboard API not available');
                return;
            }

            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);

                setTimeout(() => {
                    setCopied(false);
                }, duration);
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        },
        [duration]
    );

    return { copied, copy };
}
