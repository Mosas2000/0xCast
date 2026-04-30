import { describe, expect, it, beforeEach } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const user1 = accounts.get('wallet_1')!;
const user2 = accounts.get('wallet_2')!;

describe('Rate Limiter Contract', () => {
  beforeEach(() => {
    simnet.setEpoch('3.0');
  });

  describe('Configuration', () => {
    it('should have default configs for all actions', () => {
      const stakeConfig = simnet.callReadOnlyFn(
        'rate-limiter',
        'get-config',
        [Cl.stringAscii('stake')],
        deployer
      );

      expect(stakeConfig.result).toHaveClarityType(ClarityType.OptionalSome);
      const config = stakeConfig.result.value.data;
      expect(config['max-requests']).toBeUint(10);
      expect(config['window-blocks']).toBeUint(6);
      expect(config['cooldown-blocks']).toBeUint(1);
    });

    it('should allow owner to update config', () => {
      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'set-config',
        [
          Cl.stringAscii('stake'),
          Cl.uint(20),
          Cl.uint(12),
          Cl.uint(2),
        ],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const config = simnet.callReadOnlyFn(
        'rate-limiter',
        'get-config',
        [Cl.stringAscii('stake')],
        deployer
      );

      const configData = config.result.value.data;
      expect(configData['max-requests']).toBeUint(20);
    });

    it('should reject config update from non-owner', () => {
      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'set-config',
        [
          Cl.stringAscii('stake'),
          Cl.uint(20),
          Cl.uint(12),
          Cl.uint(2),
        ],
        user1
      );

      expect(result).toBeErr(Cl.uint(1002));
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const { result: result1 } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(result1).toBeOk(Cl.bool(true));

      const { result: result2 } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(result2).toBeOk(Cl.bool(true));
    });

    it('should block after exceeding limit', () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(result).toBeErr(Cl.uint(1001));
    });

    it('should track limits per user', () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user2
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should track limits per action', () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('trade')],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should reset after window expires', () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      simnet.mineEmptyBlocks(7);

      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it('should enforce cooldown period', () => {
      for (let i = 0; i < 11; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const { result: blockedResult } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(blockedResult).toBeErr(Cl.uint(1001));

      simnet.mineEmptyBlock();

      const { result: afterCooldown } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(afterCooldown).toBeErr(Cl.uint(1001));
    });
  });

  describe('Read Functions', () => {
    it('should return correct remaining count', () => {
      simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      const remaining = simnet.callReadOnlyFn(
        'rate-limiter',
        'get-remaining',
        [Cl.principal(user1), Cl.stringAscii('stake')],
        user1
      );

      expect(remaining.result).toBeOk(Cl.uint(8));
    });

    it('should detect blocked status', () => {
      for (let i = 0; i < 11; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const blocked = simnet.callReadOnlyFn(
        'rate-limiter',
        'is-blocked',
        [Cl.principal(user1), Cl.stringAscii('stake')],
        user1
      );

      expect(blocked.result).toBeBool(true);
    });
  });

  describe('Admin Functions', () => {
    it('should allow owner to reset user limit', () => {
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          'rate-limiter',
          'check-and-record',
          [Cl.stringAscii('stake')],
          user1
        );
      }

      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'reset-user-limit',
        [Cl.principal(user1), Cl.stringAscii('stake')],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const remaining = simnet.callReadOnlyFn(
        'rate-limiter',
        'get-remaining',
        [Cl.principal(user1), Cl.stringAscii('stake')],
        user1
      );

      expect(remaining.result).toBeOk(Cl.uint(10));
    });

    it('should allow owner to pause contract', () => {
      const { result } = simnet.callPublicFn(
        'rate-limiter',
        'set-paused',
        [Cl.bool(true)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const { result: checkResult } = simnet.callPublicFn(
        'rate-limiter',
        'check-and-record',
        [Cl.stringAscii('stake')],
        user1
      );

      expect(checkResult).toBeErr(Cl.uint(1002));
    });
  });
});
