import React, { ReactNode } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full bg-slate-900 border-t border-slate-800 rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-out">
                {/* Handle */}
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
                </div>

                {title && (
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden">
                    {children}
                </div>

                {/* Bottom padding for mobile safe area */}
                <div className="h-8" />
            </div>
        </div>
    );
};
