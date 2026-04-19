#!/usr/bin/env node

import { generateQuestionFromTemplate, validateQuestionQuality, getCategoryFromQuestion } from '../frontend/src/utils/templateSuggestions';
import { TEMPLATE_CATEGORIES } from '../frontend/src/types/template';

function generateExampleMarkets() {
  const templates = Object.values(TEMPLATE_CATEGORIES).filter(t => t !== 'custom');

  console.log('# Market Creation Template Examples\n');

  templates.forEach(templateId => {
    console.log(`## ${templateId.replace(/_/g, ' ').toUpperCase()}\n`);

    try {
      for (let i = 0; i < 3; i++) {
        const question = generateQuestionFromTemplate(templateId as any, i);
        if (question) {
          const { score, feedback } = validateQuestionQuality(question);
          const category = getCategoryFromQuestion(question);

          console.log(`### Example ${i + 1}`);
          console.log(`**Question:** ${question}`);
          console.log(`**Category:** ${category}`);
          console.log(`**Quality Score:** ${score}/100`);
          if (feedback.length > 0 && !feedback[0].includes('looks good')) {
            console.log(`**Suggestions:** ${feedback.join(', ')}`);
          }
          console.log();
        }
      }
    } catch (error) {
      console.error(`Error generating examples for ${templateId}:`, error);
    }
  });
}

generateExampleMarkets();
