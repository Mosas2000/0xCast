import { useState } from 'react';
import './App.css';
import { APP_NAME } from './constants/contract';
import { Header } from './components/Header';
import { CreateMarketForm } from './components/CreateMarketForm';
import { MarketList } from './components/MarketList';
import { StakeModal } from './components/StakeModal';
import { SettingsPanel } from './components/SettingsPanel';
import { Toaster } from './components/Toaster';
import { LiveMarketBadge } from './components/LiveMarketBadge';
import { RefreshButton } from './components/RefreshButton';
import { ContractInfo } from './components/ContractInfo';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PullToRefresh } from './components/PullToRefresh';
import { useMarkets } from './hooks/useMarkets';
import { useSettings } from './hooks/useSettings';
import type { Market } from './types/market';

function App() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const { settings } = useSettings();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStake = (marketId: number) => {
    const market = markets.find(m => m.id === marketId);
    if (market) {
      setSelectedMarket(market);
      setIsStakeModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsStakeModalOpen(false);
    setSelectedMarket(null);
    refetch(); // Refresh markets after staking
  };

  return (
    <>
      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />
      
      <PullToRefresh onRefresh={async () => {
        await refetch();
      }}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
          {/* Toast Notifications */}
          <Toaster />

          {/* Header */}
          <Header
            totalMarkets={markets.length}
            totalVolume={0}
            onRefresh={refetch}
          />

      {/* Settings Button (Fixed Position) */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all hover:scale-110 z-40"
        title="Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-5xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Predict the Future
            </h2>
            <LiveMarketBadge />
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Create and trade on binary outcome markets using STX. Decentralized, transparent, and trustless.
          </p>
        </section>

        {/* Section Divider */}
        <div className="border-t border-slate-700/30"></div>

        {/* Create Market Section */}
        <section>
          <h3 className="text-2xl font-bold text-white mb-6">Create Market</h3>
          <CreateMarketForm />
        </section>

        {/* Section Divider */}
        <div className="border-t border-slate-700/30"></div>

        {/* Markets Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Markets</h3>
            <RefreshButton onRefresh={refetch} isLoading={isLoading} />
          </div>
          <MarketList
            markets={markets}
            isLoading={isLoading}
            error={error}
            onRefresh={refetch}
            onStake={handleStake}
          />
        </section>

        {/* Stake Modal */}
        <StakeModal
          market={selectedMarket}
          isOpen={isStakeModalOpen}
          onClose={handleCloseModal}
        />

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </main>

      {/* New Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />
        </div>
      </PullToRefresh>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}

export default App;
