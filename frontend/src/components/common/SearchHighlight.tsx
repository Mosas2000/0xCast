import React from 'react';

interface SearchHighlightProps {
    text: string;
    query: string;
}

/**
 * Component to highlight matching text within a string for search results.
 */
export const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, query }) => {
    if (!query.trim()) {
        return <>{text}</>;
    }

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-primary-500/30 text-primary-200 rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
};
