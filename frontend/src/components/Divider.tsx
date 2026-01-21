interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    text?: string;
    color?: string;
    className?: string;
}

export function Divider({
    orientation = 'horizontal',
    text,
    color = 'border-slate-700',
    className = '',
}: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div className={`h-full w-px ${color} ${className}`.trim()} />
        );
    }

    if (text) {
        return (
            <div className={`flex items-center ${className}`.trim()}>
                <div className={`flex-1 ${color} border-t`} />
                <span className="px-4 text-sm text-slate-400">{text}</span>
                <div className={`flex-1 ${color} border-t`} />
            </div>
        );
    }

    return <div className={`w-full ${color} border-t ${className}`.trim()} />;
}
