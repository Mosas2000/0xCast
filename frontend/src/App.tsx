import { useState } from 'react';
import './App.css';
import { APP_NAME, APP_DESCRIPTION } from './constants/contract';

function App() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">0x</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
                <p className="text-xs text-slate-400">{APP_DESCRIPTION}</p>
              </div>
            </div>

            <button
              onClick={() => setConnected(!connected)}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
            >
              {connected ? 'Connected' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Predict the Future
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Create and trade on binary outcome markets using STX. Decentralized, transparent, and trustless.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-200">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-slate-400">Active Markets</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-200">
            <div className="text-3xl font-bold text-white mb-2">0 STX</div>
            <div className="text-slate-400">Total Volume</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-200">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <div className="text-slate-400">Total Users</div>
          </div>
        </div>

        {/* Markets Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Active Markets</h3>
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg">No active markets yet</p>
              <p className="text-sm mt-2">Connect your wallet to create the first market</p>
            </div>
          </div>
        </div>
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
