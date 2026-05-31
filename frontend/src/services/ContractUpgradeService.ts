import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  principalCV,
  bufferCV,
  stringUtf8CV,
  PostConditionMode,
  callReadOnlyFunction,
  cvToValue,
} from '@stacks/transactions';

export interface UpgradeProposal {
  newImplementation: string;
  proposedAt: number;
  proposedBy: string;
  timelockExpires: number;
}

export interface UpgradeHistory {
  upgradeId: number;
  fromImplementation: string;
  toImplementation: string;
  upgradedAt: number;
  upgradedBy: string;
}

export class ContractUpgradeService {
  private proxyContract: { address: string; name: string };
  private network: any;

  constructor(proxyContract: { address: string; name: string }, network?: any) {
    this.proxyContract = proxyContract;
    this.network = network;
  }

  async proposeUpgrade(newImplementation: string, userAddress: string): Promise<void> {
    await openContractCall({
      contractAddress: this.proxyContract.address,
      contractName: this.proxyContract.name,
      functionName: 'propose-upgrade',
      functionArgs: [principalCV(newImplementation)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Upgrade proposed:', data.txId);
      },
      onCancel: () => {
        console.log('Upgrade proposal cancelled');
      },
    });
  }

  async executeUpgrade(userAddress: string): Promise<void> {
    await openContractCall({
      contractAddress: this.proxyContract.address,
      contractName: this.proxyContract.name,
      functionName: 'execute-upgrade',
      functionArgs: [],
      postConditionMode: PostConditionMode.Allow,
      onFinish: (data) => {
        console.log('Upgrade executed:', data.txId);
      },
      onCancel: () => {
        console.log('Upgrade execution cancelled');
      },
    });
  }

  async cancelUpgrade(userAddress: string): Promise<void> {
    await openContractCall({
      contractAddress: this.proxyContract.address,
      contractName: this.proxyContract.name,
      functionName: 'cancel-upgrade',
      functionArgs: [],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Upgrade cancelled:', data.txId);
      },
      onCancel: () => {
        console.log('Upgrade cancellation cancelled');
      },
    });
  }

  async setUpgradeTimelock(blocks: number, userAddress: string): Promise<void> {
    await openContractCall({
      contractAddress: this.proxyContract.address,
      contractName: this.proxyContract.name,
      functionName: 'set-upgrade-timelock',
      functionArgs: [uintCV(blocks)],
      postConditionMode: PostConditionMode.Deny,
      onFinish: (data) => {
        console.log('Timelock updated:', data.txId);
      },
      onCancel: () => {
        console.log('Timelock update cancelled');
      },
    });
  }

  async getImplementation(): Promise<string | null> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-implementation',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && response.value) {
        const value = cvToValue(response.value);
        return typeof value === 'string' ? value : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get implementation:', error);
      return null;
    }
  }

  private extractAddress(addressInput: string): string {
    if (addressInput.includes('.')) {
      return addressInput.split('.')[0];
    }
    return addressInput;
  }

  async getPendingUpgrade(): Promise<UpgradeProposal | null> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-pending-implementation',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && response.value) {
        const result = cvToValue(response.value);
        if (result && typeof result === 'object') {
          return {
            newImplementation: result as string,
            proposedAt: 0,
            proposedBy: '',
            timelockExpires: 0,
          };
        }
        if (result === null) {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to get pending upgrade:', error);
      return null;
    }
  }

  async getUpgradeHistory(upgradeId: number): Promise<UpgradeHistory | null> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-upgrade-history',
        functionArgs: [uintCV(upgradeId)],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && response.value) {
        const result = cvToValue(response.value);
        if (result && typeof result === 'object') {
          const history = result as any;
          return {
            upgradeId,
            fromImplementation: history['from-implementation'] || '',
            toImplementation: history['to-implementation'] || '',
            upgradedAt: history['upgraded-at'] || 0,
            upgradedBy: history['upgraded-by'] || '',
          };
        }
      }
      return null;
    } catch (error) {
      console.error(`Failed to get upgrade history ${upgradeId}:`, error);
      return null;
    }
  }

  async getUpgradeCount(): Promise<number> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-upgrade-count',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && typeof response.value === 'object') {
        const value = cvToValue(response.value);
        return typeof value === 'number' ? value : 0;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get upgrade count:', error);
      return 0;
    }
  }

  async getUpgradeTimelock(): Promise<number | null> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-upgrade-timelock',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && typeof response.value === 'object') {
        const value = cvToValue(response.value);
        return typeof value === 'number' ? value : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get upgrade timelock:', error);
      return null;
    }
  }

  async getOwner(): Promise<string | null> {
    try {
      const contractAddress = this.extractAddress(this.proxyContract.address);
      const response = await callReadOnlyFunction({
        contractAddress,
        contractName: this.proxyContract.name,
        functionName: 'get-owner',
        functionArgs: [],
        network: this.network,
        senderAddress: contractAddress,
      });

      if (response.ok && response.value) {
        const value = cvToValue(response.value);
        return typeof value === 'string' ? value : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get owner:', error);
      return null;
    }
  }

  async isUpgradePending(): Promise<boolean> {
    const pending = await this.getPendingUpgrade();
    return pending !== null;
  }

  async canExecuteUpgrade(): Promise<boolean> {
    const pending = await this.getPendingUpgrade();
    if (!pending) {
      return false;
    }

    const timelock = await this.getUpgradeTimelock();
    if (timelock === null) {
      return false;
    }

    return true;
  }

  async getUpgradeHistoryBatch(startId: number, count: number): Promise<(UpgradeHistory | null)[]> {
    const results: (UpgradeHistory | null)[] = [];
    for (let i = startId; i < startId + count; i++) {
      const history = await this.getUpgradeHistory(i);
      results.push(history);
    }
    return results;
  }

  async validateImplementationAddress(address: string): Promise<boolean> {
    if (!address || typeof address !== 'string') {
      return false;
    }

    const principalRegex = /^(ST|SM)[A-Z0-9]+$/i;
    return principalRegex.test(address);
  }

  async compareImplementations(): Promise<{
    current: string | null;
    pending: UpgradeProposal | null;
    same: boolean;
  }> {
    const current = await this.getImplementation();
    const pending = await this.getPendingUpgrade();

    return {
      current,
      pending,
      same: current === pending?.newImplementation,
    };
  }

  async getUpgradeMetadata(): Promise<{
    owner: string | null;
    current: string | null;
    pending: UpgradeProposal | null;
    timelock: number | null;
    count: number;
  }> {
    const [owner, current, pending, timelock, count] = await Promise.all([
      this.getOwner(),
      this.getImplementation(),
      this.getPendingUpgrade(),
      this.getUpgradeTimelock(),
      this.getUpgradeCount(),
    ]);

    return {
      owner,
      current,
      pending,
      timelock,
      count,
    };
  }

  private extractAddress(addressInput: string): string {
    if (addressInput.includes('.')) {
      return addressInput.split('.')[0];
    }
    return addressInput;
  }
}
