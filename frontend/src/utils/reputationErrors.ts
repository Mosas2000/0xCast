export class ReputationError extends Error {
  constructor(message: string, public code: string = 'REPUTATION_ERROR') {
    super(message);
    this.name = 'ReputationError';
  }
}

export class ValidationError extends ReputationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UserNotFoundError extends ReputationError {
  constructor(userId: string) {
    super(`User ${userId} not found`, 'USER_NOT_FOUND');
    this.name = 'UserNotFoundError';
  }
}

export class KYCError extends ReputationError {
  constructor(message: string) {
    super(message, 'KYC_ERROR');
    this.name = 'KYCError';
  }
}

export class FraudDetectionError extends ReputationError {
  constructor(message: string) {
    super(message, 'FRAUD_DETECTION_ERROR');
    this.name = 'FraudDetectionError';
  }
}

export class AccountLinkingError extends ReputationError {
  constructor(message: string) {
    super(message, 'ACCOUNT_LINKING_ERROR');
    this.name = 'AccountLinkingError';
  }
}

export class AMLError extends ReputationError {
  constructor(message: string) {
    super(message, 'AML_ERROR');
    this.name = 'AMLError';
  }
}

export class DataIntegrityError extends ReputationError {
  constructor(message: string) {
    super(message, 'DATA_INTEGRITY_ERROR');
    this.name = 'DataIntegrityError';
  }
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  timestamp?: number;
  details?: Record<string, any>;
}

export class ErrorHandler {
  private static errorLog: Array<{
    error: Error;
    context: ErrorContext;
    timestamp: number;
  }> = [];

  static handle(error: Error, context: ErrorContext = {}): void {
    const entry = {
      error,
      context: { ...context, timestamp: Date.now() },
      timestamp: Date.now(),
    };

    this.errorLog.push(entry);

    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-500);
    }

    console.error(`[${error.name}] ${error.message}`, {
      context,
      stack: error.stack,
    });
  }

  static getErrors(limit: number = 50): typeof this.errorLog {
    return this.errorLog.slice(-limit);
  }

  static clear(): void {
    this.errorLog = [];
  }

  static export(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  static getRecentErrors(
    minutesBack: number = 60,
  ): typeof this.errorLog {
    const cutoff = Date.now() - minutesBack * 60 * 1000;
    return this.errorLog.filter((entry) => entry.timestamp > cutoff);
  }

  static getErrorsByType(errorName: string): typeof this.errorLog {
    return this.errorLog.filter((entry) => entry.error.name === errorName);
  }

  static getErrorsByUser(userId: string): typeof this.errorLog {
    return this.errorLog.filter((entry) => entry.context.userId === userId);
  }
}

export function assertUserExists(userId: string | undefined): asserts userId {
  if (!userId || userId.trim() === '') {
    throw new UserNotFoundError(userId || 'undefined');
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email: ${email}`);
  }
}

export function validatePhoneNumber(phone: string): void {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError(`Invalid phone number: ${phone}`);
  }
}

export function validateWalletAddress(address: string): void {
  const isStacks = address.startsWith('S') && /^S[0-9A-Z]{33}$/.test(address);
  const isEthereum = /^(0x)?[0-9a-fA-F]{40}$/.test(address);

  if (!isStacks && !isEthereum) {
    throw new ValidationError(`Invalid wallet address: ${address}`);
  }
}

export function validateReputationScore(score: number): void {
  if (typeof score !== 'number') {
    throw new ValidationError('Score must be a number');
  }
  if (score < 0 || score > 100) {
    throw new ValidationError('Score must be between 0 and 100');
  }
}

export function validateCompletionRate(rate: number): void {
  if (typeof rate !== 'number') {
    throw new ValidationError('Completion rate must be a number');
  }
  if (rate < 0 || rate > 1) {
    throw new ValidationError('Completion rate must be between 0 and 1');
  }
}

export function validateTransactionVolume(volume: number): void {
  if (typeof volume !== 'number') {
    throw new ValidationError('Transaction volume must be a number');
  }
  if (volume < 0) {
    throw new ValidationError('Transaction volume must be non-negative');
  }
}

export function validateResponseTime(time: number): void {
  if (typeof time !== 'number') {
    throw new ValidationError('Response time must be a number');
  }
  if (time < 0) {
    throw new ValidationError('Response time must be non-negative');
  }
}

export function validateAccountAge(days: number): void {
  if (typeof days !== 'number') {
    throw new ValidationError('Account age must be a number');
  }
  if (days < 0) {
    throw new ValidationError('Account age must be non-negative');
  }
}

export function validateVerificationLevel(level: string): void {
  const validLevels = ['none', 'level1', 'level2', 'level3'];
  if (!validLevels.includes(level)) {
    throw new ValidationError(`Verification level must be one of: ${validLevels.join(', ')}`);
  }
}

export function validateFraudAlertType(type: string): void {
  const validTypes = [
    'wash_trading',
    'sybil_attack',
    'pump_and_dump',
    'price_manipulation',
    'volume_spoofing',
    'unusual_pattern',
  ];
  if (!validTypes.includes(type)) {
    throw new FraudDetectionError(`Invalid fraud alert type: ${type}`);
  }
}

export function validateKYCStatus(status: string): void {
  const validStatuses = ['none', 'in_progress', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new KYCError(`Invalid KYC status: ${status}`);
  }
}

export function validateAccountLinkType(type: string): void {
  const validTypes = ['email', 'phone', 'wallet', 'social'];
  if (!validTypes.includes(type)) {
    throw new AccountLinkingError(`Invalid account link type: ${type}`);
  }
}

export function safeExecute<T>(
  fn: () => T,
  context: ErrorContext = {},
): { success: boolean; data?: T; error?: Error } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handle(err, context);
    return { success: false, error: err };
  }
}

export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  context: ErrorContext = {},
): Promise<{ success: boolean; data?: T; error?: Error }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    ErrorHandler.handle(err, context);
    return { success: false, error: err };
  }
}
