# Market Creation Templates - API Reference

## Types

### Template Types

```typescript
interface MarketTemplate {
  id: TemplateCategory;
  name: string;
  description: string;
  category: string;
  icon: string;
  examples: TemplateExample[];
  steps: TemplateStep[];
  commonDurations: Array<{ label: string; blocks: number }>;
  tips: string[];
  questionGuide: string;
  categoryGuide: string;
}

interface TemplateExample {
  question: string;
  category: string;
  duration: number;
}

interface TemplateStep {
  id: string;
  label: string;
  description: string;
  required: boolean;
}
```

### Validation Types

```typescript
interface ValidationState {
  question: {
    valid: boolean;
    error: string | null;
    suggestion: string | null;
  };
  duration: {
    valid: boolean;
    error: string | null;
  };
  category: {
    valid: boolean;
    error: string | null;
  };
}

interface TemplateValidationRule {
  field: string;
  rule: string;
  message: string;
  validator: (value: any) => boolean;
}
```

### Wizard State

```typescript
interface WizardState {
  currentStep: number;
  totalSteps: number;
  template: MarketTemplate | null;
  formData: {
    question: string;
    category: string;
    duration: number;
    templateId: TemplateCategory | null;
  };
  validation: ValidationState;
  isComplete: boolean;
}
```

## Hooks

### useTemplateWizard

Main hook for managing wizard state and navigation.

```typescript
function useTemplateWizard(): UseTemplateWizardReturn {
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
```

**Usage:**

```typescript
const wizard = useTemplateWizard();

wizard.setQuestion('Will Bitcoin reach $50,000?');
wizard.setDuration(1008);
wizard.setCategory('crypto');

if (wizard.validateForm()) {
  wizard.nextStep();
}
```

## Configuration

### getTemplate

Retrieve a single template by ID.

```typescript
import { getTemplate } from '@/config/templates';

const template = getTemplate('crypto_price');
console.log(template.name);  // 'Crypto Price Prediction'
console.log(template.examples); // Array of examples
```

### getAllTemplates

Get all available templates.

```typescript
import { getAllTemplates } from '@/config/templates';

const templates = getAllTemplates();
templates.forEach(t => console.log(t.name));
```

### getTemplatesByCategory

Filter templates by category.

```typescript
import { getTemplatesByCategory } from '@/config/templates';

const cryptoTemplates = getTemplatesByCategory('crypto');
const sportsTemplates = getTemplatesByCategory('sports');
```

## Validation

### validateQuestion

Validate a market question.

```typescript
import { validateQuestion } from '@/utils/templateValidation';

const result = validateQuestion('Will Bitcoin reach $50,000?');
console.log(result.valid);       // boolean
console.log(result.errors);      // string[]
console.log(result.suggestions); // string[]
```

### validateDuration

Validate market duration.

```typescript
import { validateDuration } from '@/utils/templateValidation';

const result = validateDuration(1008);
console.log(result.valid);  // boolean
console.log(result.error);  // string | null
```

### validateCategory

Validate category selection.

```typescript
import { validateCategory } from '@/utils/templateValidation';

const result = validateCategory('crypto');
console.log(result.valid);  // boolean
console.log(result.error);  // string | null
```

### validateMarketForm

Validate entire form at once.

```typescript
import { validateMarketForm } from '@/utils/templateValidation';

const validation = validateMarketForm(
  'Will Bitcoin reach $50,000?',
  1008,
  'crypto'
);

if (validation.question.valid && 
    validation.duration.valid && 
    validation.category.valid) {
  // All fields valid
}
```

### isFormValid

Quick boolean check if form is valid.

```typescript
import { isFormValid } from '@/utils/templateValidation';

if (isFormValid(question, duration, category)) {
  await createMarket(formData);
}
```

## Utilities

### getQuestionSuggestions

Get improvement suggestions for a question.

```typescript
import { getQuestionSuggestions } from '@/utils/templateValidation';

const suggestions = getQuestionSuggestions('Will Bitcoin increase?');
// ['Your question may benefit from a specific date or timeframe.', ...]
```

### formatDurationLabel

Convert blocks to human-readable duration.

```typescript
import { formatDurationLabel } from '@/utils/templateValidation';

const label = formatDurationLabel(1008);
// '1 weeks'
```

### calculateEndDate

Calculate market close date.

```typescript
import { calculateEndDate } from '@/utils/templateValidation';

const endDate = calculateEndDate(1008);
console.log(endDate); // Date object
```

### formatEndDate

Format end date as string.

```typescript
import { formatEndDate } from '@/utils/templateValidation';

const formatted = formatEndDate(1008);
// 'Mar 30, 2024, 2:30 PM'
```

### getResolutionDate

Calculate resolution date (includes 7-day buffer).

