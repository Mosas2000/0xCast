import { useState, ReactNode } from 'react';
import { StepIndicator } from './StepIndicator';

interface Step {
    id: string;
    title: string;
    component: ReactNode;
}

interface CreationWizardProps {
    steps: Step[];
    onComplete: () => void;
    className?: string;
}

export function CreationWizard({ steps, onComplete, className = '' }: CreationWizardProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    const handleBack = () => {
        if (!isFirstStep) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const handleStepClick = (index: number) => {
        setCurrentStepIndex(index);
    };

    return (
        <div className={className}>
            {/* Step Indicator */}
            <StepIndicator
                steps={steps.map((s) => s.title)}
                currentStep={currentStepIndex}
                onStepClick={handleStepClick}
                className="mb-8"
            />

            {/* Current Step Content */}
            <div className="mb-8">
                {currentStep.component}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={isFirstStep}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
                >
                    Back
                </button>

                <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all"
                >
                    {isLastStep ? 'Create Market' : 'Next'}
                </button>
            </div>
        </div>
    );
}
