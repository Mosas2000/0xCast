import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringUtf8CV,
  bufferCV,
  boolCV,
  PostConditionMode,
  callReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';

export interface Migration {
  migrationId: number;
  version: number;
  description: string;
  executed: boolean;
  executedAt?: number;
  executedBy?: string;
  rollbackAvailable: boolean;
}

export interface MigrationData {
  dataHash: Uint8Array;
  dataSize: number;
}

export class MigrationService {
  private migrationContract: { address: string; name: string };
  private network: any;

  constructor(migrationContract: { address: string; name: string }, network?: any) {
    this.migrationContract = migrationContract;
    this.network = network;
  }

  async registerMigration(
    version: number,
    description: string,
    dataHash: Uint8Array,
    dataSize: number,
    rollbackAvailable: boolean,
    userAddress: string
  ): Promise<void> {
    await openContractCall({
      contractAddress: this.migrationContract.address,
      contractName: this.migrationContract.name,
      functionName: 'register-migration',
      functionArgs: [
        uintCV(version),
        stringUtf8CV(description),
        bufferCV(dataHash),
        uintCV(dataSize),
        boolCV(rollbackAvailable),
      ],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Migration registered:', data.txId);
      },
      onCancel: () => {
        console.log('Migration registration cancelled');
      },
    });
  }

  async executeMigration(migrationId: number, userAddress: string): Promise<void> {
    await openContractCall({
      contractAddress: this.migrationContract.address,
      contractName: this.migrationContract.name,
      functionName: 'execute-migration',
      functionArgs: [uintCV(migrationId)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Migration executed:', data.txId);
      },
      onCancel: () => {
        console.log('Migration execution cancelled');
      },
    });
  }

  async rollbackMigration(
    migrationId: number,
    targetVersion: number,
    userAddress: string
  ): Promise<void> {
    await openContractCall({
      contractAddress: this.migrationContract.address,
      contractName: this.migrationContract.name,
      functionName: 'rollback-migration',
      functionArgs: [uintCV(migrationId), uintCV(targetVersion)],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Migration rolled back:', data.txId);
      },
      onCancel: () => {
        console.log('Migration rollback cancelled');
      },
    });
  }

  async getCurrentVersion(): Promise<number> {
    try {
      const contractAddress = this.extractAddress(this.migrationContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.migrationContract.name,
        functionName: 'get-current-version',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && typeof response.value === 'object') {
        const value = cvToValue(response.value);
        return typeof value === 'number' ? value : 1;
      }
      return 1;
    } catch (error) {
      console.error('Failed to get current version:', error);
      return 1;
    }
  }

  private extractAddress(addressInput: string): string {
    if (addressInput.includes('.')) {
      return addressInput.split('.')[0];
    }
    return addressInput;
  }

  async getMigration(migrationId: number): Promise<Migration | null> {
    try {
      const contractAddress = this.extractAddress(this.migrationContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.migrationContract.name,
        functionName: 'get-migration',
        functionArgs: [uintCV(migrationId)],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && response.value) {
        const result = cvToValue(response.value);
        if (result && typeof result === 'object') {
          const migration = result as any;
          return {
            migrationId,
            version: migration.version || 0,
            description: migration.description || '',
            executed: migration.executed || false,
            executedAt: migration['executed-at'] || undefined,
            executedBy: migration['executed-by'] || undefined,
            rollbackAvailable: migration['rollback-available'] || false,
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Failed to get migration ${migrationId}:`, error);
      return null;
    }
  }

  async getMigrationData(migrationId: number): Promise<MigrationData | null> {
    return null;
  }

  async isMigrationExecuted(migrationId: number): Promise<boolean> {
    return false;
  }

  async getMigrationCount(): Promise<number> {
    return 0;
  }
}
