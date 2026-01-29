import React from 'react';
import { Hourglass, AlertCircle } from 'lucide-react';

/**
 * Homepage section for markets nearing their resolution time, emphasizing urgency.
 */
export const EndingSoonSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <section className="py-12 px-6 bg-white/5 border-y border-white/10 relative overflow-hidden">
            {/* Background Subtle Urgency Pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Hourglass size={200} className="animate-spin-slow" />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center space-x-2 text-rose-400 mb-2">
                        <AlertCircle size={18} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Urgent Markets</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white font-display">Ending Extremely Soon</h2>
                </div>
                <p className="text-slate-400 text-sm max-w-xs md:text-right">
                    Last chance to place your predictions before these markets close for resolution.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {children}
            </div>
        </section>
    );
};
