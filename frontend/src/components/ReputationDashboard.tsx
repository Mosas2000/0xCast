import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserReputation, ReputationBadge } from '../types/reputation';
import { reputationFraudIntegration } from '../services/ReputationFraudIntegrationService';

interface ReputationDashboardProps {
  userId: string;
}

export function ReputationDashboard({ userId }: ReputationDashboardProps) {
  const { t } = useTranslation(['common', 'reputation']);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [badges, setBadges] = useState<ReputationBadge[]>([]);

  useEffect(() => {
    loadReputationData();
  }, [userId]);

  const loadReputationData = () => {
    const reputationService = reputationFraudIntegration.getReputationService();
    const userReputation = reputationService.getReputation(userId);
    
    if (userReputation) {
      setReputation(userReputation);
      const userBadges = reputationService.getUserBadges(userId);
      setBadges(userBadges);
    }

    const trust = reputationFraudIntegration.getUserTrustScore(userId);
    setTrustScore(trust);
  };

  if (!reputation) {
    return (
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
        <p className="text-neutral-600 dark:text-neutral-400">Loading reputation data...</p>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'elite':
        return 'text-purple-500';
      case 'verified':
        return 'text-blue-500';
      case 'trusted':
        return 'text-green-500';
      default:
        return 'text-neutral-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-purple-500';
    if (score >= 500) return 'text-blue-500';
    if (score >= 250) return 'text-green-500';
    return 'text-neutral-500';
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
          Reputation Score
        </h2>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`text-5xl font-bold ${getScoreColor(reputation.reputationScore.score)}`}>
              {reputation.reputationScore.score}
            </div>
            <div className={`text-lg font-medium ${getLevelColor(reputation.reputationScore.level)} capitalize`}>
              {reputation.reputationScore.level}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Completion Rate
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {(reputation.reputationScore.completionRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {reputation.reputationScore.totalTransactions}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Transactions
            </div>
          </div>

          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {reputation.reputationScore.successfulTransactions}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Successful
            </div>
          </div>

          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="text-2xl font-bold text-red-500">
              {reputation.reputationScore.failedTransactions}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Failed
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-2">
            <span>Progress to Next Level</span>
            <span>{reputation.reputationScore.score}/1000</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(reputation.reputationScore.score / 1000) * 100}%` }}
            />
          </div>
        </div>

        {trustScore && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                Trust Score
              </span>
              <span className="text-2xl font-bold text-blue-500">
                {trustScore.score}/100
              </span>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
              Level: {trustScore.level.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>

      {badges.length > 0 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Badges
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.badgeId}
                className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-center"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {badge.name}
                </div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Verification Status
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              KYC Status
            </span>
            <span className={`text-sm font-medium ${
              reputation.kycStatus.status === 'approved' ? 'text-green-500' :
              reputation.kycStatus.status === 'pending' ? 'text-yellow-500' :
              'text-neutral-500'
            } capitalize`}>
              {reputation.kycStatus.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Document Verified
            </span>
            <span className={`text-sm font-medium ${
              reputation.kycStatus.documentVerified ? 'text-green-500' : 'text-neutral-500'
            }`}>
              {reputation.kycStatus.documentVerified ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Address Verified
            </span>
            <span className={`text-sm font-medium ${
              reputation.kycStatus.addressVerified ? 'text-green-500' : 'text-neutral-500'
            }`}>
              {reputation.kycStatus.addressVerified ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Face Verified
            </span>
            <span className={`text-sm font-medium ${
              reputation.kycStatus.faceVerified ? 'text-green-500' : 'text-neutral-500'
            }`}>
              {reputation.kycStatus.faceVerified ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
