# Market Creation Templates and Wizards

## Overview

The Market Creation Templates and Wizards system provides users with guided, step-by-step market creation flows with built-in templates for common prediction market types. This system significantly reduces friction for new users and helps ensure market quality through validation and best practices.

## Features

### 1. Market Templates

Seven pre-built templates cover the most common market types:

- **Crypto Price Predictions** - Predict cryptocurrency price movements
- **Sports Outcomes** - Predict sports match and tournament results
- **Political Events** - Predict election and policy outcomes
- **Economic Indicators** - Predict economic metrics and trends
- **Tech Releases** - Predict technology launches and announcements
- **Entertainment Events** - Predict awards and entertainment outcomes
- **Custom Markets** - Create any prediction market with custom rules

Each template includes:
- Name and description
- Icon for visual identification
- Real-world examples for that category
- Step-by-step guidance
- Common duration presets
- Best practice tips
- Contextual help at each step

### 2. Creation Wizard

The wizard guides users through a 4-step process:

1. **Template Selection** - Choose a template or custom market
2. **Question Entry** - Write and validate the prediction question
3. **Duration Setting** - Choose market duration with preview
4. **Category Selection** - Pick an appropriate category
5. **Review** - Preview all details before creation

### 3. Real-time Validation

Questions are validated against multiple criteria:
- Minimum 10 characters, maximum 500 characters
- Question mark for clarity
- Specific dates or timeframes
- No dangerous characters
- Helpful suggestions for improvement

### 4. Contextual Help

Each step provides:
- Inline help text and examples
- Tips specific to the template
- Real examples from that category
- Warnings about common mistakes
- Expected market close date preview

### 5. Mobile-Friendly Design

- Responsive grid layouts
- Touch-friendly button sizes
- Clear progress indicators
- Readable text sizes
- Accessible form controls

## Usage

### For Users

1. Navigate to Create Market
2. Select a template matching your prediction
3. Write your market question (validation helps with clarity)
4. Set the market duration
5. Review all details
6. Confirm to create the market

### For Developers

#### Basic Integration

```typescript
import { MarketCreationWizard } from '@/components/MarketCreationWizard';

function CreatePage() {
  return <MarketCreationWizard />;
}
```

#### Using the Wizard Hook

```typescript
import { useTemplateWizard } from '@/hooks/useTemplateWizard';

function MyForm() {
  const wizard = useTemplateWizard();

  return (
    <div>
      <input 
        value={wizard.question}
        onChange={(e) => wizard.setQuestion(e.target.value)}
      />
      <button onClick={wizard.nextStep}>Next</button>
      <div>Step {wizard.currentStep + 1} of {wizard.totalSteps}</div>
    </div>
  );
}
```

#### Using Template Configuration

```typescript
import { getTemplate, getAllTemplates } from '@/config/templates';

const cryptoTemplate = getTemplate('crypto_price');
const allTemplates = getAllTemplates();

// Access template data
console.log(cryptoTemplate.examples);
console.log(cryptoTemplate.tips);
```

#### Validation

```typescript
import { validateMarketForm, isFormValid } from '@/utils/templateValidation';

const validation = validateMarketForm(question, duration, category);

if (validation.question.valid && validation.duration.valid) {
  // All fields are valid
}

const isValid = isFormValid(question, duration, category);
```

## File Structure

### Types
- `frontend/src/types/template.ts` - Type definitions for templates and validation

### Configuration
- `frontend/src/config/templates.ts` - Template definitions with examples and guides

### Utilities
- `frontend/src/utils/templateValidation.ts` - Validation logic and helper functions

### Hooks
- `frontend/src/hooks/useTemplateWizard.ts` - Wizard state management hook

### Components
- `frontend/src/components/TemplateSelection.tsx` - Template chooser UI
- `frontend/src/components/QuestionForm.tsx` - Question and settings form
- `frontend/src/components/MarketReview.tsx` - Preview and confirmation
- `frontend/src/components/WizardProgress.tsx` - Step progress indicator
- `frontend/src/components/TemplateHelp.tsx` - Contextual help sidebar
- `frontend/src/components/MarketCreationWizard.tsx` - Main wizard container

### Tests
- `tests/templateValidation.test.ts` - Validation logic tests
- `tests/templates.test.ts` - Template configuration tests

## Customization

### Adding a New Template

Edit `frontend/src/config/templates.ts`:

```typescript
export const marketTemplates: Record<TemplateCategory, MarketTemplate> = {
  // ... existing templates ...
  [TEMPLATE_CATEGORIES.NEW_TYPE]: {
    id: TEMPLATE_CATEGORIES.NEW_TYPE,
    name: 'New Template',
    description: 'Description here',
    category: 'category-name',
    icon: '📊',
    examples: [
      {
        question: 'Example question here?',
        category: 'category-name',
        duration: 1008,
      },
    ],
    steps: [ /* ... */ ],
    commonDurations: [ /* ... */ ],
    tips: [ /* tips array */ ],
    questionGuide: 'Guide text',
    categoryGuide: 'Category guide',
  },
};
```

### Customizing Validation Rules

Edit `frontend/src/types/template.ts` and `frontend/src/utils/templateValidation.ts`:

```typescript
export const QUESTION_VALIDATION_RULES: TemplateValidationRule[] = [
  // Add your custom rules here
  {
    field: 'question',
    rule: 'customRule',
    message: 'Error message',
    validator: (value: string) => {
      // Your validation logic
      return true;
    },
  },
];
```

### Styling

Components use inline styles for maintainability. To customize:
- Edit color values in component files
- Common colors:
  - Primary: `#00D9FF` (cyan)
  - Dark bg: `#0A0A0A` (black)
  - Text: `#FFFFFF` (white)
  - Secondary text: `#9CA3AF` (gray)

## Acceptance Criteria Met

✓ **Templates created for common markets** - 6 pre-built + 1 custom template
✓ **Wizard UI smooth** - 4-step wizard with progress tracking
✓ **Validation helpful** - Real-time validation with suggestions
✓ **Examples provided** - 3-5 examples per template
✓ **Help contextual** - Template-specific help at each step
✓ **Mobile-friendly** - Responsive design with good touch targets

## Testing

Run the test suite:

```bash
npm test -- templateValidation.test.ts
npm test -- templates.test.ts
```

Tests verify:
- Validation logic for questions, durations, and categories
- Template structure and consistency
- Example quality and validity
- Form validation workflows

## Performance Considerations

- Templates are statically defined for instant access
- No network requests during wizard flow
- Validation runs immediately as user types
- Progress can be resumed from any step
- Minimal component re-renders

## Future Enhancements

- Multi-language support for templates and help text
- Analytics tracking for completion rates
- Template usage recommendations based on trending topics
- Community-contributed templates
- Advanced validation with AI-powered suggestions
- Estimated resolution date calculations
- Integration with oracle data sources
