import { useState, useEffect } from 'react';
import { cvToJSON, hexToCV } from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import type { MultiMarket } from '../types/multiMarket';
import { CONTRACT_ADDRESS } from '../constants/contract';

export function useMultiMarket(marketId: number) {
  const [market, setMarket] = useState<MultiMarket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (marketId) {
      fetchMultiMarket(marketId);
    }
  }, [marketId]);
  
  async function fetchMultiMarket(id: number) {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert market ID to hex
      const marketIdHex = `0x${id.toString(16).padStart(32, '0')}`;
      
      // Call read-only function
      const response = await fetch(
        `https://api.mainnet.hiro.so/v2/contracts/call-read/${CONTRACT_ADDRESS}/market-multi/get-multi-market`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: CONTRACT_ADDRESS,
            arguments: [marketIdHex]
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.okay) {
        throw new Error('Market not found');
      }
      
      // Parse the CV result
      const cv = hexToCV(data.result);
      const parsed = cvToJSON(cv);
      
      if (!parsed || parsed.type !== 'some') {
        throw new Error('Market not found');
      }
      
      const marketData = parsed.value;
      
      // Calculate total pool
      const totalPool = marketData['outcome-stakes'].reduce((sum: number, stake: number) => sum + stake, 0);
      
      // Transform to MultiMarket type
      const market: MultiMarket = {
        id,
        question: marketData.question,
        creator: marketData.creator,
        outcomes: marketData['outcome-names'].map((name: string, index: number) => {
          const stake = marketData['outcome-stakes'][index];
          const odds = totalPool > 0 ? (stake / totalPool) * 100 : 0;
          
          return {
            name,
            index,
            stake,
            odds
          };
        }),
        outcomeCount: marketData['outcome-count'],
        endDate: marketData['end-date'],
        resolutionDate: marketData['resolution-date'],
        status: marketData.status,
        winningOutcome: marketData['winning-outcome']?.type === 'some' 
          ? marketData['winning-outcome'].value 
          : undefined,
        createdAt: marketData['created-at'],
        totalPool
      };
      
      setMarket(market);
    } catch (err) {
      console.error('Error fetching multi-outcome market:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market');
    } finally {
      setIsLoading(false);
    }
  }
  
  return { 
    market, 
    isLoading, 
    error, 
    refetch: () => fetchMultiMarket(marketId) 
  };
}
