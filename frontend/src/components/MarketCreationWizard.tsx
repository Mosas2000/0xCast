import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from './WalletProvider';
import { useMarketCreation } from '@/hooks/useMarketCreation';
import { useTemplateWizard } from '@/hooks/useTemplateWizard';
import { getTemplate } from '@/config/templates';
import { TemplateSelection } from './TemplateSelection';
import { QuestionForm } from './QuestionForm';
import { MarketReview } from './MarketReview';
import { WizardProgress } from './WizardProgress';
import { TemplateHelp } from './TemplateHelp';
import type { CreateMarketFormData } from '@/types/market';
import type { TemplateCategory } from '@/types/template';

export function MarketCreationWizard() {
  const navigate = useNavigate();
  const { isConnected, connect } = useWallet();
  const { createMarket, state: creationState, resetState } = useMarketCreation();
  const wizard = useTemplateWizard();

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected, connect]);

  useEffect(() => {
    if (creationState.success) {
      setTimeout(() => {
        navigate('/markets');
      }, 2500);
    }
  }, [creationState.success, navigate]);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleSelectTemplate = (templateId: TemplateCategory) => {
    wizard.selectTemplate(templateId);
  };

  const handleNext = () => {
    if (wizard.currentStep === 1) {
      if (!wizard.validateForm()) {
        return;
      }
    }
    wizard.nextStep();
  };

  const handleReview = () => {
    if (!wizard.validateForm()) {
      return;
    }
    wizard.nextStep();
  };

  const handleCreate = async () => {
    if (!wizard.validateForm()) {
      return;
    }

    const formData: CreateMarketFormData = {
      question: wizard.question,
      category: wizard.category as any,
      durationBlocks: wizard.duration,
      durationPreset: undefined,
    };

    try {
      await createMarket(formData);
    } catch (error) {
      console.error('Failed to create market:', error);
    }
  };

  const selectedTemplate = wizard.templateId ? getTemplate(wizard.templateId) : null;

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    paddingTop: '120px',
    paddingBottom: '80px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '40px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#9CA3AF',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const contentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: '32px',
    alignItems: 'start',
  };

  const mainStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '20px',
    padding: '40px',
  };

  const sidebarStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const stepLabels = ['Select Template', 'Write Question', 'Review Market', 'Confirm'];

  const renderStepContent = () => {
    switch (wizard.currentStep) {
      case 0:
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF', marginBottom: '24px' }}>
              Choose a Template
            </h2>
            <div style={{ marginBottom: '24px', fontSize: '14px', color: '#9CA3AF' }}>
              Select a template to guide you through creating your market. Templates provide examples and best practices.
            </div>
            <TemplateSelection
              selectedTemplate={wizard.templateId}
              onSelectTemplate={handleSelectTemplate}
            />
            {wizard.templateId && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleNext}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#00D9FF',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000000',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF', marginBottom: '24px' }}>
              Write Your Market Question
            </h2>
            <QuestionForm
              question={wizard.question}
              duration={wizard.duration}
              category={wizard.category}
              validation={wizard.validation}
              onQuestionChange={wizard.setQuestion}
              onDurationChange={wizard.setDuration}
              onCategoryChange={wizard.setCategory}
            />
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={wizard.previousStep}
                style={{
                  padding: '12px 32px',
                  backgroundColor: 'transparent',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleReview}
                disabled={!wizard.validateForm()}
                style={{
                  padding: '12px 32px',
                  backgroundColor: wizard.validateForm() ? '#00D9FF' : '#4B5563',
                  border: 'none',
                  borderRadius: '8px',
                  color: wizard.validateForm() ? '#000000' : '#9CA3AF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: wizard.validateForm() ? 'pointer' : 'not-allowed',
                }}
              >
                Review
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#FFFFFF', marginBottom: '24px' }}>
              Review Your Market
            </h2>
            <MarketReview
              question={wizard.question}
              duration={wizard.duration}
              category={wizard.category}
              template={selectedTemplate}
              onEdit={() => wizard.goToStep(1)}
              onConfirm={handleCreate}
              isLoading={creationState.isCreating}
            />
            {creationState.error && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#7F1D1D',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '14px',
              }}>
                Error: {creationState.error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (creationState.success) {
    return (
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '20px',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '24px' }}>✓</div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', marginBottom: '16px' }}>
              Market Created Successfully!
            </h1>
            <p style={{ fontSize: '16px', color: '#9CA3AF', marginBottom: '32px' }}>
              Your market is now live. Redirecting to markets page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Create a Market</h1>
          <p style={subtitleStyle}>
            Use our guided wizard to create a prediction market with templates and best practices.
          </p>
        </div>

        <WizardProgress
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          stepLabels={stepLabels}
          onStepClick={(step) => {
            if (step < wizard.currentStep || step === 0) {
              wizard.goToStep(step);
            }
          }}
        />

        <div style={contentStyle}>
          <div style={mainStyle}>
            {renderStepContent()}
          </div>

          {wizard.currentStep > 0 && wizard.currentStep < 2 && (
            <div style={sidebarStyle}>
              <TemplateHelp
                templateId={wizard.templateId}
                step={wizard.currentStep === 0 ? 'question' : wizard.currentStep === 1 ? 'duration' : 'review'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
