import { useState } from 'react';
import './App.css';
import { APP_NAME } from './constants/contract';
import { Header } from './components/Header';
import { CreateMarketForm } from './components/CreateMarketForm';
import { MarketList } from './components/MarketList';
import { StakeModal } from './components/StakeModal';
import { useMarkets } from './hooks/useMarkets';
import { Market } from './types/market';

function App() {
  const { markets, isLoading, error, refetch } = useMarkets();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <Header
        totalMarkets={markets.length}
        totalVolume={0}
        onRefresh={refetch}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Predict the Future
          </h2>
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
          <h3 className="text-2xl font-bold text-white mb-6">Markets</h3>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © 2026 {APP_NAME}. Built on Stacks.
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                Docs
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                GitHub
              </a>
              <a href="https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T?chain=mainnet" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-400 transition-colors text-sm">
                Contract
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
