import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/WalletProvider';
import { TransactionProvider } from './components/TransactionProvider';
import { NetworkProvider } from './contexts/NetworkContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WatchlistProvider } from './contexts/WatchlistContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageErrorBoundary } from './components/PageErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TestnetWarningBanner } from './components/TestnetWarningBanner';
import { LoadingState } from './components/Loading';
import { GDPRInitializer } from './utils/gdprInitializer';

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const MarketsPage = lazy(() => import('./pages/MarketsPage').then(m => ({ default: m.MarketsPage })));
const TradePage = lazy(() => import('./pages/TradePage').then(m => ({ default: m.TradePage })));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage').then(m => ({ default: m.PortfolioPage })));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then(m => ({ default: m.WatchlistPage })));
const RecentlyViewedPage = lazy(() => import('./pages/RecentlyViewedPage').then(m => ({ default: m.RecentlyViewedPage })));
const TokenPage = lazy(() => import('./pages/TokenPage').then(m => ({ default: m.TokenPage })));
const StakingPage = lazy(() => import('./pages/StakingPage').then(m => ({ default: m.StakingPage })));
// Temporarily disabled - requires undeployed governance-core contract
// const GovernancePage = lazy(() => import('./pages/GovernancePage').then(m => ({ default: m.GovernancePage })));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistoryPage').then(m => ({ default: m.TransactionHistoryPage })));
const CreateMarketPage = lazy(() => import('./pages/CreateMarketPage').then(m => ({ default: m.CreateMarketPage })));
// Temporarily disabled - requires undeployed oracle-integration contract
// const OraclePage = lazy(() => import('./pages/OraclePage').then(m => ({ default: m.OraclePage })));
// Temporarily disabled - requires undeployed liquidity-pool contract
// const LiquidityPage = lazy(() => import('./pages/LiquidityPage').then(m => ({ default: m.LiquidityPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then(m => ({ default: m.LeaderboardPage })));
// Temporarily disabled - requires undeployed market-multi contract
// const MultiMarketsPage = lazy(() => import('./pages/MultiMarketsPage').then(m => ({ default: m.MultiMarketsPage })));
// const MultiTradePage = lazy(() => import('./pages/MultiTradePage').then(m => ({ default: m.MultiTradePage })));
// const CreateMultiMarketPage = lazy(() => import('./pages/CreateMultiMarketPage').then(m => ({ default: m.CreateMultiMarketPage })));

function App() {
  useEffect(() => {
    GDPRInitializer.initialize().catch(error => {
      console.error('GDPR initialization failed:', error);
    });

    return () => {
      GDPRInitializer.shutdown();
    };
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NetworkProvider>
          <WalletProvider>
            <WatchlistProvider>
              <RecentlyViewedProvider>
                <TransactionProvider>
                  <BrowserRouter>
                  <div className="min-h-screen flex flex-col bg-white dark:bg-black pb-16 md:pb-0">
                  <TestnetWarningBanner />
                  <Header />
                <main className="flex-1">
                  <Suspense fallback={<LoadingState />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/markets" element={
                        <PageErrorBoundary pageName="Markets">
                          <MarketsPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/trade/:id" element={
                        <PageErrorBoundary pageName="Trade">
                          <TradePage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/portfolio" element={
                        <PageErrorBoundary pageName="Portfolio">
                          <PortfolioPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/watchlist" element={
                        <PageErrorBoundary pageName="Watchlist">
                          <WatchlistPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/recently-viewed" element={
                        <PageErrorBoundary pageName="Recently Viewed">
                          <RecentlyViewedPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/token" element={
                        <PageErrorBoundary pageName="Token">
                          <TokenPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/staking" element={
                        <PageErrorBoundary pageName="Staking">
                          <StakingPage />
                        </PageErrorBoundary>
                      } />
                      {/* Temporarily disabled - requires undeployed governance-core contract */}
                      {/* <Route path="/governance" element={
                        <PageErrorBoundary pageName="Governance">
                          <GovernancePage />
                        </PageErrorBoundary>
                      } /> */}
                      <Route path="/transactions" element={
                        <PageErrorBoundary pageName="Transactions">
                          <TransactionHistoryPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/create-market" element={
                        <PageErrorBoundary pageName="Create Market">
                          <CreateMarketPage />
                        </PageErrorBoundary>
                      } />
                      {/* Temporarily disabled - requires undeployed oracle-integration contract */}
                      {/* <Route path="/oracle" element={
                        <PageErrorBoundary pageName="Oracle">
                          <OraclePage />
                        </PageErrorBoundary>
                      } /> */}
                      {/* Temporarily disabled - requires undeployed liquidity-pool contract */}
                      {/* <Route path="/liquidity" element={
                        <PageErrorBoundary pageName="Liquidity">
                          <LiquidityPage />
                        </PageErrorBoundary>
                      } /> */}
                      <Route path="/analytics" element={
                        <PageErrorBoundary pageName="Analytics">
                          <AnalyticsPage />
                        </PageErrorBoundary>
                      } />
                      <Route path="/leaderboard" element={
                        <PageErrorBoundary pageName="Leaderboard">
                          <LeaderboardPage />
                        </PageErrorBoundary>
                      } />
                      {/* Temporarily disabled - requires undeployed market-multi contract */}
                      {/* <Route path="/multi-markets" element={
                        <PageErrorBoundary pageName="Multi Markets">
                          <MultiMarketsPage />
                        </PageErrorBoundary>
                      } /> */}
                      {/* <Route path="/multi-trade/:id" element={
                        <PageErrorBoundary pageName="Multi Trade">
                          <MultiTradePage />
                        </PageErrorBoundary>
                      } /> */}
                      {/* <Route path="/create-multi-market" element={
                        <PageErrorBoundary pageName="Create Multi Market">
                          <CreateMultiMarketPage />
                        </PageErrorBoundary>
                      } /> */}
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <MobileBottomNav />
              </div>
                  </BrowserRouter>
                </TransactionProvider>
              </RecentlyViewedProvider>
            </WatchlistProvider>
          </WalletProvider>
      </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
