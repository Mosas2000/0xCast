interface ValidationResult {
    isValid: boolean;
    message: string;
    type: 'success' | 'warning' | 'error';
}

interface MarketValidationProps {
    formData: {
        question: string;
        endDate: string;
        resolutionDate: string;
    };
    className?: string;
}

export function MarketValidation({ formData, className = '' }: MarketValidationProps) {
    const validations: ValidationResult[] = [];

    // Question validation
    if (formData.question) {
        if (formData.question.length < 10) {
            validations.push({
                isValid: false,
                message: 'Question should be at least 10 characters',
                type: 'error',
            });
        } else if (!formData.question.endsWith('?')) {
            validations.push({
                isValid: false,
                message: 'Question should end with a question mark',
                type: 'warning',
            });
        } else if (formData.question.length > 200) {
            validations.push({
                isValid: false,
                message: 'Question is too long (max 200 characters)',
                type: 'error',
            });
        } else {
            validations.push({
                isValid: true,
                message: 'Question looks good',
                type: 'success',
            });
        }
    }

    // Date validation
    if (formData.endDate && formData.resolutionDate) {
        const endDate = new Date(formData.endDate);
        const resolutionDate = new Date(formData.resolutionDate);
        const now = new Date();

        if (endDate <= now) {
            validations.push({
                isValid: false,
                message: 'End date must be in the future',
                type: 'error',
            });
        } else if (resolutionDate <= endDate) {
            validations.push({
                isValid: false,
                message: 'Resolution date must be after end date',
                type: 'error',
            });
        } else {
            validations.push({
                isValid: true,
                message: 'Dates are valid',
                type: 'success',
            });
        }
    }

    const getIcon = (type: ValidationResult['type']) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (validations.length === 0) return null;

    return (
        <div className={`space-y-2 ${className}`.trim()}>
            {validations.map((validation, index) => (
                <div
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${validation.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/50'
                            : validation.type === 'warning'
                                ? 'bg-yellow-500/10 border border-yellow-500/50'
                                : 'bg-red-500/10 border border-red-500/50'
                        }`}
                >
                    {getIcon(validation.type)}
                    <p
                        className={`text-sm ${validation.type === 'success'
                                ? 'text-green-400'
                                : validation.type === 'warning'
                                    ? 'text-yellow-400'
                                    : 'text-red-400'
                            }`}
                    >
                        {validation.message}
                    </p>
                </div>
            ))}
        </div>
    );
}
