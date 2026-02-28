import { useWallet } from '../components/wallet/WalletProvider';
import { openSTXTransfer } from '@stacks/connect';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

export const useWalletUtils = () => {
    const { address, network, userSession } = useWallet();

    const transferSTX = async (recipient: string, amountMicroStx: number) => {
        if (!userSession.isUserSignedIn()) {
            throw new Error('User not signed in');
        }

        await openSTXTransfer({
            recipient,
            amount: amountMicroStx.toString(),
            network,
            appDetails: {
                name: '0xCast',
                icon: window.location.origin + '/logo.png',
            },
            onFinish: (data) => {
                console.log('Transfer finished:', data.txId);
            },
            onCancel: () => {
                console.log('Transfer cancelled');
            },
        });
    };

    const truncateAddress = (addr: string | null) => {
        if (!addr) return '';
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return {
        transferSTX,
        truncateAddress,
        isMainnet: network === STACKS_MAINNET,
        isTestnet: network === STACKS_TESTNET,
    };
};
