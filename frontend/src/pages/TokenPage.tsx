import { Link } from 'react-router-dom';
import { OXC_TOKEN, TOKEN_DISTRIBUTION, TOKEN_UTILITIES } from '../config/token';

export function TokenPage() {

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      color: '#ffffff',
      paddingTop: 80 
    }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '80px 24px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            width: 120,
            height: 120,
            margin: '0 auto 32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            fontWeight: 700,
          }}>
            OXC
          </div>
          <h1 style={{ 
            fontSize: 48, 
            fontWeight: 700, 
            marginBottom: 16,
            background: 'linear-gradient(135deg, #ffffff 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {OXC_TOKEN.name}
          </h1>
          <p style={{ 
            fontSize: 20, 
            color: '#9CA3AF', 
            marginBottom: 32,
            lineHeight: 1.6 
          }}>
            Governance and utility token powering the 0xCast prediction markets ecosystem
          </p>
          <div style={{ 
            display: 'flex', 
            gap: 24, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Total Supply</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>100,000,000 OXC</div>
            </div>
            <div style={{
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Decimals</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{OXC_TOKEN.decimals}</div>
            </div>
            <div style={{
              padding: '16px 32px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Standard</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>SIP-010</div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Utilities */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            textAlign: 'center', 
            marginBottom: 48 
          }}>
            Token Utility
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 24 
          }}>
            {TOKEN_UTILITIES.map((utility, index) => (
              <div key={index} style={{
                padding: 32,
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{utility.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                  {utility.title}
                </h3>
                <p style={{ color: '#9CA3AF', lineHeight: 1.6 }}>
                  {utility.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Distribution */}
      <section style={{ 
        padding: '80px 24px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            textAlign: 'center', 
            marginBottom: 48 
          }}>
            Token Distribution
          </h2>
          
          {/* Distribution Chart */}
          <div style={{ 
            display: 'flex', 
            marginBottom: 48,
            height: 24,
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            {TOKEN_DISTRIBUTION.map((item, index) => {
              const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
              return (
                <div
                  key={index}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: colors[index],
                    transition: 'all 0.3s ease',
                  }}
                  title={`${item.name}: ${item.percentage}%`}
                />
              );
            })}
          </div>

          {/* Distribution Table */}
          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Allocation</th>
                  <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Percentage</th>
                  <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Vesting</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_DISTRIBUTION.map((item, index) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                  return (
                    <tr 
                      key={index}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                    >
                      <td style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: colors[index],
                        }} />
                        {item.name}
                      </td>
                      <td style={{ padding: 16, textAlign: 'right' }}>{item.percentage}%</td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        {item.amount.toLocaleString()} OXC
                      </td>
                      <td style={{ padding: 16, textAlign: 'right', color: '#9CA3AF' }}>
                        {item.vesting}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Staking Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
            Stake OXC
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 32 }}>
            Stake your OXC tokens to earn rewards and participate in governance
          </p>
          
          <div style={{
            padding: 32,
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 24,
              marginBottom: 32
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Current APY</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#22C55E' }}>12.5%</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Total Staked</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>15M OXC</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Lock Period</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>7 Days</div>
              </div>
            </div>
            <Link 
              to="/staking"
              style={{ 
                display: 'inline-block',
                padding: '16px 48px',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                transition: 'all 0.2s',
              }}
            >
              Go to Staking
            </Link>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section style={{ 
        padding: '80px 24px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>
            Governance
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 32 }}>
            Shape the future of 0xCast by voting on proposals
          </p>
          
          <div style={{
            padding: 32,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 24,
              marginBottom: 32
            }}>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Active Proposals</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#3B82F6' }}>3</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Total Proposals</div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>24</div>
              </div>
              <div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 4 }}>Passed</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#22C55E' }}>18</div>
              </div>
            </div>
            <Link 
              to="/governance"
              style={{ 
                display: 'inline-block',
                padding: '16px 48px',
                backgroundColor: '#1F1F1F',
                color: '#FFFFFF',
                borderRadius: 12,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 16,
                transition: 'all 0.2s',
                border: '1px solid #3F3F3F',
              }}
            >
              View Proposals
            </Link>
          </div>
        </div>
      </section>

      {/* Contract Info */}
      <section style={{ 
        padding: '80px 24px',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 700, 
            textAlign: 'center', 
            marginBottom: 48 
          }}>
            Smart Contracts
          </h2>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16 
          }}>
            {Object.entries(OXC_TOKEN.contracts.mainnet).map(([name, address]) => (
              <div 
                key={name}
                style={{
                  padding: 20,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                  {name.replace('-', ' ')}
                </span>
                <code style={{ 
                  fontSize: 12, 
                  color: '#9CA3AF',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 8px',
                  borderRadius: 4,
                }}>
                  {address}
                </code>
              </div>
            ))}
          </div>
          <p style={{ 
            textAlign: 'center', 
            color: '#6B7280', 
            fontSize: 14, 
            marginTop: 24 
          }}>
            Contracts will be deployed after audit completion
          </p>
        </div>
      </section>
    </div>
  );
}
