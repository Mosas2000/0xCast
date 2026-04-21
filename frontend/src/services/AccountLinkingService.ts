import { LinkedAccount, AccountLinkRequest } from '@/types/reputation';

export class AccountLinkingService {
  private linkedAccounts: Map<string, LinkedAccount[]> = new Map();
  private linkRequests: Map<string, AccountLinkRequest> = new Map();
  private accountMap: Map<string, string> = new Map();

  createLinkRequest(userId: string, accountIdentifier: string, linkType: 'wallet' | 'email' | 'phone' | 'social'): AccountLinkRequest {
    const requestId = `link_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const linkRequest: AccountLinkRequest = {
      requestId,
      userId,
      accountIdentifier,
      linkType,
      status: 'pending',
      createdAt: Date.now(),
      verificationCode: this.generateVerificationCode(),
    };

    this.linkRequests.set(requestId, linkRequest);
    return linkRequest;
  }

  verifyLinkRequest(requestId: string, verificationCode: string): AccountLinkRequest {
    const request = this.linkRequests.get(requestId);
    if (!request) {
      throw new Error(`Link request ${requestId} not found`);
    }

    if (request.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }

    request.status = 'verified';
    this.linkRequests.set(requestId, request);

    const linkedAccount: LinkedAccount = {
      accountId: request.accountIdentifier,
      linkedUserId: request.userId,
      linkType: request.linkType,
      linkedAt: Date.now(),
      status: 'active',
    };

    if (!this.linkedAccounts.has(request.userId)) {
      this.linkedAccounts.set(request.userId, []);
    }

    this.linkedAccounts.get(request.userId)!.push(linkedAccount);
    this.accountMap.set(request.accountIdentifier, request.userId);

    return request;
  }

  linkAccount(userId: string, accountIdentifier: string, linkType: 'wallet' | 'email' | 'phone' | 'social'): LinkedAccount {
    const linkedAccount: LinkedAccount = {
      accountId: accountIdentifier,
      linkedUserId: userId,
      linkType,
      linkedAt: Date.now(),
      status: 'active',
    };

    if (!this.linkedAccounts.has(userId)) {
      this.linkedAccounts.set(userId, []);
    }

    this.linkedAccounts.get(userId)!.push(linkedAccount);
    this.accountMap.set(accountIdentifier, userId);

    return linkedAccount;
  }

  unlinkAccount(userId: string, accountIdentifier: string): boolean {
    const accounts = this.linkedAccounts.get(userId);
    if (!accounts) return false;

    const index = accounts.findIndex(acc => acc.accountId === accountIdentifier);
    if (index === -1) return false;

    accounts.splice(index, 1);
    this.accountMap.delete(accountIdentifier);

    return true;
  }

  getLinkedAccounts(userId: string): LinkedAccount[] {
    return this.linkedAccounts.get(userId) || [];
  }

  findUserByAccount(accountIdentifier: string): string | undefined {
    return this.accountMap.get(accountIdentifier);
  }

  markAccountSuspicious(accountIdentifier: string): LinkedAccount | undefined {
    const userId = this.accountMap.get(accountIdentifier);
    if (!userId) return undefined;

    const accounts = this.linkedAccounts.get(userId);
    if (!accounts) return undefined;

    const account = accounts.find(acc => acc.accountId === accountIdentifier);
    if (account) {
      account.status = 'suspicious';
    }

    return account;
  }

  getLinkedAccountsByType(userId: string, linkType: 'wallet' | 'email' | 'phone' | 'social'): LinkedAccount[] {
    const accounts = this.linkedAccounts.get(userId) || [];
    return accounts.filter(acc => acc.linkType === linkType);
  }

  findDuplicateAccounts(accountIdentifier: string): string[] {
    const currentUserId = this.accountMap.get(accountIdentifier);
    if (!currentUserId) return [];

    const duplicates: string[] = [];

    for (const [id, userId] of this.accountMap.entries()) {
      if (id !== accountIdentifier && userId === currentUserId) {
        duplicates.push(id);
      }
    }

    return duplicates;
  }

  getLinkRequest(requestId: string): AccountLinkRequest | undefined {
    return this.linkRequests.get(requestId);
  }

  getLinkRequestsByUser(userId: string): AccountLinkRequest[] {
    return Array.from(this.linkRequests.values()).filter(req => req.userId === userId);
  }

  rejectLinkRequest(requestId: string): AccountLinkRequest {
    const request = this.linkRequests.get(requestId);
    if (!request) {
      throw new Error(`Link request ${requestId} not found`);
    }

    request.status = 'rejected';
    this.linkRequests.set(requestId, request);

    return request;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  getAllLinkedAccounts(): LinkedAccount[] {
    const all: LinkedAccount[] = [];
    for (const accounts of this.linkedAccounts.values()) {
      all.push(...accounts);
    }
    return all;
  }

  getAccountStats(): { totalUsers: number; totalAccounts: number; accountsPerUser: number } {
    const totalUsers = this.linkedAccounts.size;
    const totalAccounts = this.accountMap.size;
    const accountsPerUser = totalUsers > 0 ? totalAccounts / totalUsers : 0;

    return {
      totalUsers,
      totalAccounts,
      accountsPerUser: Math.round(accountsPerUser * 100) / 100,
    };
  }
}
