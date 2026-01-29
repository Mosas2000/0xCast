export class AnalyticsError extends Error {
    constructor(
        message: string,
        public code: string,
        public context?: any
    ) {
        super(message);
        this.name = 'AnalyticsError';
    }
}

export class DataFetchError extends AnalyticsError {
    constructor(message: string, context?: any) {
        super(message, 'DATA_FETCH_ERROR', context);
        this.name = 'DataFetchError';
    }
}

export class CalculationError extends AnalyticsError {
    constructor(message: string, context?: any) {
        super(message, 'CALCULATION_ERROR', context);
        this.name = 'CalculationError';
    }
}
