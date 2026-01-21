import { ReactNode, useRef, useEffect } from 'react';

interface PopoverProps {
    trigger: ReactNode;
    content: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    className?: string;
}

export function Popover({ trigger, content, isOpen, onClose, className = '' }: PopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <div className={`relative inline-block ${className}`.trim()} ref={popoverRef}>
            {trigger}

            {isOpen && (
                <div className="absolute z-50 mt-2 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {content}
                </div>
            )}
        </div>
    );
}
