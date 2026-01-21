interface Template {
    id: string;
    name: string;
    category: 'crypto' | 'events' | 'sports';
    icon: string;
    questionTemplate: string;
    description: string;
}

interface MarketTemplatesProps {
    onSelect: (template: Template) => void;
    className?: string;
}

const templates: Template[] = [
    {
        id: 'btc-price',
        name: 'Bitcoin Price',
        category: 'crypto',
        icon: '₿',
        questionTemplate: 'Will Bitcoin reach $[PRICE] by [DATE]?',
        description: 'Predict BTC price movements',
    },
    {
        id: 'eth-price',
        name: 'Ethereum Price',
        category: 'crypto',
        icon: 'Ξ',
        questionTemplate: 'Will Ethereum reach $[PRICE] by [DATE]?',
        description: 'Predict ETH price movements',
    },
    {
        id: 'election',
        name: 'Election Outcome',
        category: 'events',
        icon: '🗳️',
        questionTemplate: 'Will [CANDIDATE] win the [ELECTION] election?',
        description: 'Political election predictions',
    },
    {
        id: 'product-launch',
        name: 'Product Launch',
        category: 'events',
        icon: '🚀',
        questionTemplate: 'Will [COMPANY] launch [PRODUCT] by [DATE]?',
        description: 'Tech product releases',
    },
    {
        id: 'sports-game',
        name: 'Sports Match',
        category: 'sports',
        icon: '⚽',
        questionTemplate: 'Will [TEAM] win against [OPPONENT] on [DATE]?',
        description: 'Sports game outcomes',
    },
    {
        id: 'championship',
        name: 'Championship',
        category: 'sports',
        icon: '🏆',
        questionTemplate: 'Will [TEAM] win the [CHAMPIONSHIP]?',
        description: 'Tournament winners',
    },
];

export function MarketTemplates({ onSelect, className = '' }: MarketTemplatesProps) {
    const categories = ['crypto', 'events', 'sports'] as const;

    return (
        <div className={className}>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>

            {categories.map((category) => {
                const categoryTemplates = templates.filter((t) => t.category === category);

                return (
                    <div key={category} className="mb-6">
                        <h4 className="text-sm font-medium text-slate-400 uppercase mb-3">
                            {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelect(template)}
                                    className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-primary-500 rounded-lg text-left transition-all group"
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">{template.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-medium text-white group-hover:text-primary-400 transition-colors">
                                                {template.name}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
