import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/WalletProvider';
import { NetworkProvider } from './contexts/NetworkContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TestnetWarningBanner } from './components/TestnetWarningBanner';
import { LoadingState } from './components/Loading';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const MarketsPage = lazy(() => import('./pages/MarketsPage').then(m => ({ default: m.MarketsPage })));
const TradePage = lazy(() => import('./pages/TradePage').then(m => ({ default: m.TradePage })));
const CreateMarketPage = lazy(() => import('./pages/CreateMarketPage').then(m => ({ default: m.CreateMarketPage })));

/**
 * 0xCast MVP Application
 * 
 * A simplified prediction market platform powered by Stacks blockchain.
 * Features:
 * - Browse markets
 * - Create binary (YES/NO) markets
 * - Place predictions with STX
 * - Claim winnings after resolution
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NetworkProvider>
          <WalletProvider>
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-white dark:bg-black">
                {/* Warning banner for testnet */}
                <TestnetWarningBanner />
                
                {/* Main navigation */}
                <Header />
                
                {/* Page content */}
                <main className="flex-1">
                  <Suspense fallback={<LoadingState />}>
                    <Routes>
                      {/* Landing page */}
                      <Route path="/" element={<LandingPage />} />
                      
                      {/* Markets list */}
                      <Route path="/markets" element={<MarketsPage />} />
                      
                      {/* Single market trading */}
                      <Route path="/market/:id" element={<TradePage />} />
                      
                      {/* Create new market */}
                      <Route path="/create" element={<CreateMarketPage />} />
                      
                      {/* 404 - redirect to home */}
                      <Route path="*" element={<LandingPage />} />
                    </Routes>
                  </Suspense>
                </main>
                
                {/* Footer */}
                <Footer />
              </div>
            </BrowserRouter>
          </WalletProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
