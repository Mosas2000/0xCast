import React, { useReducer, useEffect } from 'react';
import { useContractUpgrade } from '@/hooks/useContractUpgrade';
import { UpgradeProposal } from '@/services/ContractUpgradeService';

interface UpgradeManagerProps {
  proxyContract: { address: string; name: string };
}

interface UpgradeState {
  newImplementation: string;
  timelockBlocks: number;
  currentImplementation: string | null;
  pendingUpgrade: UpgradeProposal | null;
}

type UpgradeAction =
  | { type: 'SET_NEW_IMPLEMENTATION'; payload: string }
  | { type: 'SET_TIMELOCK_BLOCKS'; payload: number }
  | { type: 'SET_CURRENT_IMPLEMENTATION'; payload: string | null }
  | { type: 'SET_PENDING_UPGRADE'; payload: UpgradeProposal | null }
  | { type: 'RESET_NEW_IMPLEMENTATION' }
  | { type: 'LOAD_DATA'; payload: { implementation: string | null; pending: UpgradeProposal | null } };

const initialState: UpgradeState = {
  newImplementation: '',
  timelockBlocks: 144,
  currentImplementation: null,
  pendingUpgrade: null,
};

function upgradeReducer(state: UpgradeState, action: UpgradeAction): UpgradeState {
  switch (action.type) {
    case 'SET_NEW_IMPLEMENTATION':
      return { ...state, newImplementation: action.payload };
    case 'SET_TIMELOCK_BLOCKS':
      return { ...state, timelockBlocks: action.payload };
    case 'SET_CURRENT_IMPLEMENTATION':
      return { ...state, currentImplementation: action.payload };
    case 'SET_PENDING_UPGRADE':
      return { ...state, pendingUpgrade: action.payload };
    case 'RESET_NEW_IMPLEMENTATION':
      return { ...state, newImplementation: '' };
    case 'LOAD_DATA':
      return {
        ...state,
        currentImplementation: action.payload.implementation,
        pendingUpgrade: action.payload.pending,
      };
    default:
      return state;
  }
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

  const [state, dispatch] = useReducer(upgradeReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const impl = await getImplementation();
    const pending = await getPendingUpgrade();
    dispatch({ type: 'LOAD_DATA', payload: { implementation: impl, pending } });
  };

  const handleProposeUpgrade = async () => {
    if (!state.newImplementation) return;
    await proposeUpgrade(state.newImplementation);
    dispatch({ type: 'RESET_NEW_IMPLEMENTATION' });
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
    await setTimelock(state.timelockBlocks);
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
              {state.currentImplementation || 'Loading...'}
            </div>
          </div>

          {state.pendingUpgrade && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <h3 className="font-semibold mb-2">Pending Upgrade</h3>
              <p className="text-sm mb-2">
                New Implementation: {state.pendingUpgrade.newImplementation}
              </p>
              <p className="text-sm mb-2">
                Proposed By: {state.pendingUpgrade.proposedBy}
              </p>
              <p className="text-sm mb-4">
                Timelock Expires: Block {state.pendingUpgrade.timelockExpires}
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
              value={state.newImplementation}
              onChange={(e) => dispatch({ type: 'SET_NEW_IMPLEMENTATION', payload: e.target.value })}
              placeholder="New implementation address"
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleProposeUpgrade}
              disabled={isLoading || !state.newImplementation}
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
              value={state.timelockBlocks}
              onChange={(e) => dispatch({ type: 'SET_TIMELOCK_BLOCKS', payload: Number(e.target.value) })}
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
