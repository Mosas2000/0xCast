import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';

/**
 * Homepage section for newly created prediction markets with a horizontal scroller.
 */
export const NewMarketsSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="py-12 px-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <div className="flex items-center space-x-2 text-primary-400 mb-2">
                        <Sparkles size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">New Opportunities</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white font-display">Fresh Prediction Markets</h2>
                </div>
                <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors group">
                    <span className="text-sm font-bold">View All</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="relative group">
                <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x no-scrollbar">
                    {children}
                </div>
                {/* Gradients for scroll indication */}
                <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </section>
    );
};
