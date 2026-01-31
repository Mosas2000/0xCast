import { useState, useEffect } from 'react';
import { calculateReputation, getReputationLevel, getProgressToNextLevel } from '../utils/reputationUtils';

export const useReputation = (userStats?: {
    totalTrades: number;
    winRate: number;
    marketsCreated: number;
    profitLoss: number;
}) => {
    const [reputationScore, setReputationScore] = useState(0);

    useEffect(() => {
        if (userStats) {
            const score = calculateReputation(userStats);
            setReputationScore(score);
        }
    }, [userStats]);

    const level = getReputationLevel(reputationScore);
    const progression = getProgressToNextLevel(reputationScore);

    return {
        score: reputationScore,
        level,
        progression,
    };
};
