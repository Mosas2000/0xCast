import { Link } from 'react-router-dom';
import { useWallet } from '../components/WalletProvider';
import { useMarkets } from '../hooks/useMarkets';
import { MarketCard } from '../components/MarketCard';
import { MarketStatus } from '../types/market';
import { formatStx } from '../utils/helpers';

export function LandingPage() {
  const { connect, isConnected } = useWallet();
  const { markets, isLoading } = useMarkets();

  const featuredMarkets = markets
    .filter((m) => m.status === MarketStatus.ACTIVE)
    .sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake))
    .slice(0, 3);

  const totalVolume = markets.reduce((sum, m) => sum + m.totalYesStake + m.totalNoStake, 0);
  const activeMarkets = markets.filter((m) => m.status === MarketStatus.ACTIVE).length;

  const howItWorks = [
  ];    { step: '03', title: 'Place Stake', desc: 'Stake STX on Yes or No and earn if correct', icon: '    { step: '02', title: 'Choose Market', desc: 'Browse markets and pick your prediction', icon: '    { step: '01', title: 'Connect Wallet', desc: 'Link your Stacks wallet to start trading', icon: '

  const securityFeatures = [
    { title: 'Non-Custodial', desc: 'You always control your funds' },
    { title: 'Transparent', desc: 'All trades on-chain and verifiable' },
    { title: 'Decentralized', desc: 'No central authority or single point of failure' }
  ];

  return (
    <div className="pt-[72px]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-black to-neutral-950 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/15 border border-blue-500/30 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Live on Stacks Mainnet
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Predict the Future,<br />
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Own Your Wins
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            The decentralized prediction market built on Bitcoin. Trade outcomes, earn rewards, and control your future.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 max-w-sm mx-auto mb-12 sm:mb-16">
            {isConnected ? (
              <Link 
                to="/markets" 
                className="block py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-center transition-colors"
              >
                Explore Markets
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => connect()}
                className="py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-semibold cursor-pointer text-base transition-colors"
              >
                Get Started
              </button>
            )}
            <a
              href="https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T?chain=mainnet"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-4 px-8 bg-transparent text-white border border-neutral-700 hover:border-neutral-600 rounded-xl font-semibold text-center transition-colors"
            >
              View Contract
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto">
            <div className="py-6 sm:py-8 px-6 bg-neutral-900 rounded-2xl border border-neutral-800">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {markets.length}
              </p>
              <p className="text-sm text-neutral-500">Markets</p>
            </div>
            <div className="py-6 sm:py-8 px-6 bg-neutral-900 rounded-2xl border border-neutral-800">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {formatStx(totalVolume, 0)}
              </p>
              <p className="text-sm text-neutral-500">Volume</p>
            </div>
            <div className="py-6 sm:py-8 px-6 bg-neutral-900 rounded-2xl border border-neutral-800">
              <p className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {activeMarkets}
              </p>
              <p className="text-sm text-neutral-500">Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-950 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-neutral-500">
              Start trading in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {howItWorks.map((item) => (
              <div 
                key={item.step}
                className="p-8 sm:p-10 bg-neutral-900 rounded-2xl border border-neutral-800 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl sm:text-3xl">
                  {item.icon}
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold mb-4">
                  {item.step}
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Market CTA */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-4xl sm:text-5xl mb-</div>5">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Create Your Own Market
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
            Have a prediction you want to trade on? Launch your own market in minutes and let the community participate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-market"
              className="py-4 px-8 bg-white hover:bg-neutral-100 text-blue-900 rounded-xl font-semibold transition-colors"
            >
              Create Market
            </Link>
            <Link
              to="/markets"
              className="py-4 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-colors"
            >
              Browse Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section className="bg-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Featured Markets
              </h2>
              <p className="text-base text-neutral-500">Top markets by volume</p>
            </div>
            <Link 
              to="/markets"
              className="py-3 px-6 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 rounded-xl font-medium transition-colors"
            >
              View All Markets
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 sm:p-10 bg-neutral-900 rounded-2xl border border-neutral-800 h-64 sm:h-72 animate-pulse">
                  <div className="h-5 w-20 bg-neutral-800 rounded mb-6" />
                  <div className="h-6 w-full bg-neutral-800 rounded mb-3" />
                  <div className="h-6 w-3/4 bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          ) : featuredMarkets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          ) : (
            <div className="py-16 sm:py-20 px-8 sm:px-10 bg-neutral-900 rounded-2xl border border-neutral-800 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full bg-neutral-800 flex items-center justify-center text-3xl sm:text-4xl">
              </div>                
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                No Active Markets
              </h3>
              <p className="text-base text-neutral-500 mb-8">
                Markets will appear here once they are created
              </p>
              <Link 
                to="/markets"
                className="inline-block py-3 sm:py-4 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Browse All Markets
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-neutral-950 py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-orange-500/15 border border-orange-500/30 mb-6 sm:mb-8">
            <span className="text-</span>base">
            <span className="text-sm font-semibold text-orange-300">
              Bitcoin Secured
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Built on Stacks, Secured by Bitcoin
          </h2>
          <p className="text-base sm:text-lg text-neutral-400 mb-10 sm:mb-12 leading-relaxed">
            Your funds are protected by the most decentralized blockchain in the world.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {securityFeatures.map((item) => (
              <div key={item.title} className="py-8 px-6 bg-neutral-900 rounded-2xl border border-neutral-800">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start?
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 mb-8 sm:mb-10">
            Join the future of decentralized prediction markets
          </p>
          
          {isConnected ? (
            <Link 
              to="/markets"
              className="inline-block py-4 sm:py-5 px-10 sm:px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg sm:text-xl transition-colors"
            >
              Start Trading
            </Link>
          ) : (
            <button 
              type="button"
              onClick={() => connect()}
              className="py-4 sm:py-5 px-10 sm:px-12 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl font-semibold cursor-pointer text-lg sm:text-xl transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
