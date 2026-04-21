import React from 'react';
import { ReputationManager } from '../services/ReputationManager';
import { reputationAnalytics } from '../utils/reputationAnalytics';
import {
  calculateTrustScore,
  getReputationColor,
  getReputationDescription,
} from '../utils/reputationUtils';

const manager = ReputationManager.getInstance();

export const ReputationSystemExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Reputation System Examples</h1>

      <ExampleBasicReputation />
      <ExampleKYCFlow />
      <ExampleFraudDetection />
      <ExampleAccountLinking />
      <ExampleAnalytics />
      <ExampleTrustCalculation />
    </div>
  );
};

const ExampleBasicReputation: React.FC = () => {
  const example = () => {
    manager.createUserReputation('example_user1');

    manager.updateReputationScore('example_user1', {
      completionRate: 0.95,
      transactionVolume: 50,
      averageResponseTime: 2,
      accountAgeDays: 180,
      verificationLevel: 'level2',
    });

    const reputation = manager.getUserReputation('example_user1');
    console.log('User Reputation:', reputation);

    return reputation;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 1: Basic Reputation Update</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`const manager = ReputationManager.getInstance();

manager.createUserReputation('user1');

manager.updateReputationScore('user1', {
  completionRate: 0.95,
  transactionVolume: 50,
  averageResponseTime: 2,
  accountAgeDays: 180,
  verificationLevel: 'level2',
});

const reputation = manager.getUserReputation('user1');
// Returns ReputationScore with calculated score and level

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};

const ExampleKYCFlow: React.FC = () => {
  const example = () => {
    manager.createUserReputation('example_user2');

    manager.submitKYC('example_user2', {
      firstName: 'Jane',
      lastName: 'Smith',
      documentType: 'drivers_license',
      documentId: 'DL123456',
      dateOfBirth: '1988-05-15',
    });

    manager.submitKYC('example_user2', {
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      postalCode: '94102',
    });

    manager.submitKYC('example_user2', {
      faceImageHash: 'img_hash_789',
      livenessScore: 0.97,
    });

    manager.approveKYC('example_user2');

    const reputation = manager.getUserReputation('example_user2');
    return reputation?.kycStatus;
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 2: KYC Verification Flow</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`const manager = ReputationManager.getInstance();

manager.createUserReputation('user2');

// Step 1: Submit document verification
manager.submitKYC('user2', {
  firstName: 'Jane',
  lastName: 'Smith',
  documentType: 'drivers_license',
  documentId: 'DL123456',
  dateOfBirth: '1988-05-15',
});

// Step 2: Submit address verification
manager.submitKYC('user2', {
  address: '456 Oak Avenue',
  city: 'San Francisco',
  state: 'CA',
  country: 'USA',
  postalCode: '94102',
});

// Step 3: Submit face verification
manager.submitKYC('user2', {
  faceImageHash: 'img_hash_789',
  livenessScore: 0.97,
});

// Step 4: Approve KYC
manager.approveKYC('user2');

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};

const ExampleFraudDetection: React.FC = () => {
  const example = () => {
    manager.createUserReputation('example_user3');

    const washTradeAlert = manager.checkFraudAlert('example_user3', 'wash_trading', [
      {
        price: 100,
        amount: 1000,
        timestamp: Date.now(),
        type: 'sell',
      },
      {
        price: 100,
        amount: 950,
        timestamp: Date.now() + 30000,
        type: 'buy',
      },
    ]);

    const reputation = manager.getUserReputation('example_user3');
    return {
      alert: washTradeAlert,
      isSuspicious: reputation?.isSuspicious,
      fraudAlerts: manager.getFraudAlerts('example_user3').length,
    };
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 3: Fraud Detection</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`const manager = ReputationManager.getInstance();

manager.createUserReputation('user3');

// Check for wash trading pattern
const alert = manager.checkFraudAlert('user3', 'wash_trading', [
  {
    price: 100,
    amount: 1000,
    timestamp: Date.now(),
    type: 'sell',
  },
  {
    price: 100,
    amount: 950,
    timestamp: Date.now() + 30000,
    type: 'buy',
  },
]);

// User marked as suspicious
const reputation = manager.getUserReputation('user3');

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};

const ExampleAccountLinking: React.FC = () => {
  const example = () => {
    manager.createUserReputation('example_user4');

    const emailLink = manager.linkAccount('example_user4', 'email', 'user@example.com');
    const verified = manager.verifyLinkedAccount(emailLink.id, emailLink.verificationCode);

    const reputation = manager.getUserReputation('example_user4');
    return {
      linkRequest: {
        type: emailLink.type,
        value: emailLink.value,
        status: 'verified',
      },
      linkedAccountsCount: reputation?.linkedAccounts.length,
    };
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 4: Account Linking</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`const manager = ReputationManager.getInstance();

manager.createUserReputation('user4');

// Request email linking
const linkRequest = manager.linkAccount(
  'user4',
  'email',
  'user@example.com'
);

// Verify with code
const verified = manager.verifyLinkedAccount(
  linkRequest.id,
  linkRequest.verificationCode
);

// User can now link multiple accounts
const reputation = manager.getUserReputation('user4');

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};

const ExampleAnalytics: React.FC = () => {
  const example = () => {
    for (let i = 0; i < 5; i++) {
      manager.createUserReputation(`example_user_${i}`);

      manager.updateReputationScore(`example_user_${i}`, {
        completionRate: 0.8 + Math.random() * 0.2,
        transactionVolume: Math.floor(30 + Math.random() * 70),
        averageResponseTime: 2 + Math.random() * 4,
        accountAgeDays: Math.floor(30 + Math.random() * 300),
        verificationLevel: i % 2 === 0 ? 'level3' : 'level1',
      });
    }

    const distribution = manager.getReputationDistribution();
    const metrics = manager.getSystemMetrics();

    return {
      distribution,
      averageScore: metrics.averageScore.toFixed(2),
      verifiedUsers: metrics.verifiedUsers,
    };
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 5: Analytics</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`const manager = ReputationManager.getInstance();

// Create multiple users and update scores
for (let i = 0; i < 5; i++) {
  manager.createUserReputation(\`user_\${i}\`);

  manager.updateReputationScore(\`user_\${i}\`, {
    completionRate: 0.8 + Math.random() * 0.2,
    transactionVolume: Math.floor(30 + Math.random() * 70),
    averageResponseTime: 2 + Math.random() * 4,
    accountAgeDays: Math.floor(30 + Math.random() * 300),
    verificationLevel: i % 2 === 0 ? 'level3' : 'level1',
  });
}

// Get analytics
const distribution = manager.getReputationDistribution();
const metrics = manager.getSystemMetrics();

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};

const ExampleTrustCalculation: React.FC = () => {
  const example = () => {
    const trustScore1 = calculateTrustScore(
      75,
      'level3',
      180,
      0
    );

    const trustScore2 = calculateTrustScore(
      75,
      'level3',
      180,
      3
    );

    return {
      cleanUser: trustScore1.toFixed(2),
      userWithAlerts: trustScore2.toFixed(2),
      difference: (trustScore1 - trustScore2).toFixed(2),
    };
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Example 6: Trust Score Calculation</h2>
      <pre className="bg-white p-3 rounded overflow-auto text-sm">
        {`import { calculateTrustScore } from '../utils/reputationUtils';

// Calculate trust score for clean user
const trustScore = calculateTrustScore(
  75,           // Reputation score
  'level3',     // KYC level
  180,          // Account age in days
  0             // Fraud alert count
);

// Calculate trust score for user with alerts
const trustScoreWithAlerts = calculateTrustScore(
  75,
  'level3',
  180,
  3  // User has 3 unresolved fraud alerts
);

Result: ${JSON.stringify(example(), null, 2)}`}
      </pre>
    </div>
  );
};
