import React, { useState } from 'react';
import { useReputation, useReputationScore, useKYC, useAML, useFraudDetection, useAccountLinking, useReputationBadges, useReputationLevel } from '@/hooks/useReputationHooks';

export function ReputationCard({ userId }: { userId: string }) {
  const { reputation } = useReputation(userId);
  const score = useReputationScore(userId);
  const level = useReputationLevel(userId);
  const badges = useReputationBadges(userId);

  if (!score) return <div>Loading reputation data...</div>;

  return (
    <div className="reputation-card">
      <h3>User Reputation</h3>
      <div className="reputation-score">
        <span className="score">{score.score}</span>
        <span className="level">{level.toUpperCase()}</span>
      </div>
      <div className="reputation-stats">
        <div>Transactions: {score.totalTransactions}</div>
        <div>Success Rate: {(score.completionRate * 100).toFixed(1)}%</div>
      </div>
      {badges.length > 0 && (
        <div className="badges">
          {badges.map(badge => (
            <span key={badge.badgeId} className="badge">{badge.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function KYCVerification({ userId }: { userId: string }) {
  const { kycStatus, isVerified, submitKYC, approveKYC } = useKYC(userId);
  const [documentType, setDocumentType] = useState<'passport' | 'license' | 'national_id'>('passport');

  const handleSubmit = () => {
    submitKYC(documentType, {});
  };

  return (
    <div className="kyc-verification">
      <h3>KYC Verification</h3>
      <div className="status">
        {isVerified ? (
          <span className="verified">Verified</span>
        ) : kycStatus ? (
          <span className="pending">Pending</span>
        ) : (
          <span className="unverified">Not Started</span>
        )}
      </div>
      {!isVerified && (
        <div className="kyc-form">
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value as any)}>
            <option value="passport">Passport</option>
            <option value="license">License</option>
            <option value="national_id">National ID</option>
          </select>
          <button onClick={handleSubmit}>Submit KYC</button>
        </div>
      )}
    </div>
  );
}

export function AMLCheck({ userId }: { userId: string }) {
  const { amlStatus, isAMLClear, performCheck } = useAML(userId);

  return (
    <div className="aml-check">
      <h3>AML Check</h3>
      <div className="status">
        {isAMLClear ? (
          <span className="clear">Clear</span>
        ) : amlStatus ? (
          <span className="flagged">Under Review</span>
        ) : (
          <span className="pending">Not Checked</span>
        )}
      </div>
      <button onClick={performCheck}>Run AML Check</button>
    </div>
  );
}

export function FraudAlerts({ userId }: { userId: string }) {
  const { alerts, suspiciousActivities } = useFraudDetection(userId);

  return (
    <div className="fraud-alerts">
      <h3>Fraud Alerts ({alerts.length})</h3>
      {alerts.length === 0 ? (
        <p>No alerts</p>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.alertId} className={`alert alert-${alert.severity}`}>
              <span className="type">{alert.type}</span>
              <span className="message">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {suspiciousActivities.length > 0 && (
        <div className="suspicious-activities">
          <h4>Suspicious Activities ({suspiciousActivities.length})</h4>
          {suspiciousActivities.map(activity => (
            <div key={activity.activityId} className={`activity activity-${activity.severity}`}>
              <span className="type">{activity.type}</span>
              <span className="description">{activity.description}</span>
              <span className="status">{activity.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountLinker({ userId }: { userId: string }) {
  const { linkedAccounts, linkAccount } = useAccountLinking(userId);
  const [accountId, setAccountId] = useState('');
  const [linkType, setLinkType] = useState<'wallet' | 'email' | 'phone' | 'social'>('wallet');

  const handleLink = () => {
    if (accountId) {
      linkAccount(accountId, linkType);
      setAccountId('');
    }
  };

  return (
    <div className="account-linker">
      <h3>Linked Accounts</h3>
      <div className="linked-list">
        {linkedAccounts.map(account => (
          <div key={account.accountId} className={`account account-${account.linkType}`}>
            <span>{account.linkType}</span>
            <span>{account.accountId.substring(0, 10)}...</span>
            <span className={`status ${account.status}`}>{account.status}</span>
          </div>
        ))}
      </div>
      <div className="link-form">
        <input
          type="text"
          placeholder="Account identifier"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
        <select value={linkType} onChange={(e) => setLinkType(e.target.value as any)}>
          <option value="wallet">Wallet</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="social">Social</option>
        </select>
        <button onClick={handleLink}>Link Account</button>
      </div>
    </div>
  );
}

export function ReputationDashboard({ userId }: { userId: string }) {
  return (
    <div className="reputation-dashboard">
      <h2>Reputation & Security</h2>
      <div className="dashboard-grid">
        <ReputationCard userId={userId} />
        <KYCVerification userId={userId} />
        <AMLCheck userId={userId} />
        <AccountLinker userId={userId} />
        <FraudAlerts userId={userId} />
      </div>
    </div>
  );
}

export function UserReputationSummary({ userId }: { userId: string }) {
  const score = useReputationScore(userId);
  const level = useReputationLevel(userId);
  const { isVerified } = useKYC(userId);
  const { isAMLClear } = useAML(userId);

  if (!score) return null;

  return (
    <div className="reputation-summary">
      <div className="score-display">
        <div className="score-value">{score.score}</div>
        <div className="score-level">{level}</div>
      </div>
      <div className="verification-status">
        {isVerified && <span className="badge-verified">KYC Verified</span>}
        {isAMLClear && <span className="badge-aml-clear">AML Clear</span>}
      </div>
    </div>
  );
}
