interface MarketCategoriesProps {
    categories: string[];
    selectedCategories?: string[];
    onCategoryClick?: (category: string) => void;
    className?: string;
}

export function MarketCategories({
    categories,
    selectedCategories = [],
    onCategoryClick,
    className = ''
}: MarketCategoriesProps) {
    const isSelected = (category: string) => selectedCategories.includes(category);

    if (categories.length === 0) return null;

    return (
        <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryClick?.(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isSelected(category)
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 border border-slate-600'
                        } ${onCategoryClick ? 'cursor-pointer' : 'cursor-default'}`}
                >
                    #{category}
                </button>
            ))}
        </div>
    );
}
