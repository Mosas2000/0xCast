# Market Creation Templates - Integration Guide

## Quick Start

### 1. Add Route to Router

In your `App.tsx` or routing file:

```typescript
import { MarketCreationWizard } from './components/MarketCreationWizard';

function AppRoutes() {
  return (
    <Routes>
      {/* ... other routes ... */}
      <Route path="/create-market-wizard" element={<MarketCreationWizard />} />
    </Routes>
  );
}
```

### 2. Update Navigation

Add a link to the wizard:

```typescript
<NavLink to="/create-market-wizard">
  Create Market (Wizard)
</NavLink>
```

Or keep the original create flow and add wizard as an option:

```typescript
// In CreateMarketPage.tsx
import { useNavigate } from 'react-router-dom';

function CreateMarketPage() {
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/create-market-wizard')}>
        Use Wizard
      </button>
      {/* ... original form ... */}
    </div>
  );
}
```

## Component Integration

### Using Individual Components

If you want to use template components individually:

```typescript
import { TemplateSelection } from '@/components/TemplateSelection';
import { QuestionForm } from '@/components/QuestionForm';
import { MarketReview } from '@/components/MarketReview';

function CustomWizard() {
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState(null);
  const [question, setQuestion] = useState('');

  return (
    <div>
      {step === 0 && (
        <TemplateSelection
          selectedTemplate={template}
          onSelectTemplate={(id) => {
            setTemplate(id);
            setStep(1);
          }}
        />
      )}
      
      {step === 1 && (
        <QuestionForm
          question={question}
          onQuestionChange={setQuestion}
          // ... other props
        />
      )}
      
      {step === 2 && (
        <MarketReview
          question={question}
          template={templates[template]}
          // ... other props
        />
      )}
    </div>
  );
}
```

### Using the Wizard Hook

```typescript
import { useTemplateWizard } from '@/hooks/useTemplateWizard';
import { useMarketCreation } from '@/hooks/useMarketCreation';

function MyMarketForm() {
  const wizard = useTemplateWizard();
  const { createMarket, state } = useMarketCreation();

  const handleCreate = async () => {
    await createMarket({
      question: wizard.question,
      category: wizard.category,
      durationBlocks: wizard.duration,
    });
  };

  return (
    <div>
      <input
        value={wizard.question}
        onChange={(e) => wizard.setQuestion(e.target.value)}
        placeholder="Your prediction question"
      />
      
      <select value={wizard.category} onChange={(e) => wizard.setCategory(e.target.value)}>
        <option value="crypto">Crypto</option>
        <option value="sports">Sports</option>
      </select>

      <button onClick={wizard.previousStep}>Back</button>
      <button onClick={wizard.nextStep}>Next</button>
      <button onClick={handleCreate} disabled={!wizard.validateForm()}>
        Create
      </button>
    </div>
  );
}
```

## Validation Integration

### Real-time Form Validation

```typescript
import { validateMarketForm, getQuestionSuggestions } from '@/utils/templateValidation';

function ValidationExample() {
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(1008);
  const [category, setCategory] = useState('crypto');

  const validation = validateMarketForm(question, duration, category);
  const suggestions = getQuestionSuggestions(question);

  return (
    <div>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      
      {validation.question.error && (
        <div style={{ color: 'red' }}>
          {validation.question.error}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div style={{ color: 'orange' }}>
          {suggestions.map((s) => <p key={s}>{s}</p>)}
        </div>
      )}
    </div>
  );
}
```

### Custom Validation

```typescript
import { QUESTION_VALIDATION_RULES } from '@/types/template';

function addCustomValidation() {
  // Add your custom rule
  QUESTION_VALIDATION_RULES.push({
    field: 'question',
    rule: 'customDomain',
    message: 'Question must be about crypto',
    validator: (value: string) => {
      const cryptoKeywords = ['bitcoin', 'ethereum', 'crypto', 'price'];
      return cryptoKeywords.some(keyword => value.toLowerCase().includes(keyword));
    },
  });
}
```

## Template Customization

### Using Template Examples

```typescript
import { getTemplate } from '@/config/templates';

function TemplateExamples() {
  const template = getTemplate('crypto_price');
  
  return (
    <div>
      <h3>Example Markets:</h3>
      {template.examples.map((example) => (
        <div key={example.question}>
          <p>{example.question}</p>
          <small>Duration: {example.duration} blocks</small>
        </div>
      ))}
    </div>
  );
}
```

### Creating a Custom Template

