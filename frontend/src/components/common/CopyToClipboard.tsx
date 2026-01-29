import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Utility component to copy text to clipboard with visual feedback.
 */
export const CopyToClipboard: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-primary-400 transition-colors focus:outline-none"
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <Check size={14} className="text-accent-500" />
                    <span className="text-xs font-medium text-accent-500">Copied!</span>
                </>
            ) : (
                <>
                    <Copy size={14} />
                    <span className="text-xs font-medium">Copy Link</span>
                </>
            )}
        </button>
    );
};
