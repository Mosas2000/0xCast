import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { NotificationType } from '../types/notification';
import { createNotification } from '../utils/notificationHelpers';

/**
 * Hook that watches for events and creates notifications automatically
 * @param markets - Array of markets to watch
 * @param positions - Array of user positions
 */
export function useNotificationTriggers(markets: any[], positions: any[]) {
    const { addNotification } = useNotifications();

    useEffect(() => {
        // Check for markets ending soon (within 24 hours)
        markets.forEach((market) => {
            // Placeholder logic - would check actual block height
            const isEndingSoon = false;

            if (isEndingSoon) {
                addNotification(createNotification(
                    NotificationType.MARKET_ENDING_SOON,
                    {
                        title: 'Market Ending Soon',
                        message: `"${market.question}" ends in less than 24 hours`,
                        metadata: { marketId: market.id, marketQuestion: market.question },
                    }
                ));
            }
        });

        // Check for resolved markets where user has positions
        positions.forEach((position) => {
            const market = markets.find(m => m.id === position.marketId);
            if (!market) return;

            // Placeholder logic - would check if market just resolved
            const justResolved = false;

            if (justResolved) {
                // Check if user won
                const won = false; // Placeholder

                addNotification(createNotification(
                    won ? NotificationType.WIN : NotificationType.LOSS,
                    {
                        title: won ? 'You Won!' : 'Market Resolved',
                        message: won
                            ? `You won on "${market.question}"`
                            : `"${market.question}" has been resolved`,
                        metadata: { marketId: market.id, marketQuestion: market.question },
                    }
                ));
            }
        });

        // Check for claimable winnings
        positions.forEach((position) => {
            const market = markets.find(m => m.id === position.marketId);
            if (!market) return;

            // Placeholder logic - would check if winnings are claimable
            const hasClaimable = false;

            if (hasClaimable && !position.claimed) {
                addNotification(createNotification(
                    NotificationType.CLAIM_AVAILABLE,
                    {
                        title: 'Winnings Available',
                        message: `Claim your winnings from "${market.question}"`,
                        metadata: { marketId: market.id, marketQuestion: market.question },
                    }
                ));
            }
        });
    }, [markets, positions, addNotification]);
}
