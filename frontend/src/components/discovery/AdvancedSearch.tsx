import React, { useState } from 'react';

interface SearchFilters {
    category?: string;
    status?: 'active' | 'resolved' | 'all';
    minVolume?: number;
    endDate?: { from?: Date; to?: Date };
}

export const AdvancedSearch: React.FC = () => {
    const [filters, setFilters] = useState<SearchFilters>({});
    const [query, setQuery] = useState('');

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Advanced Search</h2>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search markets..."
                className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
                <select className="px-4 py-2 border rounded-lg" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">All Categories</option>
                    <option value="crypto">Crypto</option>
                    <option value="sports">Sports</option>
                    <option value="politics">Politics</option>
                </select>
                <select className="px-4 py-2 border rounded-lg" onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Search
            </button>
        </div>
    );
};
