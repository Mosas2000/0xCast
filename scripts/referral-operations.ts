import { ClarineSDK, ClarityValue, principalCV, contractPrincipalCV, stringAsciiCV, uintCV, boolCV } from "@hirosystems/clarinet-sdk";
import * as fs from "fs";

interface ReferralConfig {
  contractAddress: string;
  network: string;
}

interface ReferralOperation {
  type: "generate-code" | "register" | "record-reward" | "claim-rewards" | "validate";
  user: string;
  data?: any;
}

class ReferralOperations {
  private clarinet: ClarineSDK;
  private config: ReferralConfig;

  constructor(config: ReferralConfig) {
    this.config = config;
    this.clarinet = new ClarineSDK();
  }

  async generateReferralCode(userAddress: string): Promise<string> {
    console.log(`Generating referral code for ${userAddress}`);

    try {
      const result = await this.clarinet.callPublicFn(
        this.config.contractAddress,
        "generate-referral-code",
        [],
        { from: userAddress }
      );

      if (result.success) {
        console.log(`Successfully generated referral code: ${result.data}`);
        return result.data;
      } else {
        throw new Error(`Failed to generate code: ${result.error}`);
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
      throw error;
    }
  }

  async registerWithCode(userAddress: string, referralCode: string): Promise<boolean> {
    console.log(`Registering ${userAddress} with code ${referralCode}`);

    try {
      const result = await this.clarinet.callPublicFn(
        this.config.contractAddress,
        "register-referral-with-code",
        [stringAsciiCV(referralCode)],
        { from: userAddress }
      );

      if (result.success) {
        console.log(`Successfully registered referral`);
        return true;
      } else {
        throw new Error(`Failed to register: ${result.error}`);
      }
    } catch (error) {
      console.error("Error registering with code:", error);
      throw error;
    }
  }

  async recordReward(
    referrerAddress: string,
    referredUserAddress: string,
    actionAmount: number,
    actionType: string,
    ownerAddress: string
  ): Promise<boolean> {
    console.log(
      `Recording reward for ${referrerAddress} from user ${referredUserAddress}`
    );

    try {
      const result = await this.clarinet.callPublicFn(
        this.config.contractAddress,
        "record-referral-reward",
        [
          principalCV(referrerAddress),
          principalCV(referredUserAddress),
          uintCV(actionAmount),
          stringAsciiCV(actionType),
        ],
        { from: ownerAddress }
      );

      if (result.success) {
        console.log(`Successfully recorded reward`);
        return true;
      } else {
        throw new Error(`Failed to record reward: ${result.error}`);
      }
    } catch (error) {
      console.error("Error recording reward:", error);
      throw error;
    }
  }

  async claimRewards(userAddress: string): Promise<number> {
    console.log(`Claiming rewards for ${userAddress}`);

    try {
      const result = await this.clarinet.callPublicFn(
        this.config.contractAddress,
        "claim-referral-rewards",
        [],
        { from: userAddress }
      );

      if (result.success) {
        const rewardAmount = result.data;
        console.log(`Successfully claimed ${rewardAmount} rewards`);
        return rewardAmount;
      } else {
        throw new Error(`Failed to claim rewards: ${result.error}`);
      }
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw error;
    }
  }

  async getAffiliateStats(userAddress: string): Promise<any> {
    console.log(`Fetching affiliate stats for ${userAddress}`);

    try {
      const result = await this.clarinet.callReadOnlyFn(
        this.config.contractAddress,
        "get-affiliate-stats",
        [principalCV(userAddress)],
        { from: userAddress }
      );

      if (result.success) {
        console.log(`Retrieved affiliate stats`);
        return result.data;
      } else {
        throw new Error(`Failed to get stats: ${result.error}`);
      }
    } catch (error) {
      console.error("Error getting affiliate stats:", error);
      throw error;
    }
  }

  async getReferralInfo(userAddress: string): Promise<any> {
    console.log(`Fetching referral info for ${userAddress}`);

    try {
      const result = await this.clarinet.callReadOnlyFn(
        this.config.contractAddress,
        "get-user-referral-info",
        [principalCV(userAddress)],
        { from: userAddress }
      );

      if (result.success) {
        console.log(`Retrieved referral info`);
        return result.data;
      } else {
        throw new Error(`Failed to get referral info: ${result.error}`);
      }
    } catch (error) {
      console.error("Error getting referral info:", error);
      throw error;
    }
  }

  async validateReferral(referralCode: string, userAddress: string): Promise<boolean> {
    console.log(`Validating referral code ${referralCode} for ${userAddress}`);

    try {
      const result = await this.clarinet.callReadOnlyFn(
        this.config.contractAddress,
        "validate-referral",
        [stringAsciiCV(referralCode), principalCV(userAddress)],
        { from: userAddress }
      );

      if (result.success) {
        console.log(`Referral code is valid`);
        return true;
      } else {
        console.log(`Referral code validation failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error validating referral:", error);
      throw error;
    }
  }

  async getTotalReferrals(): Promise<number> {
    console.log(`Fetching total referrals count`);

    try {
      const result = await this.clarinet.callReadOnlyFn(
        this.config.contractAddress,
        "get-total-referrals",
        [],
        { from: this.config.contractAddress }
      );

      if (result.success) {
        console.log(`Total referrals: ${result.data}`);
        return result.data;
      } else {
        throw new Error(`Failed to get total referrals: ${result.error}`);
      }
    } catch (error) {
      console.error("Error getting total referrals:", error);
      throw error;
    }
  }

  async getTotalDistributed(): Promise<number> {
    console.log(`Fetching total rewards distributed`);

    try {
      const result = await this.clarinet.callReadOnlyFn(
        this.config.contractAddress,
        "get-total-distributed",
        [],
        { from: this.config.contractAddress }
      );

      if (result.success) {
        console.log(`Total distributed: ${result.data}`);
        return result.data;
      } else {
        throw new Error(`Failed to get total distributed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error getting total distributed:", error);
      throw error;
    }
  }

  async deactivateCode(referralCode: string, ownerAddress: string): Promise<boolean> {
    console.log(`Deactivating referral code ${referralCode}`);

    try {
      const result = await this.clarinet.callPublicFn(
        this.config.contractAddress,
        "deactivate-code",
        [stringAsciiCV(referralCode)],
        { from: ownerAddress }
      );

      if (result.success) {
        console.log(`Successfully deactivated code`);
        return true;
      } else {
        throw new Error(`Failed to deactivate code: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deactivating code:", error);
      throw error;
    }
  }

  async processBatchRewards(
    rewards: Array<{ referrer: string; referredUser: string; amount: number; actionType: string }>,
    ownerAddress: string
  ): Promise<void> {
    console.log(`Processing batch rewards for ${rewards.length} transactions`);

    for (const reward of rewards) {
      try {
        await this.recordReward(
          reward.referrer,
          reward.referredUser,
          reward.amount,
          reward.actionType,
          ownerAddress
        );
      } catch (error) {
        console.error(`Failed to process reward for ${reward.referrer}:`, error);
      }
    }

    console.log(`Batch rewards processing complete`);
  }

  async exportAffiliateReport(): Promise<void> {
    console.log(`Generating affiliate report`);

    const report = {
      timestamp: new Date().toISOString(),
      totalReferrals: await this.getTotalReferrals(),
      totalDistributed: await this.getTotalDistributed(),
      exportedAt: new Date(),
    };

    const fileName = `affiliate-report-${Date.now()}.json`;
    fs.writeFileSync(fileName, JSON.stringify(report, null, 2));
    console.log(`Report exported to ${fileName}`);
  }
}

async function main() {
  const config: ReferralConfig = {
    contractAddress: "ST1NQE83F536G9Z8NN8DFY3N7RGQS14N5R5DCB0PM.referral-core",
    network: "mainnet",
  };

  const referralOps = new ReferralOperations(config);

  console.log("Starting referral operations script");

  try {
    const stats = await referralOps.getTotalReferrals();
    console.log(`Current total referrals: ${stats}`);

    const distributed = await referralOps.getTotalDistributed();
    console.log(`Total rewards distributed: ${distributed}`);
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { ReferralOperations, ReferralConfig, ReferralOperation };