```typescript
import { getResolutionDate } from '@/utils/templateValidation';

const resDate = getResolutionDate(1008);
// 7 days after market close
```

### formatResolutionDate

Format resolution date as string.

```typescript
import { formatResolutionDate } from '@/utils/templateValidation';

const formatted = formatResolutionDate(1008);
// 'Apr 6, 2024'
```

## Analytics

### analyticsTracker

Track wizard interactions for analytics.

```typescript
import { analyticsTracker } from '@/utils/templateAnalytics';

analyticsTracker.trackTemplateSelection('crypto_price');
analyticsTracker.trackStepEntry('question');
analyticsTracker.trackValidationError('minLength', 'Too short');
analyticsTracker.trackFormCompletion({ question, duration, category });
analyticsTracker.trackMarketCreated(true);
```

## Storage

### TemplateCache

Cache template data for performance.

```typescript
import { TemplateCache } from '@/utils/templateStorage';

TemplateCache.initialize();
TemplateCache.set('key', value, 24 * 60 * 60 * 1000); // 24h TTL
const value = TemplateCache.get('key');
TemplateCache.delete('key');
TemplateCache.clear();
```

### TemplatePreferences

Store user preferences.

```typescript
import { TemplatePreferences } from '@/utils/templateStorage';

TemplatePreferences.setLastUsedTemplate('crypto_price');
const lastTemplate = TemplatePreferences.getLastUsedTemplate();

TemplatePreferences.setLastUsedDuration(1008);
const lastDuration = TemplatePreferences.getLastUsedDuration();

TemplatePreferences.saveFormDraft({ question, duration, category, templateId });
const draft = TemplatePreferences.getFormDraft();
```

## Helpers

### recommendTemplate

Get template recommendations based on question.

```typescript
import { recommendTemplate } from '@/utils/templateHelper';

const recommendations = recommendTemplate('Will Bitcoin reach $50,000?');
recommendations.forEach(rec => {
  console.log(rec.templateId);  // Recommended template ID
  console.log(rec.score);       // Confidence score 0-100
  console.log(rec.reasoning);   // Reasons for recommendation
});
```

### getTemplateComparisons

Get comparison data for all templates.

```typescript
import { getTemplateComparisons } from '@/utils/templateHelper';

const comparisons = getTemplateComparisons();
comparisons.forEach(comp => {
  console.log(comp.name);
  console.log(comp.difficulty);
  console.log(comp.estimatedTime);
  console.log(comp.bestFor);
});
```

### getTemplateHelpText

Get help text for a template.

```typescript
import { getTemplateHelpText } from '@/utils/templateHelper';

const help = getTemplateHelpText('crypto_price');
console.log(help.title);       // 'Crypto Price Predictions'
console.log(help.description); // Detailed description
console.log(help.tips);        // Array of tips
```

## Constants

### Template Categories

```typescript
import { TEMPLATE_CATEGORIES } from '@/types/template';

TEMPLATE_CATEGORIES.CRYPTO_PRICE        // 'crypto_price'
TEMPLATE_CATEGORIES.SPORTS_OUTCOME      // 'sports_outcome'
TEMPLATE_CATEGORIES.POLITICAL_EVENT     // 'political_event'
TEMPLATE_CATEGORIES.ECONOMIC_INDICATOR  // 'economic_indicator'
TEMPLATE_CATEGORIES.TECH_RELEASE        // 'tech_release'
TEMPLATE_CATEGORIES.ENTERTAINMENT_EVENT // 'entertainment_event'
TEMPLATE_CATEGORIES.CUSTOM              // 'custom'
```

### Market Categories

```typescript
import { MARKET_CATEGORIES } from '@/types/market';

MARKET_CATEGORIES.CRYPTO        // 'crypto'
MARKET_CATEGORIES.SPORTS        // 'sports'
MARKET_CATEGORIES.POLITICS      // 'politics'
MARKET_CATEGORIES.ECONOMICS     // 'economics'
MARKET_CATEGORIES.TECHNOLOGY    // 'technology'
MARKET_CATEGORIES.ENTERTAINMENT // 'entertainment'
MARKET_CATEGORIES.OTHER         // 'other'
```

## Error Handling

All validation functions return error objects instead of throwing:

```typescript
const result = validateQuestion('');
if (!result.valid) {
  console.error(result.errors[0]); // 'Question is required'
}

const result = validateDuration(-10);
if (!result.valid) {
  console.error(result.error); // 'Duration must be greater than 0'
}
```

## Performance Notes

- Templates are statically defined (no API calls)
- Validation runs synchronously for immediate feedback
- Caching is optional but recommended for large template lists
- Analytics events are batched for efficiency
- Storage operations are wrapped in try-catch for safety
