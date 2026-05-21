import { PortfolioPosition, RebalancingRecommendation } from '@/types/portfolio';

export class PortfolioHelpers {
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  }

  static calculateWeights(positions: PortfolioPosition[], totalValue: number): Record<string, number> {
    const weights: Record<string, number> = {};

    positions.forEach((position) => {
      weights[position.marketId] = (position.currentValue / totalValue) * 100;
    });

    return weights;
  }

  static calculateAllocationPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  static getPositionRating(pnlPercentage: number): 'excellent' | 'good' | 'neutral' | 'poor' | 'critical' {
    if (pnlPercentage >= 20) return 'excellent';
    if (pnlPercentage >= 5) return 'good';
    if (pnlPercentage >= -5) return 'neutral';
    if (pnlPercentage >= -15) return 'poor';
    return 'critical';
  }

  static getRiskLevel(volatility: number): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' {
    if (volatility < 0.1) return 'very_low';
    if (volatility < 0.2) return 'low';
    if (volatility < 0.3) return 'moderate';
    if (volatility < 0.5) return 'high';
    return 'very_high';
  }

  static getSharpeRatingLabel(ratio: number): string {
    if (ratio > 2) return 'Excellent';
    if (ratio > 1) return 'Good';
    if (ratio > 0) return 'Positive';
    return 'Negative';
  }

  static getRebalancingPriority(deviation: number): 'immediate' | 'high' | 'medium' | 'low' {
    if (deviation > 30) return 'immediate';
    if (deviation > 20) return 'high';
    if (deviation > 10) return 'medium';
    return 'low';
  }

  static estimateBuyingPower(totalValue: number, cash: number, maxLeverageRatio: number = 2): number {
    return Math.min(cash, totalValue * (maxLeverageRatio - 1));
  }

  static calculatePositionSize(
    totalValue: number,
    weightPercentage: number,
    currentPrice: number
  ): number {
    const targetValue = totalValue * (weightPercentage / 100);
    return targetValue / currentPrice;
  }

  static calculateStopLossPrice(entryPrice: number, stopLossPercentage: number): number {
    return entryPrice * (1 - stopLossPercentage / 100);
  }

  static calculateTakeProfitPrice(entryPrice: number, takeProfitPercentage: number): number {
    return entryPrice * (1 + takeProfitPercentage / 100);
  }

  static calculatePositionValue(quantity: number, price: number): number {
    return quantity * price;
  }

  static calculateAverageEntryPrice(positions: PortfolioPosition[]): number {
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalQuantity = positions.reduce((sum, p) => sum + p.quantity, 0);

    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  }

  static calculatePortfolioHoldingPeriod(createdAt: Date, currentDate: Date = new Date()): number {
    return Math.floor((currentDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }

  static isHighConcentration(weights: Record<string, number>, threshold: number = 50): boolean {
    const topThreeWeight = Object.values(weights)
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((sum, w) => sum + w, 0);

    return topThreeWeight > threshold;
  }

  static findLargestPosition(positions: PortfolioPosition[]): PortfolioPosition | null {
    if (positions.length === 0) return null;
    return positions.reduce((largest, current) =>
      current.currentValue > largest.currentValue ? current : largest
    );
  }

  static findSmallestPosition(positions: PortfolioPosition[]): PortfolioPosition | null {
    if (positions.length === 0) return null;
    return positions.reduce((smallest, current) =>
      current.currentValue < smallest.currentValue ? current : smallest
    );
  }

  static findWorstPerformer(positions: PortfolioPosition[]): PortfolioPosition | null {
    if (positions.length === 0) return null;
    return positions.reduce((worst, current) =>
      current.pnlPercentage < worst.pnlPercentage ? current : worst
    );
  }

  static findBestPerformer(positions: PortfolioPosition[]): PortfolioPosition | null {
    if (positions.length === 0) return null;
    return positions.reduce((best, current) =>
      current.pnlPercentage > best.pnlPercentage ? current : best
    );
  }

  static sortPositionsByValue(positions: PortfolioPosition[]): PortfolioPosition[] {
    return [...positions].sort((a, b) => b.currentValue - a.currentValue);
  }

  static sortPositionsByReturn(positions: PortfolioPosition[]): PortfolioPosition[] {
    return [...positions].sort((a, b) => b.pnlPercentage - a.pnlPercentage);
  }

  static groupPositionsByMarket(positions: PortfolioPosition[]): Record<string, PortfolioPosition[]> {
    const grouped: Record<string, PortfolioPosition[]> = {};

    positions.forEach((position) => {
      if (!grouped[position.outcome]) {
        grouped[position.outcome] = [];
      }
      grouped[position.outcome].push(position);
    });

    return grouped;
  }

  static calculatePortfolioTurnover(oldPositions: PortfolioPosition[], newPositions: PortfolioPosition[], totalValue: number): number {
    const changes = newPositions
      .map((newPos) => {
        const oldPos = oldPositions.find((p) => p.marketId === newPos.marketId);
        const change = Math.abs((newPos.currentValue - (oldPos?.currentValue || 0)) / totalValue);
        return change;
      })
      .reduce((sum, change) => sum + change, 0);

    return changes / 2;
  }

  static calculateTransactionCost(amount: number, feePercentage: number = 0.1): number {
    return amount * (feePercentage / 100);
  }

  static calculateNetProceeds(amount: number, feePercentage: number = 0.1): number {
    return amount - this.calculateTransactionCost(amount, feePercentage);
  }

  static isPositionUnderwater(position: PortfolioPosition): boolean {
    return position.pnl < 0;
  }

  static isPositionOverweight(weight: number, targetWeight: number, threshold: number = 10): boolean {
    return weight > targetWeight + threshold;
  }

  static isPositionUnderweight(weight: number, targetWeight: number, threshold: number = 10): boolean {
    return weight < targetWeight - threshold;
  }

  static calculateExpectedPortfolioReturn(positions: PortfolioPosition[]): number {
    if (positions.length === 0) return 0;

    return positions.reduce((sum, p) => sum + p.pnlPercentage * (p.weight / 100), 0);
  }

  static validateRecommendationTiming(recommendation: RebalancingRecommendation): boolean {
    return new Date() < recommendation.expiresAt;
  }

  static calculateRecommendationImpact(
    recommendation: RebalancingRecommendation,
    position: PortfolioPosition
  ): number {
    if (recommendation.action === 'buy' || recommendation.action === 'increase') {
      return recommendation.expectedImpact;
    } else {
      return -recommendation.expectedImpact;
    }
  }
}
