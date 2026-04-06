import { useState, useMemo } from 'react';
import { useWallet } from '../components/WalletProvider';
import { useStakingData } from '../hooks/useStakingData';
import { useStakingActions } from '../hooks/useStakingActions';
import { 
  formatOxcAmount, 
  parseOxcInput, 
  calculateEstimatedApy,
  formatLockStatus,
} from '../utils/stakingHelpers';
import { validateAmount, type ValidationResult } from '../utils/validation';

type StakingTab = 'stake' | 'unstake' | 'rewards';

export function StakingPage() {
  const { isConnected, connect, address } = useWallet();
  const { stakingData, isLoading: dataLoading, refetch } = useStakingData(address);
  const { stake, unstake, isLoading: actionLoading, error: actionError, txId } = useStakingActions();
  
  const [activeTab, setActiveTab] = useState<StakingTab>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [, setValidationError] = useState<string | null>(null);

  const isLoading = dataLoading || actionLoading;
  
  const estimatedApy = calculateEstimatedApy(stakingData.userStaked, stakingData.totalStaked);
  const lockStatus = formatLockStatus(stakingData.currentBlock, stakingData.userLockedUntil);
  const minStake = 1000000n;
  const lockPeriodDays = 7;

  const stakeValidation = useMemo((): ValidationResult => {
    if (!stakeAmount) return { isValid: true };
    return validateAmount(stakeAmount, 1, 1000000);
  }, [stakeAmount]);

  const unstakeValidation = useMemo((): ValidationResult => {
    if (!unstakeAmount) return { isValid: true };
    return validateAmount(unstakeAmount, 0.000001, Number(stakingData.userStaked) / 1000000);
  }, [unstakeAmount, stakingData.userStaked]);

  const handleStake = async () => {
    if (!stakeAmount || isLoading) return;
    
    if (!stakeValidation.isValid) {
      setValidationError(stakeValidation.error || 'Invalid amount');
      return;
    }
    
    const amount = parseOxcInput(stakeAmount);
    if (amount < minStake) {
      setValidationError('Amount must be at least 1 OXC');
      return;
    }
    
    setValidationError(null);
    await stake(amount, () => {
      setStakeAmount('');
      refetch();
    });
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || isLoading || lockStatus.isLocked) return;
    
    if (!unstakeValidation.isValid) {
      setValidationError(unstakeValidation.error || 'Invalid amount');
      return;
    }
    
    const amount = parseOxcInput(unstakeAmount);
    if (amount <= 0n) {
      setValidationError('Amount must be greater than zero');
      return;
    }
    
    setValidationError(null);
    await unstake(amount, () => {
      setUnstakeAmount('');
      refetch();
    });
  };

  const handleClaimRewards = async () => {
    // Rewards claiming will be implemented
  };

  const setMaxStake = () => {
    if (stakingData.userBalance > 0n) {
      setStakeAmount((Number(stakingData.userBalance) / 1000000).toString());
    }
  };

  const setMaxUnstake = () => {
    if (stakingData.userStaked > 0n && !lockStatus.isLocked) {
      setUnstakeAmount((Number(stakingData.userStaked) / 1000000).toString());
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
          </h1>            <span>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto px-4">
            Stake your OXC tokens to earn rewards and participate in platform governance. 
            The more you stake, the more you earn.
          </p>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <StatCard label="Total Staked" value={`${formatOxcAmount(stakingData.totalStaked)} OXC`} />
          <StatCard label="Your Stake" value={`${formatOxcAmount(stakingData.userStaked)} OXC`} />
          <StatCard label="Est. APY" value={`${estimatedApy}%`} isHighlighted />
          <StatCard label="Lock Period" value={`${lockPeriodDays} Days`} />
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Staking Card */}
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-4 sm:p-6 lg:p-8">
            {/* Tabs */}
            <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 bg-neutral-900 p-1 rounded-xl">
              <TabButton 
                label="Stake" 
                isActive={activeTab === 'stake'} 
                onClick={() => setActiveTab('stake')} 
              />
              <TabButton 
                label="Unstake" 
                isActive={activeTab === 'unstake'} 
                onClick={() => setActiveTab('unstake')} 
              />
              <TabButton 
                label="Rewards" 
                isActive={activeTab === 'rewards'} 
                onClick={() => setActiveTab('rewards')} 
              />
            </div>

            {!isConnected ? (
              <div className="text-center py-8 sm:py-10">
                <p className="text-neutral-400 mb-4 sm:mb-6">
                  Connect your wallet to start staking
                </p>
                <button 
                  className="btn btn-primary w-full sm:w-auto min-w-[200px]"
                  onClick={() => connect()}
                >
                  Connect Wallet
                </button>
              </div>
            ) : activeTab === 'stake' ? (
              <>
                <InputSection
                  label="Amount to Stake"
                  balance={`Balance: ${formatOxcAmount(stakingData.userBalance)} OXC`}
                  value={stakeAmount}
                  onChange={setStakeAmount}
                  onMax={setMaxStake}
                  disabled={isLoading}
                />
                <InfoBox>
                  <InfoRow label="Minimum Stake" value={`${formatOxcAmount(minStake)} OXC`} />
                  <InfoRow label="Lock Period" value={`${lockPeriodDays} days`} />
                  <InfoRow label="Expected APY" value={`${estimatedApy}%`} isLast isHighlighted />
                </InfoBox>
                {actionError && <ErrorMessage message={actionError} />}
                {txId && <SuccessMessage txId={txId} />}
                <button 
                  className="btn btn-primary w-full mt-4"
                  onClick={handleStake}
                  disabled={isLoading || !stakeAmount}
                >
                  {isLoading ? 'Staking...' : 'Stake OXC'}
                </button>
              </>
            ) : activeTab === 'unstake' ? (
              <>
                <InputSection
                  label="Amount to Unstake"
                  balance={`Staked: ${formatOxcAmount(stakingData.userStaked)} OXC`}
                  value={unstakeAmount}
                  onChange={setUnstakeAmount}
                  onMax={setMaxUnstake}
                  disabled={isLoading || lockStatus.isLocked}
                />
                <InfoBox>
                  <InfoRow label="Currently Staked" value={`${formatOxcAmount(stakingData.userStaked)} OXC`} />
                  <InfoRow 
                    label="Lock Status" 
                    value={lockStatus.message} 
                    isLast 
                    valueColor={lockStatus.isLocked ? 'text-red-500' : 'text-emerald-500'} 
                  />
                </InfoBox>
                {lockStatus.isLocked && (
                  <div className="text-amber-500 text-sm mb-4 p-3 bg-amber-500/10 rounded-lg">
   Your tokens are locked. {lockStatus.message}                    
                  </div>
                )}
                {actionError && <ErrorMessage message={actionError} />}
                <button 
                  className="btn btn-primary w-full mt-4"
                  onClick={handleUnstake}
                  disabled={isLoading || !unstakeAmount || lockStatus.isLocked}
                >
                  {isLoading ? 'Unstaking...' : lockStatus.isLocked ? 'Tokens Locked' : 'Unstake OXC'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 text-center">
                  <div className="text-sm text-neutral-400 mb-2">Staking Rewards</div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-500 mb-4">
                    Coming Soon
                  </div>
                  <p className="text-neutral-400 text-sm mb-4">
                    Rewards distribution will be enabled in a future contract update.
                  </p>
                  <button 
                    className="btn w-full bg-neutral-700 text-neutral-400 cursor-not-allowed"
                    onClick={handleClaimRewards}
                    disabled={true}
                  >
                    Claim Rewards (Coming Soon)
                  </button>
                </div>
                <InfoBox className="mt-6">
                  <InfoRow label="Your Stake" value={`${formatOxcAmount(stakingData.userStaked)} OXC`} />
                  <InfoRow label="Est. APY" value={`${estimatedApy}%`} isHighlighted />
                  <InfoRow 
                    label="Lock Status" 
                    value={lockStatus.message} 
                    isLast 
                    valueColor={lockStatus.isLocked ? 'text-amber-500' : 'text-emerald-500'} 
                  />
                </InfoBox>
              </>
            )}
          </div>

          {/* Your Stake Card */}
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-4 sm:p-6 lg:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
              Your Staking Overview
            </h3>
            
            {dataLoading ? (
              <div className="text-center py-10 text-neutral-400">
                Loading staking data...
              </div>
            ) : (
              <>
                <StakeInfoRow label="Wallet Balance" value={`${formatOxcAmount(stakingData.userBalance)} OXC`} />
                <StakeInfoRow label="Currently Staked" value={`${formatOxcAmount(stakingData.userStaked)} OXC`} />
                <StakeInfoRow 
                  label="Lock Status" 
                  value={lockStatus.message}
                  valueColor={lockStatus.isLocked ? 'text-amber-500' : 'text-emerald-500'}
                />
                <StakeInfoRow 
                  label="Total Value" 
                  value={`${formatOxcAmount(stakingData.userBalance + stakingData.userStaked)} OXC`}
                  isLast
                />
              </>
            )}

            <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-neutral-900 rounded-xl">
              <ul className="text-xs sm:text-sm text-white leading-relaxed space-y-2 list-disc list-inside">              <h4 className="text-sm text-neutral-400 mb-3">
                <li>Earn passive income through staking rewards</li>
                <li>Participate in governance voting</li>
                <li>Reduced platform fees</li>
                <li>Access to exclusive features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function StatCard({ label, value, isHighlighted }: { label: string; value: string; isHighlighted?: boolean }) {
  return (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center">
      <div className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2 uppercase tracking-wide">
        {label}
      </div>
      <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${isHighlighted ? 'text-emerald-500' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'text-neutral-400 hover:text-white'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InputSection({ 
  label, 
  balance, 
  value, 
  onChange, 
  onMax, 
  disabled 
}: { 
  label: string; 
  balance: string; 
  value: string; 
  onChange: (v: string) => void; 
  onMax: () => void; 
  disabled: boolean;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-2 text-sm text-neutral-400">
        <span>{label}</span>
        <span className="text-xs sm:text-sm">{balance}</span>
      </div>
      <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 rounded-xl p-1 mb-4 sm:mb-6">
        <input
          type="number"
          className="flex-1 bg-transparent border-none outline-none text-white text-base sm:text-lg font-semibold p-2 sm:p-3 min-w-0"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button 
          className="px-3 py-2 bg-neutral-800 rounded-lg text-blue-500 text-xs font-bold hover:bg-neutral-700 transition-colors mr-1"
          onClick={onMax}
          disabled={disabled}
        >
          MAX
        </button>
      </div>
    </>
  );
}

function InfoBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-neutral-900 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 ${className}`}>
      {children}
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  isLast, 
  isHighlighted,
  valueColor 
}: { 
  label: string; 
  value: string; 
  isLast?: boolean;
  isHighlighted?: boolean;
  valueColor?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${!isLast ? 'border-b border-neutral-800' : ''}`}>
      <span className="text-xs sm:text-sm text-neutral-400">{label}</span>
      <span className={`text-xs sm:text-sm font-semibold ${valueColor || (isHighlighted ? 'text-emerald-500' : 'text-white')}`}>
        {value}
      </span>
    </div>
  );
}

function StakeInfoRow({ 
  label, 
  value, 
  valueColor,
  isLast 
}: { 
  label: string; 
  value: string; 
  valueColor?: string;
  isLast?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-3 sm:py-4 ${!isLast ? 'border-b border-neutral-800' : ''}`}>
      <span className="text-sm text-neutral-400">{label}</span>
      <span className={`text-base sm:text-lg font-semibold ${valueColor || 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-red-500 text-sm mb-4 p-3 bg-red-500/10 rounded-lg">
      {message}
    </div>
  );
}

function SuccessMessage({ txId }: { txId: string }) {
  return (
    <div className="text-emerald-500 text-sm mb-4 p-3 bg-emerald-500/10 rounded-lg">
      Transaction submitted! ID: {txId.slice(0, 16)}...
    </div>
  );
}
