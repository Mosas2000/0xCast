import { useState, useMemo } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { useStakingData } from '@/hooks/useStakingData';
import { useStakingActions } from '@/hooks/useStakingActions';
import { 
  formatOxcAmount, 
  parseOxcInput, 
  calculateEstimatedApy,
  formatLockStatus,
} from '@/utils/stakingHelpers';
import { validateAmount, type ValidationResult } from '@/utils/validation';

type StakingTab = 'stake' | 'unstake' | 'rewards';

export function StakingPage() {
  const { isConnected, connect, address } = useWallet();
  const { stakingData, isLoading: dataLoading, refetch } = useStakingData(address);
  const { stake, unstake, isLoading: actionLoading, error: actionError, txId } = useStakingActions();
  
  const [activeTab, setActiveTab] = useState<StakingTab>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  // Note: validationError stored for future UI display
  const [, setValidationError] = useState<string | null>(null);

  const isLoading = dataLoading || actionLoading;
  
  // Calculate derived values
  const estimatedApy = calculateEstimatedApy(stakingData.userStaked, stakingData.totalStaked);
  const lockStatus = formatLockStatus(stakingData.currentBlock, stakingData.userLockedUntil);
  const minStake = 1000000n; // 1 OXC minimum
  const lockPeriodDays = 7; // ~7 days lock period

  // Validate stake amount
  const stakeValidation = useMemo((): ValidationResult => {
    if (!stakeAmount) return { isValid: true };
    const result = validateAmount(stakeAmount, 1, 1000000);
    return result;
  }, [stakeAmount]);

  // Validate unstake amount
  const unstakeValidation = useMemo((): ValidationResult => {
    if (!unstakeAmount) return { isValid: true };
    const result = validateAmount(unstakeAmount, 0.000001, Number(stakingData.userStaked) / 1000000);
    return result;
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
    // Note: Rewards claiming would need a separate contract function
    // For now, this is a placeholder
    console.log('Rewards claiming not yet implemented in contract');
  };

  const setMaxStake = () => {
    setStakeAmount(formatOxcAmount(stakingData.userBalance));
  };

  const setMaxUnstake = () => {
    setUnstakeAmount(formatOxcAmount(stakingData.userStaked));
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    paddingTop: '120px',
    paddingBottom: '80px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#9CA3AF',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
  };

  const apyValueStyle: React.CSSProperties = {
    ...statValueStyle,
    color: '#22C55E',
  };

  const mainGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '20px',
    padding: '32px',
  };

  const tabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '32px',
    backgroundColor: '#111111',
    padding: '4px',
    borderRadius: '12px',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: '1',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    backgroundColor: isActive ? '#3B82F6' : 'transparent',
    color: isActive ? '#FFFFFF' : '#9CA3AF',
  });

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#9CA3AF',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#111111',
    border: '1px solid #2F2F2F',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '24px',
  };

  const inputStyle: React.CSSProperties = {
    flex: '1',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '600',
    padding: '12px 16px',
  };

  const maxButtonStyle: React.CSSProperties = {
    backgroundColor: '#1F1F1F',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#3B82F6',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 24px',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    opacity: isLoading ? 0.7 : 1,
  };

  const connectButtonStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: '#3B82F6',
    marginTop: '24px',
  };

  const infoBoxStyle: React.CSSProperties = {
    backgroundColor: '#111111',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '24px',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1F1F1F',
  };

  const infoRowLastStyle: React.CSSProperties = {
    ...infoRowStyle,
    borderBottom: 'none',
  };

  const infoLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
  };

  const infoValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const rewardsCardStyle: React.CSSProperties = {
    backgroundColor: '#0F1A0F',
    border: '1px solid #22C55E33',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
  };

  const rewardsTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    marginBottom: '8px',
  };

  const rewardsValueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: '16px',
  };

  const yourStakeCardStyle: React.CSSProperties = {
    ...cardStyle,
  };

  const yourStakeTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '24px',
  };

  const stakeRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #1F1F1F',
  };

  const stakeLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
  };

  const stakeValueStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            <span>🔒</span> OXC Staking
          </h1>
          <p style={subtitleStyle}>
            Stake your OXC tokens to earn rewards and participate in platform governance. 
            The more you stake, the more you earn.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Staked</div>
            <div style={statValueStyle}>{formatOxcAmount(stakingData.totalStaked)} OXC</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Your Stake</div>
            <div style={statValueStyle}>{formatOxcAmount(stakingData.userStaked)} OXC</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Est. APY</div>
            <div style={apyValueStyle}>{estimatedApy}%</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Lock Period</div>
            <div style={statValueStyle}>{lockPeriodDays} Days</div>
          </div>
        </div>

        {/* Main Content */}
        <div style={mainGridStyle}>
          {/* Staking Card */}
          <div style={cardStyle}>
            <div style={tabsStyle}>
              <button 
                style={tabStyle(activeTab === 'stake')} 
                onClick={() => setActiveTab('stake')}
              >
                Stake
              </button>
              <button 
                style={tabStyle(activeTab === 'unstake')} 
                onClick={() => setActiveTab('unstake')}
              >
                Unstake
              </button>
              <button 
                style={tabStyle(activeTab === 'rewards')} 
                onClick={() => setActiveTab('rewards')}
              >
                Rewards
              </button>
            </div>

            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
                  Connect your wallet to start staking
                </p>
                <button style={connectButtonStyle} onClick={() => connect()}>
                  Connect Wallet
                </button>
              </div>
            ) : activeTab === 'stake' ? (
              <>
                <div style={labelStyle}>
                  <span>Amount to Stake</span>
                  <span>Balance: {formatOxcAmount(stakingData.userBalance)} OXC</span>
                </div>
                <div style={inputContainerStyle}>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={isLoading}
                  />
                  <button style={maxButtonStyle} onClick={setMaxStake}>
                    MAX
                  </button>
                </div>
                <div style={infoBoxStyle}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Minimum Stake</span>
                    <span style={infoValueStyle}>{formatOxcAmount(minStake)} OXC</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Lock Period</span>
                    <span style={infoValueStyle}>{lockPeriodDays} days</span>
                  </div>
                  <div style={infoRowLastStyle}>
                    <span style={infoLabelStyle}>Expected APY</span>
                    <span style={{ ...infoValueStyle, color: '#22C55E' }}>{estimatedApy}%</span>
                  </div>
                </div>
                {actionError && (
                  <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', padding: '12px', backgroundColor: '#1a0505', borderRadius: '8px' }}>
                    {actionError}
                  </div>
                )}
                {txId && (
                  <div style={{ color: '#22C55E', fontSize: '14px', marginBottom: '16px', padding: '12px', backgroundColor: '#0a1a0a', borderRadius: '8px' }}>
                    Transaction submitted! ID: {txId.slice(0, 16)}...
                  </div>
                )}
                <button 
                  style={primaryButtonStyle} 
                  onClick={handleStake}
                  disabled={isLoading || !stakeAmount}
                >
                  {isLoading ? 'Staking...' : 'Stake OXC'}
                </button>
              </>
            ) : activeTab === 'unstake' ? (
              <>
                <div style={labelStyle}>
                  <span>Amount to Unstake</span>
                  <span>Staked: {formatOxcAmount(stakingData.userStaked)} OXC</span>
                </div>
                <div style={inputContainerStyle}>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="0.00"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    disabled={isLoading || lockStatus.isLocked}
                  />
                  <button style={maxButtonStyle} onClick={setMaxUnstake} disabled={lockStatus.isLocked}>
                    MAX
                  </button>
                </div>
                <div style={infoBoxStyle}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Currently Staked</span>
                    <span style={infoValueStyle}>{formatOxcAmount(stakingData.userStaked)} OXC</span>
                  </div>
                  <div style={infoRowLastStyle}>
                    <span style={infoLabelStyle}>Lock Status</span>
                    <span style={{ ...infoValueStyle, color: lockStatus.isLocked ? '#EF4444' : '#22C55E' }}>
                      {lockStatus.message}
                    </span>
                  </div>
                </div>
                {lockStatus.isLocked && (
                  <div style={{ color: '#F59E0B', fontSize: '14px', marginBottom: '16px', padding: '12px', backgroundColor: '#1a1505', borderRadius: '8px' }}>
                    ⏳ Your tokens are locked. {lockStatus.message}
                  </div>
                )}
                {actionError && (
                  <div style={{ color: '#EF4444', fontSize: '14px', marginBottom: '16px', padding: '12px', backgroundColor: '#1a0505', borderRadius: '8px' }}>
                    {actionError}
                  </div>
                )}
                <button 
                  style={primaryButtonStyle} 
                  onClick={handleUnstake}
                  disabled={isLoading || !unstakeAmount || lockStatus.isLocked}
                >
                  {isLoading ? 'Unstaking...' : lockStatus.isLocked ? 'Tokens Locked' : 'Unstake OXC'}
                </button>
              </>
            ) : (
              <>
                <div style={rewardsCardStyle}>
                  <div style={rewardsTitleStyle}>Staking Rewards</div>
                  <div style={rewardsValueStyle}>
                    Coming Soon
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>
                    Rewards distribution will be enabled in a future contract update.
                  </p>
                  <button 
                    style={{ ...primaryButtonStyle, backgroundColor: '#374151', cursor: 'not-allowed' }}
                    onClick={handleClaimRewards}
                    disabled={true}
                  >
                    Claim Rewards (Coming Soon)
                  </button>
                </div>
                <div style={{ ...infoBoxStyle, marginTop: '24px', marginBottom: '0' }}>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Your Stake</span>
                    <span style={infoValueStyle}>{formatOxcAmount(stakingData.userStaked)} OXC</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>Est. APY</span>
                    <span style={{ ...infoValueStyle, color: '#22C55E' }}>{estimatedApy}%</span>
                  </div>
                  <div style={infoRowLastStyle}>
                    <span style={infoLabelStyle}>Lock Status</span>
                    <span style={{ ...infoValueStyle, color: lockStatus.isLocked ? '#F59E0B' : '#22C55E' }}>
                      {lockStatus.message}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Your Stake Card */}
          <div style={yourStakeCardStyle}>
            <h3 style={yourStakeTitleStyle}>Your Staking Overview</h3>
            
            {dataLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
                Loading staking data...
              </div>
            ) : (
              <>
                <div style={stakeRowStyle}>
                  <span style={stakeLabelStyle}>Wallet Balance</span>
                  <span style={stakeValueStyle}>{formatOxcAmount(stakingData.userBalance)} OXC</span>
                </div>
                
                <div style={stakeRowStyle}>
                  <span style={stakeLabelStyle}>Currently Staked</span>
                  <span style={stakeValueStyle}>{formatOxcAmount(stakingData.userStaked)} OXC</span>
                </div>
                
                <div style={stakeRowStyle}>
                  <span style={stakeLabelStyle}>Lock Status</span>
                  <span style={{ ...stakeValueStyle, color: lockStatus.isLocked ? '#F59E0B' : '#22C55E' }}>
                    {lockStatus.message}
                  </span>
                </div>
                
                <div style={{ ...stakeRowStyle, borderBottom: 'none' }}>
                  <span style={stakeLabelStyle}>Total Value</span>
                  <span style={stakeValueStyle}>
                    {formatOxcAmount(stakingData.userBalance + stakingData.userStaked)} OXC
                  </span>
                </div>
              </>
            )}

            <div style={{ 
              marginTop: '32px', 
              padding: '20px', 
              backgroundColor: '#111111', 
              borderRadius: '12px' 
            }}>
              <h4 style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
                💡 Staking Benefits
              </h4>
              <ul style={{ 
                fontSize: '13px', 
                color: '#FFFFFF', 
                lineHeight: '1.8',
                paddingLeft: '20px',
                margin: '0'
              }}>
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
