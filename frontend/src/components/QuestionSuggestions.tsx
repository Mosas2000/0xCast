interface QuestionSuggestionsProps {
    onSelect: (question: string) => void;
    className?: string;
}

const trendingTopics = [
    'AI & Technology',
    'Cryptocurrency',
    'Politics',
    'Climate',
    'Space Exploration',
];

const suggestions = [
    'Will AI surpass human intelligence by 2030?',
    'Will Bitcoin reach $100,000 in 2026?',
    'Will there be a manned Mars mission by 2030?',
    'Will global temperatures rise by 2°C by 2030?',
    'Will quantum computers break current encryption by 2028?',
    'Will electric vehicles outsell gas cars by 2027?',
    'Will a major tech company launch a VR headset this year?',
    'Will renewable energy exceed 50% of global production by 2030?',
];

const whatIfPrompts = [
    'What if a new cryptocurrency overtakes Bitcoin?',
    'What if AI becomes sentient?',
    'What if we discover alien life?',
    'What if fusion energy becomes viable?',
    'What if a major social media platform shuts down?',
];

export function QuestionSuggestions({ onSelect, className = '' }: QuestionSuggestionsProps) {
    return (
        <div className={className}>
            <h3 className="text-lg font-semibold text-white mb-4">Question Ideas</h3>

            {/* Trending Topics */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Trending Topics</h4>
                <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                        <span
                            key={topic}
                            className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
            </div>

            {/* Popular Questions */}
            <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Popular Questions</h4>
                <div className="space-y-2">
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(suggestion)}
                            className="w-full p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-primary-500 rounded-lg text-left text-sm text-slate-300 hover:text-white transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            {/* What If Prompts */}
            <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">"What If..." Prompts</h4>
                <div className="space-y-2">
                    {whatIfPrompts.slice(0, 3).map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(prompt + '?')}
                            className="w-full p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-primary-500 rounded-lg text-left text-sm text-slate-300 hover:text-white transition-all"
                        >
                            💡 {prompt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
