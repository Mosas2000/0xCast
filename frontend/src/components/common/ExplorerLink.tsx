import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AddressUtils } from '../../utils/AddressUtils';

interface ExplorerLinkProps {
    txId?: string;
    address?: string;
    type?: 'tx' | 'address';
    label?: string;
}

/**
 * Reusable link component for Stacks Explorer integration.
 */
export const ExplorerLink: React.FC<ExplorerLinkProps> = ({
    txId,
    address,
    type = 'tx',
    label
}) => {
    const baseUrl = 'https://explorer.hiro.so';
    const network = 'mainnet'; // Could be dynamic based on env

    const id = type === 'tx' ? txId : address;
    if (!id) return null;

    const url = `${baseUrl}/${type}/${id}?chain=${network}`;
    const displayLabel = label || (type === 'address' ? AddressUtils.shorten(id) : AddressUtils.shorten(id, 8, 8));

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-primary-400 hover:text-primary-300 hover:underline decoration-primary-500/30 transition-all group"
        >
            <span>{displayLabel}</span>
            <ExternalLink size={12} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
    );
};
