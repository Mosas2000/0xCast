import { describe, it, expect } from 'vitest';
import { getTemplate, getAllTemplates, getTemplatesByCategory } from '../frontend/src/config/templates';
import { TEMPLATE_CATEGORIES } from '../frontend/src/types/template';

describe('Market Templates Configuration', () => {
  describe('getTemplate', () => {
    it('should return template for valid ID', () => {
      const template = getTemplate(TEMPLATE_CATEGORIES.CRYPTO_PRICE);
      expect(template).toBeDefined();
      expect(template?.id).toBe(TEMPLATE_CATEGORIES.CRYPTO_PRICE);
    });

    it('should have all required properties', () => {
      const template = getTemplate(TEMPLATE_CATEGORIES.SPORTS_OUTCOME);
      expect(template).toBeDefined();
      expect(template?.name).toBeDefined();
      expect(template?.description).toBeDefined();
      expect(template?.category).toBeDefined();
      expect(template?.icon).toBeDefined();
      expect(template?.examples).toBeDefined();
      expect(template?.steps).toBeDefined();
      expect(template?.tips).toBeDefined();
      expect(Array.isArray(template?.steps)).toBe(true);
    });

    it('should have steps for each template', () => {
      const templateIds = [
        TEMPLATE_CATEGORIES.CRYPTO_PRICE,
        TEMPLATE_CATEGORIES.SPORTS_OUTCOME,
        TEMPLATE_CATEGORIES.POLITICAL_EVENT,
      ];

      templateIds.forEach(id => {
        const template = getTemplate(id);
        expect(template?.steps.length).toBeGreaterThan(0);
        expect(template?.steps[0].id).toBe('select-template');
      });
    });

    it('should have examples for non-custom templates', () => {
      const template = getTemplate(TEMPLATE_CATEGORIES.CRYPTO_PRICE);
      expect(template?.examples.length).toBeGreaterThan(0);
    });

    it('should have tips for each template', () => {
      const templateIds = Object.values(TEMPLATE_CATEGORIES);
      templateIds.forEach(id => {
        const template = getTemplate(id);
        if (id !== TEMPLATE_CATEGORIES.CUSTOM) {
          expect(template?.tips.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('getAllTemplates', () => {
    it('should return array of templates', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return all template types', () => {
      const templates = getAllTemplates();
      const ids = templates.map(t => t.id);
      expect(ids).toContain(TEMPLATE_CATEGORIES.CRYPTO_PRICE);
      expect(ids).toContain(TEMPLATE_CATEGORIES.CUSTOM);
    });

    it('should have consistent template IDs', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(Object.values(TEMPLATE_CATEGORIES)).toContain(template.id);
      });
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should filter templates by category', () => {
      const cryptoTemplates = getTemplatesByCategory('crypto');
      expect(cryptoTemplates.length).toBeGreaterThan(0);
      cryptoTemplates.forEach(t => {
        expect(t.category).toBe('crypto');
      });
    });

    it('should return empty array for non-existent category', () => {
      const templates = getTemplatesByCategory('nonexistent');
      expect(templates.length).toBe(0);
    });

    it('should work for all categories', () => {
      const categories = ['crypto', 'sports', 'politics', 'economics', 'technology', 'entertainment', 'other'];
      categories.forEach(cat => {
        const templates = getTemplatesByCategory(cat);
        expect(Array.isArray(templates)).toBe(true);
      });
    });
  });

  describe('Template structure validation', () => {
    it('all templates should have valid step structure', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.steps.length).toBeGreaterThanOrEqual(3);
        template.steps.forEach(step => {
          expect(step.id).toBeDefined();
          expect(step.label).toBeDefined();
          expect(step.description).toBeDefined();
          expect(typeof step.required).toBe('boolean');
        });
      });
    });

    it('all templates should have valid durations', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.commonDurations.length).toBeGreaterThan(0);
        template.commonDurations.forEach(duration => {
          expect(typeof duration.blocks).toBe('number');
          expect(duration.blocks).toBeGreaterThan(0);
        });
      });
    });

    it('all templates should have guides', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.questionGuide.length).toBeGreaterThan(0);
        expect(template.categoryGuide.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Example validation', () => {
    it('examples should have required fields', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        template.examples.forEach(example => {
          expect(example.question).toBeDefined();
          expect(example.category).toBeDefined();
          expect(example.duration).toBeDefined();
          expect(typeof example.duration).toBe('number');
        });
      });
    });

    it('example questions should be valid', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        template.examples.forEach(example => {
          expect(example.question.length).toBeGreaterThan(10);
          expect(example.question.includes('?')).toBe(true);
        });
      });
    });
  });
});
