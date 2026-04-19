import { describe, it, expect } from 'vitest';
import { recommendTemplate, getTemplateComparisons, getTemplateHelpText } from '../frontend/src/utils/templateHelper';

describe('Template Helper Utilities', () => {
  describe('recommendTemplate', () => {
    it('should recommend crypto template for crypto questions', () => {
      const recommendations = recommendTemplate('Will Bitcoin reach $50,000?');
      expect(recommendations[0].templateId).toBe('crypto_price');
      expect(recommendations[0].score).toBeGreaterThan(0);
    });

    it('should recommend sports template for sports questions', () => {
      const recommendations = recommendTemplate('Will the Lakers win the championship?');
      expect(recommendations[0].templateId).toBe('sports_outcome');
    });

    it('should recommend political template for political questions', () => {
      const recommendations = recommendTemplate('Will the bill pass in Congress?');
      expect(recommendations[0].templateId).toBe('political_event');
    });

    it('should recommend economic template for economic questions', () => {
      const recommendations = recommendTemplate('Will GDP growth exceed 3%?');
      expect(recommendations[0].templateId).toBe('economic_indicator');
    });

    it('should recommend tech template for tech questions', () => {
      const recommendations = recommendTemplate('Will Apple release Vision Pro 2?');
      expect(recommendations[0].templateId).toBe('tech_release');
    });

    it('should recommend entertainment template for entertainment questions', () => {
      const recommendations = recommendTemplate('Will Oppenheimer win Best Picture?');
      expect(recommendations[0].templateId).toBe('entertainment_event');
    });

    it('should return multiple recommendations', () => {
      const recommendations = recommendTemplate('Will Bitcoin price reach $50,000?');
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should have scores for all recommendations', () => {
      const recommendations = recommendTemplate('Will the stock market go up?');
      recommendations.forEach(rec => {
        expect(typeof rec.score).toBe('number');
        expect(rec.score).toBeGreaterThanOrEqual(0);
      });
    });

    it('should provide reasoning for recommendations', () => {
      const recommendations = recommendTemplate('Will Bitcoin reach $50,000?');
      recommendations.forEach(rec => {
        expect(Array.isArray(rec.reasoning)).toBe(true);
        expect(rec.reasoning.length).toBeGreaterThan(0);
      });
    });

    it('should recommend custom for unmatched questions', () => {
      const recommendations = recommendTemplate('Will something random happen?');
      const hasCustom = recommendations.some(r => r.templateId === 'custom');
      expect(hasCustom).toBe(true);
    });

    it('should handle case insensitive matching', () => {
      const lower = recommendTemplate('will bitcoin reach $50,000?');
      const upper = recommendTemplate('Will BITCOIN reach $50,000?');
      expect(lower[0].templateId).toBe(upper[0].templateId);
    });
  });

  describe('getTemplateComparisons', () => {
    it('should return array of comparisons', () => {
      const comparisons = getTemplateComparisons();
      expect(Array.isArray(comparisons)).toBe(true);
      expect(comparisons.length).toBeGreaterThan(0);
    });

    it('should have all required fields', () => {
      const comparisons = getTemplateComparisons();
      comparisons.forEach(comp => {
        expect(comp.templateId).toBeDefined();
        expect(comp.name).toBeDefined();
        expect(comp.description).toBeDefined();
        expect(comp.bestFor).toBeDefined();
        expect(comp.exampleCount).toBeDefined();
        expect(comp.estimatedTime).toBeDefined();
        expect(comp.difficulty).toBeDefined();
      });
    });

    it('should have valid difficulty levels', () => {
      const comparisons = getTemplateComparisons();
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      comparisons.forEach(comp => {
        expect(validDifficulties).toContain(comp.difficulty);
      });
    });

    it('should have best for suggestions', () => {
      const comparisons = getTemplateComparisons();
      comparisons.forEach(comp => {
        if (comp.templateId !== 'custom') {
          expect(comp.bestFor.length).toBeGreaterThan(0);
        }
      });
    });

    it('should return 7 templates', () => {
      const comparisons = getTemplateComparisons();
      expect(comparisons.length).toBe(7);
    });
  });

  describe('getTemplateHelpText', () => {
    it('should return help text for valid template', () => {
      const help = getTemplateHelpText('crypto_price');
      expect(help.title).toBeDefined();
      expect(help.description).toBeDefined();
      expect(help.tips).toBeDefined();
      expect(Array.isArray(help.tips)).toBe(true);
    });

    it('should have tips for each template', () => {
      const templates = ['crypto_price', 'sports_outcome', 'political_event', 'economic_indicator', 'tech_release', 'entertainment_event', 'custom'];
      templates.forEach(templateId => {
        const help = getTemplateHelpText(templateId as any);
        expect(help.tips.length).toBeGreaterThan(0);
      });
    });

    it('should return default for unknown template', () => {
      const help = getTemplateHelpText('unknown' as any);
      expect(help.title).toBeDefined();
      expect(help.description).toBeDefined();
    });

    it('should have meaningful tips', () => {
      const help = getTemplateHelpText('crypto_price');
      help.tips.forEach(tip => {
        expect(typeof tip).toBe('string');
        expect(tip.length).toBeGreaterThan(0);
      });
    });
  });
});
