import { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';

/**
 * Landing page for 0xCast.
 *
 * Designed as a clean, confident intro that conveys trust and simplicity.
 * No gimmicks — just clear value props, a focused hero, and one CTA.
 */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ── Navigation ────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrollY > 40
            ? 'bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={36} variant="full" />
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          </div>
          <a
            href="/app"
            className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Launch App
          </a>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6">
        {/* Subtle radial glow behind hero */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(99,102,241,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 text-xs font-medium rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live on Stacks Mainnet
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
            Predict the future.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Earn from it.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
            0xCast lets you create and trade on prediction markets — secured by
            Bitcoin through the Stacks blockchain. No middlemen, no custody risk.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Start Trading
            </a>
            <a
              href="https://github.com/Mosas2000/0xCast"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl border border-slate-700 hover:border-slate-500 transition-colors text-slate-300 hover:text-white"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <section id="stats" className="border-y border-slate-800/60 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '42+', label: 'Smart Contracts' },
            { value: '$STX', label: 'Native Currency' },
            { value: 'BTC', label: 'Secured By' },
            { value: '100%', label: 'On-Chain' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for serious traders
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg mx-auto">
              Every detail is designed to give you an edge — from on-chain
              transparency to real-time market data.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Bitcoin-Secured',
                desc: 'All markets settle on Stacks, which inherits the full security of the Bitcoin network.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Markets',
                desc: 'Create a market on any real-world event in seconds. Set your terms, fund it, and go live.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                ),
                title: 'Transparent Odds',
                desc: 'On-chain pools mean real-time, transparent odds. No hidden fees, no market manipulation.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Community Governed',
                desc: 'Token holders shape the protocol through on-chain governance proposals and voting.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Earn Rewards',
                desc: 'Liquidity providers and accurate predictors earn staking rewards and protocol fees.',
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Mobile-First PWA',
                desc: 'Installable as a native app. Trade from anywhere with offline support and push alerts.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/30 hover:bg-slate-900/80 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how" className="py-24 md:py-32 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">
            Three steps. Real money.
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Link your Stacks wallet (Leather or Xverse) in one click.' },
              { step: '02', title: 'Pick a Market', desc: 'Browse live markets or create your own on any event.' },
              { step: '03', title: 'Stake & Earn', desc: 'Commit STX to your prediction. Win? Claim your share of the pool.' },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-2 border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-lg mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to put your{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              knowledge to work?
            </span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-md mx-auto">
            Join a growing community of traders who profit from what they know
            — fully on-chain, fully transparent.
          </p>
          <a
            href="/app"
            className="mt-8 inline-block px-10 py-4 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Launch App
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/60 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size={28} variant="full" />
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="https://github.com/Mosas2000/0xCast" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              GitHub
            </a>
            <a href="https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T?chain=mainnet" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Explorer
            </a>
          </div>
          <span className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} 0xCast. Built on Stacks.
          </span>
        </div>
      </footer>
    </div>
  );
}
