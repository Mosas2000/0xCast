import { Link } from 'react-router-dom';
import { OXC_TOKEN, TOKEN_DISTRIBUTION, TOKEN_UTILITIES } from '@/config/token';

export function TokenPage() {
  const distributionColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-black text-white pt-[72px]">
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold">
            OXC
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-br from-white to-blue-500 bg-clip-text text-transparent">
            {OXC_TOKEN.name}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-neutral-400 mb-8 leading-relaxed">
            Governance and utility token powering the 0xCast prediction markets ecosystem
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <div className="py-4 px-6 sm:px-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs sm:text-sm text-neutral-400 mb-1">Total Supply</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">100,000,000 OXC</div>
            </div>
            <div className="py-4 px-6 sm:px-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs sm:text-sm text-neutral-400 mb-1">Decimals</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">{OXC_TOKEN.decimals}</div>
            </div>
            <div className="py-4 px-6 sm:px-8 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs sm:text-sm text-neutral-400 mb-1">Standard</div>
              <div className="text-lg sm:text-xl lg:text-2xl font-semibold">SIP-010</div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Utilities */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-12">
            Token Utility
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TOKEN_UTILITIES.map((utility, index) => (
              <div 
                key={index} 
                className="p-6 sm:p-8 bg-white/[0.02] rounded-2xl border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="text-4xl sm:text-5xl mb-4">{utility.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  {utility.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
                  {utility.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token Distribution */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-12">
            Token Distribution
          </h2>
          
          {/* Distribution Chart */}
          <div className="flex mb-10 sm:mb-12 h-5 sm:h-6 rounded-xl overflow-hidden">
            {TOKEN_DISTRIBUTION.map((item, index) => (
              <div
                key={index}
                className="transition-all"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: distributionColors[index],
                }}
                title={`${item.name}: ${item.percentage}%`}
              />
            ))}
          </div>

          {/* Distribution Table - Mobile */}
          <div className="sm:hidden space-y-4">
            {TOKEN_DISTRIBUTION.map((item, index) => (
              <div 
                key={index}
                className="p-4 bg-black/30 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: distributionColors[index] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-neutral-500 text-xs mb-1">Percentage</div>
                    <div>{item.percentage}%</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs mb-1">Amount</div>
                    <div>{item.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs mb-1">Vesting</div>
                    <div className="text-neutral-400">{item.vesting}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Distribution Table - Desktop */}
          <div className="hidden sm:block bg-black/30 rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left font-semibold">Allocation</th>
                  <th className="p-4 text-right font-semibold">Percentage</th>
                  <th className="p-4 text-right font-semibold">Amount</th>
                  <th className="p-4 text-right font-semibold">Vesting</th>
                </tr>
              </thead>
              <tbody>
                {TOKEN_DISTRIBUTION.map((item, index) => (
                  <tr 
                    key={index}
                    className="border-b border-white/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: distributionColors[index] }}
                        />
                        {item.name}
                      </div>
                    </td>
                    <td className="p-4 text-right">{item.percentage}%</td>
                    <td className="p-4 text-right">{item.amount.toLocaleString()} OXC</td>
                    <td className="p-4 text-right text-neutral-400">{item.vesting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Staking Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Stake OXC
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mb-8">
            Stake your OXC tokens to earn rewards and participate in governance
          </p>
          
          <div className="p-6 sm:p-8 bg-white/[0.02] rounded-2xl border border-white/10">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Current APY</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-500">12.5%</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Total Staked</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold">15M OXC</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Lock Period</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold">7 Days</div>
              </div>
            </div>
            <Link 
              to="/staking"
              className="inline-block py-4 px-8 sm:px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-colors"
            >
              Go to Staking
            </Link>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Governance
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg mb-8">
            Shape the future of 0xCast by voting on proposals
          </p>
          
          <div className="p-6 sm:p-8 bg-black/30 rounded-2xl border border-white/10">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Active Proposals</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-500">3</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Total Proposals</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold">24</div>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-neutral-400 mb-1">Passed</div>
                <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-green-500">18</div>
              </div>
            </div>
            <Link 
              to="/governance"
              className="inline-block py-4 px-8 sm:px-12 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600 rounded-xl font-semibold text-base transition-colors"
            >
              View Proposals
            </Link>
          </div>
        </div>
      </section>

      {/* Contract Info */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-12">
            Smart Contracts
          </h2>
          <div className="flex flex-col gap-4">
            {Object.entries(OXC_TOKEN.contracts.mainnet).map(([name, address]) => (
              <div 
                key={name}
                className="p-4 sm:p-5 bg-black/30 rounded-xl border border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <span className="font-medium capitalize">
                  {name.replace('-', ' ')}
                </span>
                <code className="text-xs sm:text-sm text-neutral-400 bg-white/5 px-2 py-1 rounded break-all">
                  {address}
                </code>
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-500 text-sm mt-6">
            Contracts will be deployed after audit completion
          </p>
        </div>
      </section>
    </div>
  );
}
