interface ExplorerLinkProps {
    txId?: string;
    address?: string;
    type: 'transaction' | 'address';
    label?: string;
    className?: string;
}

/**
 * Reusable link component to Stacks Explorer
 * Opens in new tab with proper formatting
 */
export function ExplorerLink({ txId, address, type, label, className = '' }: ExplorerLinkProps) {
    const id = type === 'transaction' ? txId : address;
    
    if (!id) return null;

    const url = type === 'transaction'
        ? `https://explorer.stacks.co/txid/${id}?chain=mainnet`
        : `https://explorer.stacks.co/address/${id}?chain=mainnet`;

    const displayLabel = label || (type === 'transaction' ? 'View Transaction' : 'View Address');
    const shortId = `${id.slice(0, 6)}...${id.slice(-4)}`;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                inline-flex items-center gap-1.5
                text-primary-400 hover:text-primary-300
                hover:underline transition-colors
                text-sm
                ${className}
            `.trim()}
            title={id}
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
            </svg>
            <span>{label || shortId}</span>
        </a>
    );
}
