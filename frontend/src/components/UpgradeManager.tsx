import React, { useState, useEffect } from 'react';
import { useContractUpgrade } from '../hooks/useContractUpgrade';
import { UpgradeProposal } from '../services/ContractUpgradeService';

interface UpgradeManagerProps {
  proxyContract: { address: string; name: string };
}

export function UpgradeManager({ proxyContract }: UpgradeManagerProps) {
  const {
    proposeUpgrade,
    executeUpgrade,
    cancelUpgrade,
    setTimelock,
    getPendingUpgrade,
    getImplementation,
    isLoading,
    error,
  } = useContractUpgrade(proxyContract);

  const [newImplementation, setNewImplementation] = useState('');
  const [timelockBlocks, setTimelockBlocks] = useState(144);
  const [currentImplementation, setCurrentImplementation] = useState<string | null>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<UpgradeProposal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const impl = await getImplementation();
    setCurrentImplementation(impl);

    const pending = await getPendingUpgrade();
    setPendingUpgrade(pending);
  };

  const handleProposeUpgrade = async () => {
    if (!newImplementation) return;
    await proposeUpgrade(newImplementation);
    setNewImplementation('');
    await loadData();
  };

  const handleExecuteUpgrade = async () => {
    await executeUpgrade();
    await loadData();
  };

  const handleCancelUpgrade = async () => {
    await cancelUpgrade();
    await loadData();
  };

  const handleSetTimelock = async () => {
    await setTimelock(timelockBlocks);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Contract Upgrade Manager</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Implementation
            </label>
            <div className="bg-gray-50 p-3 rounded border">
              {currentImplementation || 'Loading...'}
            </div>
          </div>

          {pendingUpgrade && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <h3 className="font-semibold mb-2">Pending Upgrade</h3>
              <p className="text-sm mb-2">
                New Implementation: {pendingUpgrade.newImplementation}
              </p>
              <p className="text-sm mb-2">
                Proposed By: {pendingUpgrade.proposedBy}
              </p>
              <p className="text-sm mb-4">
                Timelock Expires: Block {pendingUpgrade.timelockExpires}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleExecuteUpgrade}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Execute Upgrade
                </button>
                <button
                  onClick={handleCancelUpgrade}
                  disabled={isLoading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Upgrade
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propose New Upgrade
            </label>
            <input
              type="text"
              value={newImplementation}
              onChange={(e) => setNewImplementation(e.target.value)}
              placeholder="New implementation address"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleProposeUpgrade}
              disabled={isLoading || !newImplementation}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Propose Upgrade
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upgrade Timelock (blocks)
            </label>
            <input
              type="number"
              value={timelockBlocks}
              onChange={(e) => setTimelockBlocks(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSetTimelock}
              disabled={isLoading}
              className="mt-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Update Timelock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
