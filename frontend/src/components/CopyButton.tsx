import { useClipboard } from '../hooks/useClipboard';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
}

/**
 * Reusable copy button component with visual feedback
 * Icon changes on successful copy
 */
export function CopyButton({ text, label, className = '' }: CopyButtonProps) {
    const { copied, copy } = useClipboard();

    const handleCopy = () => {
        copy(text);
    };

    return (
        <button
            onClick={handleCopy}
            className={`
                inline-flex items-center gap-2 px-3 py-1.5
                bg-slate-700 hover:bg-slate-600
                text-slate-300 hover:text-white
                rounded-lg transition-all duration-200
                text-sm font-medium
                ${copied ? 'ring-2 ring-green-500/50' : ''}
                ${className}
            `.trim()}
            title={copied ? 'Copied!' : 'Click to copy'}
        >
            {copied ? (
                <>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    {label && <span>{label}</span>}
                </>
            )}
        </button>
    );
}
