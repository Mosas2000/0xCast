import { useState } from 'react';
import { useWallet } from '../useWallet';
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV, uintCV, listCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../../constants/contract';

export const useMarketCreation = () => {
    const { address, network, userSession } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createMarket = async (
        title: string,
        description: string,
        outcomes: string[],
        endBlock: number
    ) => {
        if (!userSession.isUserSignedIn()) {
            throw new Error('User not signed in');
        }

        setIsSubmitting(true);
        try {
            await openContractCall({
                network,
                contractAddress: CONTRACT_ADDRESS,
                contractName: CONTRACT_NAME,
                functionName: 'create-market',
                functionArgs: [
                    stringUtf8CV(title),
                    stringUtf8CV(description),
                    listCV(outcomes.map(o => stringUtf8CV(o))),
                    uintCV(endBlock)
                ],
                appDetails: {
                    name: '0xCast',
                    icon: window.location.origin + '/logo.png',
                },
                onFinish: (data) => {
                    console.log('Market creation finished:', data.txId);
                    setIsSubmitting(false);
                },
                onCancel: () => {
                    console.log('Market creation cancelled');
                    setIsSubmitting(false);
                },
            });
        } catch (err) {
            console.error('Error creating market:', err);
            setIsSubmitting(false);
            throw err;
        }
    };

    return {
        createMarket,
        isSubmitting
    };
};
