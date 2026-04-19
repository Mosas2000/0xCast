import React from 'react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

export function WizardProgress({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
}: WizardProgressProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
    position: 'relative',
  };

  const progressLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '0',
    right: '0',
    height: '2px',
    backgroundColor: '#1F1F1F',
    zIndex: 0,
  };

  const filledLineStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '0',
    height: '2px',
    backgroundColor: '#00D9FF',
    zIndex: 0,
    width: `${(currentStep / (totalSteps - 1)) * 100}%`,
    transition: 'width 0.3s ease',
  };

  const stepsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  };

  const stepStyle = (index: number): React.CSSProperties => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;

    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      cursor: onStepClick ? 'pointer' : 'default',
      flex: 1,
    };
  };

  const stepCircleStyle = (index: number): React.CSSProperties => {
    const isCompleted = index < currentStep;
    const isCurrent = index === currentStep;

    return {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600',
      backgroundColor: isCompleted ? '#00D9FF' : isCurrent ? '#00D9FF' : '#0A0A0A',
      color: isCompleted ? '#000000' : isCurrent ? '#000000' : '#6B7280',
      border: isCompleted || isCurrent ? 'none' : '2px solid #1F1F1F',
      transition: 'all 0.3s ease',
    };
  };

  const stepLabelStyle = (index: number): React.CSSProperties => {
    const isCurrent = index === currentStep;
    return {
      fontSize: '12px',
      fontWeight: isCurrent ? '600' : '400',
      color: isCurrent ? '#FFFFFF' : '#6B7280',
      textAlign: 'center',
      maxWidth: '80px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  };

  return (
    <div style={containerStyle}>
      <div style={progressLineStyle} />
      <div style={filledLineStyle} />
      <div style={stepsContainerStyle}>
        {stepLabels.map((label, index) => (
          <div
            key={index}
            style={stepStyle(index)}
            onClick={() => onStepClick?.(index)}
            role="button"
            tabIndex={0}
          >
            <div style={stepCircleStyle(index)}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div style={stepLabelStyle(index)}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
