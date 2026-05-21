import React, { useState, useEffect } from 'react';
import { useMigration } from '@/hooks/useMigration';
import { Migration } from '@/services/MigrationService';

interface MigrationManagerProps {
  migrationContract: { address: string; name: string };
}

export function MigrationManager({ migrationContract }: MigrationManagerProps) {
  const {
    registerMigration,
    executeMigration,
    rollbackMigration,
    getCurrentVersion,
    getMigration,
    isLoading,
    error,
  } = useMigration(migrationContract);

  const [currentVersion, setCurrentVersion] = useState(0);
  const [newVersion, setNewVersion] = useState(0);
  const [description, setDescription] = useState('');
  const [rollbackAvailable, setRollbackAvailable] = useState(true);
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [selectedMigration, setSelectedMigration] = useState<number | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const version = await getCurrentVersion();
    setCurrentVersion(version);
  };

  const handleRegisterMigration = async () => {
    if (!description || newVersion <= currentVersion) return;

    const dataHash = new Uint8Array(32);
    const dataSize = 1000;

    await registerMigration(newVersion, description, dataHash, dataSize, rollbackAvailable);
    setDescription('');
    setNewVersion(0);
    await loadData();
  };

  const handleExecuteMigration = async (migrationId: number) => {
    await executeMigration(migrationId);
    await loadData();
  };

  const handleRollbackMigration = async () => {
    if (selectedMigration === null) return;
    await rollbackMigration(selectedMigration, rollbackVersion);
    await loadData();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Migration Manager</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Version
            </label>
            <div className="bg-gray-50 p-3 rounded border text-lg font-semibold">
              v{currentVersion}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Register New Migration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Version
                </label>
                <input
                  type="number"
                  value={newVersion}
                  onChange={(e) => setNewVersion(Number(e.target.value))}
                  placeholder="e.g., 2"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the migration changes"
                  rows={3}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rollbackAvailable}
                  onChange={(e) => setRollbackAvailable(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">
                  Rollback Available
                </label>
              </div>

              <button
                onClick={handleRegisterMigration}
                disabled={isLoading || !description || newVersion <= currentVersion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Register Migration
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Rollback Migration</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Migration ID
                </label>
                <input
                  type="number"
                  value={selectedMigration || ''}
                  onChange={(e) => setSelectedMigration(Number(e.target.value))}
                  placeholder="Migration ID"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Version
                </label>
                <input
                  type="number"
                  value={rollbackVersion}
                  onChange={(e) => setRollbackVersion(Number(e.target.value))}
                  placeholder="Version to rollback to"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleRollbackMigration}
                disabled={isLoading || selectedMigration === null}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                Rollback Migration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
