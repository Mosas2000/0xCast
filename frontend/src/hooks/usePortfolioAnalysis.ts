import { useState, useCallback, useEffect } from 'react';
import { Portfolio, PortfolioMetrics, PortfolioRecommendation, RecommendationResponse } from '../types/portfolio';
import { PortfolioAnalysisService } from '../services/PortfolioAnalysisService';
import { RecommendationEngineService } from '../services/RecommendationEngineService';
import { PerformanceComparisonService } from '../services/PerformanceComparisonService';

export function usePortfolioAnalysis(userId: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyzePortfolio = useCallback(async (portfolioData: Portfolio) => {
    setLoading(true);
    setError(null);

    try {
      setPortfolio(portfolioData);
      const analyzedMetrics = PortfolioAnalysisService.analyzePortfolio(portfolioData);
      setMetrics(analyzedMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Portfolio analysis failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMetrics = useCallback((portfolioData: Portfolio) => {
    const updated = PortfolioAnalysisService.analyzePortfolio(portfolioData);
    setMetrics(updated);
  }, []);

  const calculateRiskMetrics = useCallback((portfolioData: Portfolio) => {
    return PortfolioAnalysisService.calculateRiskMetrics(portfolioData);
  }, []);

  const calculateDiversification = useCallback((portfolioData: Portfolio) => {
    return PortfolioAnalysisService.analyzeDiversification(portfolioData);
  }, []);

  const calculateHistoricalPerformance = useCallback((portfolioData: Portfolio, period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y') => {
    return PortfolioAnalysisService.generateHistoricalPerformance(portfolioData, period);
  }, []);

  return {
    portfolio,
    metrics,
    loading,
    error,
    analyzePortfolio,
    updateMetrics,
    calculateRiskMetrics,
    calculateDiversification,
    calculateHistoricalPerformance,
  };
}

export function usePortfolioRecommendations(userId: string) {
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateRecommendations = useCallback(async (portfolio: Portfolio) => {
    setLoading(true);
    setError(null);

    try {
      const recs = RecommendationEngineService.generateRecommendations(portfolio);
      setRecommendations(recs);
      return recs;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Recommendation generation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptRecommendation = useCallback((recommendationId: string) => {
    setRecommendations((prev) =>
      prev.filter((rec) => rec.id !== recommendationId)
    );
  }, []);

  const rejectRecommendation = useCallback((recommendationId: string) => {
    setRecommendations((prev) =>
      prev.filter((rec) => rec.id !== recommendationId)
    );
  }, []);

  const snoozeRecommendation = useCallback((recommendationId: string, hours: number) => {
    setRecommendations((prev) =>
      prev.map((rec) => ({
        ...rec,
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      }))
    );
  }, []);

  const refreshRecommendations = useCallback((portfolio: Portfolio) => {
    const recs = RecommendationEngineService.generateRecommendations(portfolio);
    setRecommendations(recs);
  }, []);

  return {
    recommendations,
    loading,
    error,
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    snoozeRecommendation,
    refreshRecommendations,
  };
}

export function usePortfolioOptimization(userId: string) {
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimizePortfolio = useCallback(async (portfolio: Portfolio) => {
    setLoading(true);
    setError(null);

    try {
      const result = RecommendationEngineService.optimizePortfolio(portfolio);
      setOptimizationResult(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Portfolio optimization failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const applyOptimization = useCallback((portfolio: Portfolio) => {
    const result = RecommendationEngineService.optimizePortfolio(portfolio);
    setOptimizationResult(result);
    return result;
  }, []);

  return {
    optimizationResult,
    loading,
    error,
    optimizePortfolio,
    applyOptimization,
  };
}

export function usePerformanceComparison(userId: string) {
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const compareWithBenchmark = useCallback(async (portfolioReturn: number, benchmark: string = 'Market Index') => {
    setLoading(true);
    setError(null);

    try {
      const result = PerformanceComparisonService.compareWithBenchmark(portfolioReturn, benchmark);
      setComparison(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Comparison failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerformanceMetrics = useCallback((dailyReturns: number[], benchmarkReturns: number[]) => {
    return PerformanceComparisonService.generatePerformanceMetrics(dailyReturns, benchmarkReturns);
  }, []);

  return {
    comparison,
    loading,
    error,
    compareWithBenchmark,
    getPerformanceMetrics,
  };
}

export function usePortfolioRecommendationResponse(userId: string) {
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateFullResponse = useCallback(async (portfolio: Portfolio) => {
    setLoading(true);
    setError(null);

    try {
      const metrics = PortfolioAnalysisService.analyzePortfolio(portfolio);
      const diversification = PortfolioAnalysisService.analyzeDiversification(portfolio);
      const recommendations = RecommendationEngineService.generateRecommendations(portfolio);
      const comparison = PerformanceComparisonService.compareWithBenchmark(
        metrics.totalReturn / metrics.totalValue * 100,
        'Market Index'
      );
      const historical = PortfolioAnalysisService.generateHistoricalPerformance(portfolio, '1y');

      const fullResponse: RecommendationResponse = {
        portfolioMetrics: metrics,
        diversificationAnalysis: diversification,
        recommendations,
        performanceComparison: comparison,
        historicalPerformance: historical,
      };

      setResponse(fullResponse);
      return fullResponse;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Response generation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback((portfolio: Portfolio) => {
    return generateFullResponse(portfolio);
  }, [generateFullResponse]);

  return {
    response,
    loading,
    error,
    generateFullResponse,
    refresh,
  };
}
