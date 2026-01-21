import { ReactNode, useState } from 'react';

interface AccordionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export function Accordion({ title, children, defaultOpen = false, className = '' }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border border-slate-700 rounded-lg overflow-hidden ${className}`.trim()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors text-left"
            >
                <span className="font-medium text-white">{title}</span>
                <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            <div
                className={`transition-all duration-200 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-hidden`}
            >
                <div className="px-4 py-3 bg-slate-900/50">
                    {children}
                </div>
            </div>
        </div>
    );
}
