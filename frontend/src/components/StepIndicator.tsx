interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
    onStepClick?: (index: number) => void;
    className?: string;
}

export function StepIndicator({ steps, currentStep, onStepClick, className = '' }: StepIndicatorProps) {
    const getStepState = (index: number): 'completed' | 'current' | 'upcoming' => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    return (
        <div className={`flex items-center justify-between ${className}`.trim()}>
            {steps.map((step, index) => {
                const state = getStepState(index);
                const isClickable = onStepClick && index <= currentStep;

                return (
                    <div key={index} className="flex items-center flex-1">
                        {/* Step Circle */}
                        <button
                            onClick={() => isClickable && onStepClick(index)}
                            disabled={!isClickable}
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full font-medium transition-all ${state === 'completed'
                                    ? 'bg-primary-600 text-white'
                                    : state === 'current'
                                        ? 'bg-primary-600 text-white ring-4 ring-primary-600/30'
                                        : 'bg-slate-700 text-slate-400'
                                } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                        >
                            {state === 'completed' ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </button>

                        {/* Step Label */}
                        <div className="ml-3 flex-1">
                            <p
                                className={`text-sm font-medium ${state === 'current' ? 'text-white' : 'text-slate-400'
                                    }`}
                            >
                                {step}
                            </p>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`h-0.5 flex-1 mx-4 ${index < currentStep ? 'bg-primary-600' : 'bg-slate-700'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
