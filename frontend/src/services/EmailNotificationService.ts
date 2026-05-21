import type { EmailNotificationPayload } from '@/types/notifications';

export class EmailNotificationService {
  static async sendEmail(payload: EmailNotificationPayload): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  static async sendBulkEmails(
    payloads: EmailNotificationPayload[]
  ): Promise<number> {
    let successCount = 0;

    for (const payload of payloads) {
      const success = await this.sendEmail(payload);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  }

  static async sendPriceMovementAlert(
    email: string,
    marketName: string,
    currentPrice: number,
    previousPrice: number,
    change: number
  ): Promise<boolean> {
    const changeDirection = change > 0 ? 'increased' : 'decreased';
    const changePercent = Math.abs(
      ((change / previousPrice) * 100).toFixed(2)
    );

    const htmlBody = `
      <h2>Price Movement Alert: ${marketName}</h2>
      <p>The price for <strong>${marketName}</strong> has ${changeDirection}.</p>
      <ul>
        <li>Previous Price: ${previousPrice}</li>
        <li>Current Price: ${currentPrice}</li>
        <li>Change: ${change > 0 ? '+' : ''}${change} (${changePercent}%)</li>
      </ul>
      <p>Click below to view the market:</p>
      <a href="${process.env.REACT_APP_BASE_URL}/markets/${marketName}">View Market</a>
    `;

    const textBody = `
Price Movement Alert: ${marketName}
The price has ${changeDirection} from ${previousPrice} to ${currentPrice} (${changePercent}%).
View the market at: ${process.env.REACT_APP_BASE_URL}/markets/${marketName}
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `Price Alert: ${marketName} ${changeDirection}`,
      htmlBody,
      textBody,
    });
  }

  static async sendMarketExpiryReminder(
    email: string,
    marketName: string,
    daysUntilExpiry: number,
    marketUrl: string
  ): Promise<boolean> {
    const htmlBody = `
      <h2>Market Expiring Soon: ${marketName}</h2>
      <p><strong>${marketName}</strong> expires in ${daysUntilExpiry} days.</p>
      <p>Make sure to resolve your positions before the market expires.</p>
      <a href="${marketUrl}">View Market</a>
    `;

    const textBody = `
Market Expiring Soon: ${marketName}
This market expires in ${daysUntilExpiry} days.
View at: ${marketUrl}
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `Market Expiring in ${daysUntilExpiry} Days: ${marketName}`,
      htmlBody,
      textBody,
    });
  }

  static async sendResolutionNotification(
    email: string,
    marketName: string,
    outcome: string,
    marketUrl: string
  ): Promise<boolean> {
    const htmlBody = `
      <h2>Market Resolved: ${marketName}</h2>
      <p><strong>${marketName}</strong> has been resolved.</p>
      <p><strong>Outcome:</strong> ${outcome}</p>
      <p>Check your positions and claim your rewards.</p>
      <a href="${marketUrl}">View Market</a>
    `;

    const textBody = `
Market Resolved: ${marketName}
Outcome: ${outcome}
View at: ${marketUrl}
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `Market Resolved: ${marketName}`,
      htmlBody,
      textBody,
    });
  }

  static async sendLiquidityRewardReminder(
    email: string,
    marketName: string,
    rewardAmount: number,
    claimUrl: string
  ): Promise<boolean> {
    const htmlBody = `
      <h2>Liquidity Reward Available: ${marketName}</h2>
      <p>You have a liquidity reward available for <strong>${marketName}</strong>.</p>
      <p><strong>Reward Amount:</strong> ${rewardAmount}</p>
      <p>Claim your reward before it expires.</p>
      <a href="${claimUrl}">Claim Reward</a>
    `;

    const textBody = `
Liquidity Reward Available: ${marketName}
Reward Amount: ${rewardAmount}
Claim at: ${claimUrl}
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `Claim Your Reward: ${marketName}`,
      htmlBody,
      textBody,
    });
  }

  static async sendPortfolioUpdateSummary(
    email: string,
    totalValue: number,
    dayChange: number,
    dayChangePercent: number,
    portfolioUrl: string
  ): Promise<boolean> {
    const changeDirection = dayChange > 0 ? 'increased' : 'decreased';

    const htmlBody = `
      <h2>Portfolio Update</h2>
      <p>Your portfolio value has ${changeDirection}.</p>
      <ul>
        <li>Current Value: ${totalValue}</li>
        <li>Daily Change: ${dayChange > 0 ? '+' : ''}${dayChange} (${dayChangePercent}%)</li>
      </ul>
      <p>Review your portfolio and adjust your positions as needed.</p>
      <a href="${portfolioUrl}">View Portfolio</a>
    `;

    const textBody = `
Portfolio Update
Your portfolio has ${changeDirection} by ${dayChangePercent}% to ${totalValue}.
View at: ${portfolioUrl}
    `.trim();

    return this.sendEmail({
      to: email,
      subject: `Portfolio Update: ${dayChangePercent > 0 ? 'Up' : 'Down'} ${Math.abs(dayChangePercent)}%`,
      htmlBody,
      textBody,
    });
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async verifyEmailDelivery(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications/email/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to verify email:', error);
      return false;
    }
  }
}
