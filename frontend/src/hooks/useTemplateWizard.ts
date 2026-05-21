import { useState, useCallback } from 'react';
import type { TemplateCategory } from '@/types/template';
import { validateMarketForm } from '@/utils/templateValidation';
import type { ValidationState } from '@/types/template';

interface UseTemplateWizardReturn {
  currentStep: number;
  totalSteps: number;
  templateId: TemplateCategory | null;
  question: string;
  duration: number;
  category: string;
  validation: ValidationState;
  isComplete: boolean;
  selectTemplate: (templateId: TemplateCategory) => void;
  setQuestion: (question: string) => void;
  setDuration: (duration: number) => void;
  setCategory: (category: string) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
  validateForm: () => boolean;
  getFormData: () => { question: string; duration: number; category: string };
}

const TOTAL_STEPS = 4;

export function useTemplateWizard(): UseTemplateWizardReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [templateId, setTemplateId] = useState<TemplateCategory | null>(null);
  const [question, setQuestionState] = useState('');
  const [duration, setDurationState] = useState(1008);
  const [category, setCategoryState] = useState('other');
  const [validation, setValidation] = useState<ValidationState>({
    question: { valid: false, error: null, suggestion: null },
    duration: { valid: true, error: null },
    category: { valid: true, error: null },
  });

  const selectTemplate = useCallback((id: TemplateCategory) => {
    setTemplateId(id);
    setCurrentStep(1);
  }, []);

  const setQuestion = useCallback((newQuestion: string) => {
    setQuestionState(newQuestion);
    const newValidation = validateMarketForm(newQuestion, duration, category);
    setValidation(newValidation);
  }, [duration, category]);

  const setDuration = useCallback((newDuration: number) => {
    setDurationState(newDuration);
    const newValidation = validateMarketForm(question, newDuration, category);
    setValidation(newValidation);
  }, [question, category]);

  const setCategory = useCallback((newCategory: string) => {
    setCategoryState(newCategory);
    const newValidation = validateMarketForm(question, duration, newCategory);
    setValidation(newValidation);
  }, [question, duration]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      setCurrentStep(step);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const validateForm = useCallback((): boolean => {
    const newValidation = validateMarketForm(question, duration, category);
    setValidation(newValidation);
    return newValidation.question.valid && newValidation.duration.valid && newValidation.category.valid;
  }, [question, duration, category]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setTemplateId(null);
    setQuestionState('');
    setDurationState(1008);
    setCategoryState('other');
    setValidation({
      question: { valid: false, error: null, suggestion: null },
      duration: { valid: true, error: null },
      category: { valid: true, error: null },
    });
  }, []);

  const getFormData = useCallback(() => {
    return { question, duration, category };
  }, [question, duration, category]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    templateId,
    question,
    duration,
    category,
    validation,
    isComplete: currentStep === TOTAL_STEPS - 1,
    selectTemplate,
    setQuestion,
    setDuration,
    setCategory,
    goToStep,
    nextStep,
    previousStep,
    reset,
    validateForm,
    getFormData,
  };
}
