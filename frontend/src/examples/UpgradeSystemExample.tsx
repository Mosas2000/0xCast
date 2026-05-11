import React, { useState, useEffect } from 'react';
import { useContractUpgrade } from '../hooks/useContractUpgrade';
import { useMigration } from '../hooks/useMigration';
import { useStateSnapshot } from '../hooks/useStateSnapshot';

const PROXY_CONTRACT = {
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  name: 'proxy-core',
};

const MIGRATION_CONTRACT = {
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  name: 'migration-manager',
};

const SNAPSHOT_CONTRACT = {
  address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  name: 'state-snapshot',
};

export function UpgradeSystemExample() {
  const upgrade = useContractUpgrade(PROXY_CONTRACT);
  const migration = useMigration(MIGRATION_CONTRACT);
  const snapshot = useStateSnapshot(SNAPSHOT_CONTRACT);

  const [currentVersion, setCurrentVersion] = useState(1);
  const [implementation, setImplementation] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const impl = await upgrade.getImplementation();
    setImplementation(impl);

    const version = await migration.getCurrentVersion();
    setCurrentVersion(version);
  };

  const handleCompleteUpgrade = async () => {
    try {
      const currentState = { version: currentVersion, data: {} };
      const stateHash = snapshot.generateStateHash(currentState);
      
      await snapshot.createSnapshot(
        stateHash,
        JSON.stringify(currentState).length,
        `Pre-upgrade snapshot v${currentVersion}`
      );

      const newVersion = currentVersion + 1;
      const migrationHash = new Uint8Array(32);
      
      await migration.registerMigration(
        newVersion,
        'Upgrade to add new features',
        migrationHash,
        1000,
        true
      );

      await upgrade.proposeUpgrade(
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.new-implementation'
      );

      console.log('Upgrade process initiated');
    } catch (error) {
      console.error('Upgrade failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upgrade System Example</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Version:</span> {currentVersion}
          </p>
          <p>
            <span className="font-medium">Implementation:</span>{' '}
            {implementation || 'Loading...'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-3">
          <button
            onClick={handleCompleteUpgrade}
            disabled={upgrade.isLoading || migration.isLoading || snapshot.isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Initiate Complete Upgrade
          </button>

          {(upgrade.error || migration.error || snapshot.error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {upgrade.error || migration.error || snapshot.error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upgrade Process</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Create state snapshot</li>
          <li>Register migration</li>
          <li>Propose upgrade</li>
          <li>Wait for timelock</li>
          <li>Execute upgrade</li>
          <li>Execute migration</li>
          <li>Verify state</li>
        </ol>
      </div>
    </div>
  );
}
