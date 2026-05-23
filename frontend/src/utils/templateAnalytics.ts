import { TemplateCategory } from '@/types/template';

type TemplateEventData = Record<string, string | number | boolean | null | undefined>;

export interface TemplateAnalytics {
  templateId: TemplateCategory;
  templateName: string;
  usageCount: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropoffRate: number;
  mostCommonCategory: string;
  mostCommonDuration: number;
}

export interface StepAnalytics {
  stepId: string;
  stepLabel: string;
  entryCount: number;
  completionCount: number;
  dropoffCount: number;
  averageTimeSpent: number;
}

export interface ValidationAnalytics {
  errorType: string;
  errorMessage: string;
  frequency: number;
  usersFailed: number;
  successRateAfterError: number;
}

interface TemplateSession {
  templateId: TemplateCategory;
  startTime: number;
  stepHistory: Array<{ stepId: string; entryTime: number; exitTime: number }>;
  validationErrors: Array<{ errorType: string; errorMessage: string; timestamp: number }>;
  completionTime?: number;
  totalSessionTime?: number;
  success?: boolean;
}

interface ValidationAttempt {
  field: string;
  error: string;
  timestamp: number;
}

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: TemplateEventData & { event_category?: string }) => void;
    amplitude?: {
      track: (eventName: string, properties?: TemplateEventData & { sessionId?: string }) => void;
    };
  }
}

class TemplateAnalyticsTracker {
  private templateSessions: Map<string, TemplateSession> = new Map();
  private validateAttempts: Map<string, ValidationAttempt[]> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  trackTemplateSelection(templateId: TemplateCategory): void {
    const sessionKey = this.sessionId;

    if (!this.templateSessions.has(sessionKey)) {
      this.templateSessions.set(sessionKey, {
        templateId,
        startTime: Date.now(),
        stepHistory: [],
        validationErrors: [],
      });
    }

    this.sendEvent('template_selected', { templateId });
  }

  trackStepEntry(stepId: string): void {
    const session = this.templateSessions.get(this.sessionId);
    if (session) {
      session.stepHistory.push({
        stepId,
        entryTime: Date.now(),
        exitTime: 0,
      });
    }

    this.sendEvent('step_entered', { stepId });
  }

  trackStepExit(stepId: string): void {
    const session = this.templateSessions.get(this.sessionId);
    if (session) {
      const lastStep = session.stepHistory[session.stepHistory.length - 1];
      if (lastStep && lastStep.stepId === stepId) {
        lastStep.exitTime = Date.now();
      }
    }

    this.sendEvent('step_exited', { stepId });
  }

  trackValidationError(errorType: string, errorMessage: string): void {
    const session = this.templateSessions.get(this.sessionId);
    if (session) {
      session.validationErrors.push({
        errorType,
        errorMessage,
        timestamp: Date.now(),
      });
    }

    this.sendEvent('validation_error', { errorType, errorMessage });
  }

  trackFormCompletion(formData: {
    question: string;
    duration: number;
    category: string;
  }): void {
    const session = this.templateSessions.get(this.sessionId);
    if (session) {
      session.completionTime = Date.now() - session.startTime;
    }

    this.sendEvent('form_completed', {
      questionLength: formData.question.length,
      duration: formData.duration,
      category: formData.category,
    });
  }

  trackMarketCreated(success: boolean, error?: string): void {
    const session = this.templateSessions.get(this.sessionId);
    if (session) {
      session.totalSessionTime = Date.now() - session.startTime;
      session.success = success;
    }

    if (success) {
      this.sendEvent('market_created_success');
    } else {
      this.sendEvent('market_creation_failed', { error });
    }
  }

  getSessionAnalytics(): {
    templateId: TemplateCategory;
    totalTime: number;
    completionTime: number | undefined;
    stepCount: number;
    errorCount: number;
    success: boolean;
    steps: Array<{ stepId: string; duration: number }>;
  } | null {
    const session = this.templateSessions.get(this.sessionId);
    if (!session) return null;

    return {
      templateId: session.templateId,
      totalTime: session.totalSessionTime ?? Date.now() - session.startTime,
      completionTime: session.completionTime,
      stepCount: session.stepHistory.length,
      errorCount: session.validationErrors.length,
      success: session.success ?? false,
      steps: session.stepHistory.map(step => ({
        stepId: step.stepId,
        duration: step.exitTime - step.entryTime,
      })),
    };
  }

  private sendEvent(eventName: string, eventData?: TemplateEventData): void {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'market_creation_wizard',
        ...eventData,
      });
    }

    if (window.amplitude) {
      window.amplitude.track(eventName, {
        ...eventData,
        sessionId: this.sessionId,
      });
    }
  }

  resetSession(): void {
    this.sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const analyticsTracker = new TemplateAnalyticsTracker();
