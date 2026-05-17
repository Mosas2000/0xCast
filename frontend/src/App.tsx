import { useEffect } from 'react';
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
import { LandingPage } from './pages/LandingPage';
import { MarketsPage } from './pages/MarketsPage';
import { TradePage } from './pages/TradePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TokenPage } from './pages/TokenPage';
import { StakingPage } from './pages/StakingPage';
import { GovernancePage } from './pages/GovernancePage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { CreateMarketPage } from './pages/CreateMarketPage';
import { OraclePage } from './pages/OraclePage';
import { LiquidityPage } from './pages/LiquidityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { MultiMarketsPage } from './pages/MultiMarketsPage';
import { MultiTradePage } from './pages/MultiTradePage';
import { CreateMultiMarketPage } from './pages/CreateMultiMarketPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { RecentlyViewedPage } from './pages/RecentlyViewedPage';
import { GDPRInitializer } from './utils/gdprInitializer';

function App() {
  useEffect(() => {
    GDPRInitializer.initialize();
    
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
                    <Route path="/governance" element={
                      <PageErrorBoundary pageName="Governance">
                        <GovernancePage />
                      </PageErrorBoundary>
                    } />
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
                    <Route path="/oracle" element={
                      <PageErrorBoundary pageName="Oracle">
                        <OraclePage />
                      </PageErrorBoundary>
                    } />
                    <Route path="/liquidity" element={
                      <PageErrorBoundary pageName="Liquidity">
                        <LiquidityPage />
                      </PageErrorBoundary>
                    } />
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
                    <Route path="/multi-markets" element={
                      <PageErrorBoundary pageName="Multi Markets">
                        <MultiMarketsPage />
                      </PageErrorBoundary>
                    } />
                    <Route path="/multi-trade/:id" element={
                      <PageErrorBoundary pageName="Multi Trade">
                        <MultiTradePage />
                      </PageErrorBoundary>
                    } />
                    <Route path="/create-multi-market" element={
                      <PageErrorBoundary pageName="Create Multi Market">
                        <CreateMultiMarketPage />
                      </PageErrorBoundary>
                    } />
                  </Routes>
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
