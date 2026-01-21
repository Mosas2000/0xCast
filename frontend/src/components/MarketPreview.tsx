import { Card } from './Card';

interface MarketPreviewProps {
    formData: {
        question: string;
        endDate: string;
        resolutionDate: string;
    };
    onConfirm: () => void;
    onEdit: () => void;
    className?: string;
}

export function MarketPreview({ formData, onConfirm, onEdit, className = '' }: MarketPreviewProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className={className}>
            <h3 className="text-lg font-semibold text-white mb-4">Preview Your Market</h3>

            <Card>
                {/* Question */}
                <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-2">Market Question</p>
                    <p className="text-xl font-semibold text-white">{formData.question || 'No question entered'}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">Trading Ends</p>
                        <p className="text-white font-medium">{formatDate(formData.endDate)}</p>
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-sm text-slate-400 mb-1">Resolution Date</p>
                        <p className="text-white font-medium">{formatDate(formData.resolutionDate)}</p>
                    </div>
                </div>

                {/* Preview Info */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg mb-6">
                    <p className="text-sm text-blue-400">
                        ℹ️ This is how your market will appear to other users. Review carefully before creating.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                    <button
                        onClick={onEdit}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Edit Market
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all"
                    >
                        Create Market
                    </button>
                </div>
            </Card>
        </div>
    );
}
