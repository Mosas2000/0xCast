import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@/components/WalletProvider';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from '@/components/MarketCard';
import { MarketStatus } from '@/types/market';
import { formatStx } from '@/utils/helpers';
import { useNetwork } from '@/contexts/NetworkContext';
import { getExplorerAddressUrl } from '@/utils/transactions';
import { useRecentlyViewed } from '@/contexts/RecentlyViewedContext';
import type { Market } from '@/types/market';

export function LandingPage() {
  const { connect, isConnected } = useWallet();
  const { markets, isLoading } = useMarkets();
  const { network, contractAddress } = useNetwork();
  const { entries: recentlyViewedEntries } = useRecentlyViewed();

  const featuredMarkets = markets
    .filter((m) => m.status === MarketStatus.ACTIVE)
    .sort((a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake))
    .slice(0, 3);

  const totalVolume = markets.reduce((sum, m) => sum + m.totalYesStake + m.totalNoStake, 0);
  const activeMarkets = markets.filter((m) => m.status === MarketStatus.ACTIVE).length;
  const recentlyViewedMarkets = useMemo(() => {
    const marketById = new Map(markets.map((market) => [market.id, market]));
    return recentlyViewedEntries
      .map((entry) => ({
        market: marketById.get(entry.marketId),
        viewedAt: entry.viewedAt,
      }))
      .filter((entry): entry is { market: Market; viewedAt: number } => entry.market !== undefined)
      .slice(0, 3);
  }, [markets, recentlyViewedEntries]);

  const howItWorks = [
    { step: '01', title: 'Connect Wallet', desc: 'Link your Stacks wallet to start trading', icon: '\u{1F517}' },
    { step: '02', title: 'Choose Market', desc: 'Browse markets and pick your prediction', icon: '\u{1F4CA}' },
    { step: '03', title: 'Place Stake', desc: 'Stake STX on Yes or No and earn if correct', icon: '\u{1F4B0}' }
  ];

  const securityFeatures = [
    { title: 'Non-Custodial', desc: 'You always control your funds' },
    { title: 'Transparent', desc: 'All trades on-chain and verifiable' },
    { title: 'Decentralized', desc: 'No central authority or single point of failure' }
  ];

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(to bottom, #000, #0a0a0a)',
        paddingTop: 80,
        paddingBottom: 80
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 9999,
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: 32
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#60a5fa'
            }} />
            <span style={{ fontSize: 14, color: '#93c5fd', fontWeight: 600 }}>
              Live on Stacks Mainnet
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 24
          }}>
            Predict the Future,<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Own Your Wins
            </span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 18,
            color: '#a3a3a3',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            The decentralized prediction market built on Bitcoin. Trade outcomes, earn rewards, and control your future.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            maxWidth: 400,
            margin: '0 auto 64px'
          }}>
            {isConnected ? (
              <Link 
                to="/markets" 
                style={{
                  display: 'block',
                  padding: '16px 32px',
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: 12,
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Explore Markets
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => connect()}
                style={{
                  padding: '16px 32px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Get Started
              </button>
            )}
              <a
                href={getExplorerAddressUrl(contractAddress, network)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                display: 'block',
                padding: '16px 32px',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #404040',
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              View Contract
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 24,
            maxWidth: 600,
            margin: '0 auto'
          }}>
            <div style={{
              padding: '32px 24px',
              background: '#111',
              borderRadius: 16,
              border: '1px solid #262626'
            }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {markets.length}
              </p>
              <p style={{ fontSize: 14, color: '#737373' }}>Markets</p>
            </div>
            <div style={{
              padding: '32px 24px',
              background: '#111',
              borderRadius: 16,
              border: '1px solid #262626'
            }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {formatStx(totalVolume, 0)}
              </p>
              <p style={{ fontSize: 14, color: '#737373' }}>Volume</p>
            </div>
            <div style={{
              padding: '32px 24px',
              background: '#111',
              borderRadius: 16,
              border: '1px solid #262626'
            }}>
              <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {activeMarkets}
              </p>
              <p style={{ fontSize: 14, color: '#737373' }}>Active</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        background: '#0a0a0a',
        paddingTop: 96,
        paddingBottom: 96
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
              How It Works
            </h2>
            <p style={{ fontSize: 18, color: '#737373' }}>
              Start trading in three simple steps
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32
          }}>
            {howItWorks.map((item) => (
              <div 
                key={item.step}
                style={{
                  padding: '40px 32px',
                  background: '#111',
                  borderRadius: 20,
                  border: '1px solid #262626',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 24px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28
                }}>
                  {item.icon}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 16
                }}>
                  {item.step}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 15, color: '#737373', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Market CTA */}
      <section style={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        paddingTop: 64,
        paddingBottom: 64
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            color: '#fff', 
            marginBottom: 16 
          }}>
            Create Your Own Market
          </h2>
          <p style={{ 
            fontSize: 18, 
            color: '#E0E7FF', 
            marginBottom: 32,
            maxWidth: '600px',
            margin: '0 auto 32px',
            lineHeight: '1.6',
          }}>
            Have a prediction you want to trade on? Launch your own market in minutes and let the community participate.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/create-market"
              style={{
                padding: '16px 32px',
                background: '#fff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Create Market
            </Link>
            <Link
              to="/markets"
              style={{
                padding: '16px 32px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Browse Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Markets */}
      <section style={{ 
        background: '#000',
        paddingTop: 96,
        paddingBottom: 96
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          padding: '0 24px'
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 24,
            marginBottom: 48
          }}>
            <div>
              <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                Featured Markets
              </h2>
              <p style={{ fontSize: 16, color: '#737373' }}>Top markets by volume</p>
            </div>
            <Link 
              to="/markets"
              style={{
                padding: '12px 24px',
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: 10,
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              View All Markets
            </Link>
          </div>

          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  padding: 40,
                  background: '#111',
                  borderRadius: 20,
                  border: '1px solid #262626',
                  height: 280
                }}>
                  <div style={{ height: 20, width: 80, background: '#222', borderRadius: 4, marginBottom: 24 }} />
                  <div style={{ height: 24, width: '100%', background: '#222', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ height: 24, width: '70%', background: '#222', borderRadius: 4 }} />
                </div>
              ))}
            </div>
          ) : featuredMarkets.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32
            }}>
              {featuredMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '80px 40px',
              background: '#111',
              borderRadius: 20,
              border: '1px solid #262626',
              textAlign: 'center'
            }}>
              <div style={{
                width: 80,
                height: 80,
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32
              }}>
                📊
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
                No Active Markets
              </h3>
              <p style={{ fontSize: 16, color: '#737373', marginBottom: 32 }}>
                Markets will appear here once they are created
              </p>
              <Link 
                to="/markets"
                style={{
                  display: 'inline-block',
                  padding: '14px 28px',
                  background: '#3b82f6',
                  color: '#fff',
                  borderRadius: 10,
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Browse All Markets
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewedMarkets.length > 0 && (
        <section style={{ 
          background: '#0a0a0a',
          paddingTop: 96,
          paddingBottom: 96
        }}>
          <div style={{ 
            maxWidth: 1200, 
            margin: '0 auto', 
            padding: '0 24px'
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'space-between', 
              alignItems: 'center',
              gap: 24,
              marginBottom: 48
            }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  Recently Viewed
                </h2>
                <p style={{ fontSize: 16, color: '#737373' }}>Jump back into the markets you opened most recently</p>
              </div>
              <Link 
                to="/recently-viewed"
                style={{
                  padding: '12px 24px',
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 10,
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                View Full History
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 32
            }}>
              {recentlyViewedMarkets.map(({ market, viewedAt }) => (
                <div key={`${market.id}-${viewedAt}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 12, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                    Viewed {new Date(viewedAt).toLocaleString()}
                  </div>
                  <MarketCard market={market} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Security Section */}
      <section style={{ 
        background: '#0a0a0a',
        paddingTop: 96,
        paddingBottom: 96
      }}>
        <div style={{ 
          maxWidth: 900, 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 9999,
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            marginBottom: 32
          }}>
            <span style={{ fontSize: 16 }}>₿</span>
            <span style={{ fontSize: 14, color: '#fdba74', fontWeight: 600 }}>
              Bitcoin Secured
            </span>
          </div>

          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Built on Stacks, Secured by Bitcoin
          </h2>
          <p style={{ fontSize: 18, color: '#a3a3a3', marginBottom: 48, lineHeight: 1.6 }}>
            Your funds are protected by the most decentralized blockchain in the world.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24
          }}>
            {securityFeatures.map((item) => (
              <div key={item.title} style={{
                padding: '32px 24px',
                background: '#111',
                borderRadius: 16,
                border: '1px solid #262626'
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: '#737373' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        background: '#000',
        paddingTop: 96,
        paddingBottom: 96
      }}>
        <div style={{ 
          maxWidth: 700, 
          margin: '0 auto', 
          padding: '0 24px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Ready to Start?
          </h2>
          <p style={{ fontSize: 18, color: '#737373', marginBottom: 40 }}>
            Join the future of decentralized prediction markets
          </p>
          
          {isConnected ? (
            <Link 
              to="/markets"
              style={{
                display: 'inline-block',
                padding: '18px 48px',
                background: '#3b82f6',
                color: '#fff',
                borderRadius: 12,
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: 18
              }}
            >
              Start Trading
            </Link>
          ) : (
            <button 
              type="button"
              onClick={() => connect()}
              style={{
                padding: '18px 48px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 18
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
