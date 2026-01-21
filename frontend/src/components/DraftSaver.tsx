import { useEffect } from 'react';
import { useDraft } from '../hooks/useDraft';

interface DraftSaverProps {
    formData: {
        question: string;
        endDate: string;
        resolutionDate: string;
    };
    onRestore: (data: any) => void;
    className?: string;
}

export function DraftSaver({ formData, onRestore, className = '' }: DraftSaverProps) {
    const { draft, saveDraft, clearDraft, isSaving } = useDraft('market-creation');

    // Auto-save every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (formData.question || formData.endDate || formData.resolutionDate) {
                saveDraft(formData);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [formData, saveDraft]);

    // Check for draft on mount
    useEffect(() => {
        if (draft && !formData.question && !formData.endDate) {
            // Show restore option
            const shouldRestore = window.confirm(
                'We found a saved draft. Would you like to restore it?'
            );
            if (shouldRestore) {
                onRestore(draft);
            } else {
                clearDraft();
            }
        }
    }, []); // Only run on mount

    if (!formData.question && !formData.endDate) {
        return null;
    }

    return (
        <div className={`flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700 rounded-lg ${className}`.trim()}>
            <div className="flex items-center space-x-2">
                {isSaving ? (
                    <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-400">Saving draft...</span>
                    </>
                ) : (
                    <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-slate-400">Draft saved</span>
                    </>
                )}
            </div>

            <button
                onClick={clearDraft}
                className="text-sm text-slate-400 hover:text-white transition-colors"
            >
                Clear draft
            </button>
        </div>
    );
}