```typescript
import { MarketTemplate, TEMPLATE_CATEGORIES } from '@/types/template';

const myTemplate: MarketTemplate = {
  id: TEMPLATE_CATEGORIES.CUSTOM,
  name: 'My Custom Template',
  description: 'Description',
  category: 'other',
  icon: '🎯',
  examples: [
    {
      question: 'Will X happen by date Y?',
      category: 'other',
      duration: 1008,
    },
  ],
  steps: [
    {
      id: 'select-template',
      label: 'Select Template',
      description: 'Choose a template',
      required: true,
    },
    // ... more steps
  ],
  commonDurations: [
    { label: '1 Week', blocks: 1008 },
    { label: '1 Month', blocks: 4320 },
  ],
  tips: ['Tip 1', 'Tip 2'],
  questionGuide: 'Guide text',
  categoryGuide: 'Category guide',
};
```

## Analytics Integration

### Tracking Wizard Usage

```typescript
import { useTemplateWizard } from '@/hooks/useTemplateWizard';

function TrackingExample() {
  const wizard = useTemplateWizard();

  useEffect(() => {
    // Track step changes
    window.gtag?.('event', 'wizard_step_change', {
      step: wizard.currentStep,
      template: wizard.templateId,
    });
  }, [wizard.currentStep, wizard.templateId]);

  return null;
}
```

### Completion Tracking

```typescript
async function handleCreateWithTracking() {
  try {
    await createMarket(formData);
    
    window.gtag?.('event', 'market_created', {
      template: wizard.templateId,
      duration: wizard.duration,
      category: wizard.category,
    });
  } catch (error) {
    window.gtag?.('event', 'market_creation_failed', {
      error: error.message,
      step: wizard.currentStep,
    });
  }
}
```

## Error Handling

### Form Validation Errors

```typescript
function ErrorHandling() {
  const wizard = useTemplateWizard();
  const [showErrors, setShowErrors] = useState(false);

  const handleNext = () => {
    if (!wizard.validateForm()) {
      setShowErrors(true);
      return;
    }
    wizard.nextStep();
  };

  return (
    <div>
      {showErrors && wizard.validation.question.error && (
        <Alert>{wizard.validation.question.error}</Alert>
      )}
    </div>
  );
}
```

### Creation Failures

```typescript
function CreationError() {
  const { state } = useMarketCreation();

  return (
    <div>
      {state.error && (
        <div style={{ color: 'red', padding: '16px', marginTop: '16px' }}>
          <strong>Error:</strong> {state.error}
          <button onClick={() => resetState()}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

## Testing Integration

### Testing the Wizard

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarketCreationWizard } from '@/components/MarketCreationWizard';

describe('MarketCreationWizard', () => {
  it('should render template selection on first step', () => {
    render(<MarketCreationWizard />);
    expect(screen.getByText(/Choose a Template/i)).toBeInTheDocument();
  });

  it('should validate form before proceeding', () => {
    const wizard = useTemplateWizard();
    wizard.setQuestion('');
    expect(wizard.validateForm()).toBe(false);
  });
});
```

## Migration from Old Flow

### Option 1: Replace Entirely

Replace the old CreateMarketPage with the new wizard:

```typescript
// Before
<Route path="/create-market" element={<CreateMarketPage />} />

// After
<Route path="/create-market" element={<MarketCreationWizard />} />
```

### Option 2: Provide Both Options

Keep both and let users choose:

```typescript
function CreateMarketHub() {
  const [choice, setChoice] = useState<'wizard' | 'form' | null>(null);

  if (choice === 'wizard') {
    return <MarketCreationWizard />;
  }

  if (choice === 'form') {
    return <CreateMarketPage />;
  }

  return (
    <div>
      <button onClick={() => setChoice('wizard')}>
        Create with Wizard (Recommended)
      </button>
      <button onClick={() => setChoice('form')}>
        Create with Form (Advanced)
      </button>
    </div>
  );
}
```

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const MarketCreationWizard = lazy(() => 
  import('./components/MarketCreationWizard').then(m => ({ 
    default: m.MarketCreationWizard 
  }))
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MarketCreationWizard />
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo } from 'react';

const TemplateSelection = memo(function TemplateSelection(props) {
  return (/* ... */);
});
```

## Accessibility

All components support keyboard navigation:
- Tab to navigate between elements
- Enter to select/submit
- Escape to go back (optional)
- Screen reader friendly labels

Components follow WCAG 2.1 AA standards with:
- Sufficient color contrast
- Clear focus indicators
- Semantic HTML
- ARIA labels where needed

## Deployment Checklist

- [ ] Routes configured
- [ ] Styles match brand guidelines
- [ ] Mobile responsiveness tested
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Error messages user-friendly
- [ ] Analytics tracking in place
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Staging environment tested
