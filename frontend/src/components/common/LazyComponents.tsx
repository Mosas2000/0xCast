import { lazy } from 'react';

// Pages
export const CreateMarketPage = lazy(() => import('../pages/CreateMarketPage'));
export const TradingPage = lazy(() => import('../pages/TradingPage'));
export const PortfolioPage = lazy(() => import('../pages/PortfolioPage'));
export const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

// Large Components
export const PriceChart = lazy(() => import('./trading/PriceChart'));
export const MarketActivityTimeline = lazy(() => import('./analytics/MarketActivityTimeline'));
export const LeaderboardSystem = lazy(() => import('./social/LeaderboardSystem'));
export const NotificationSystem = lazy(() => import('./notifications/NotificationSystem'));

/**
 * Helper to wrap lazy components with a standard suspense fallback.
 */
export { Suspense } from 'react';
