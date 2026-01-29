import { useWallet as useWalletContext } from '../components/wallet/WalletProvider';

export function useWallet() {
    return useWalletContext();
}
