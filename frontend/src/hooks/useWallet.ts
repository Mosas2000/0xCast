import { useState, useEffect } from 'react';
import * as StacksConnect from '@stacks/connect';

const appConfig = new StacksConnect.AppConfig(['store_write', 'publish_data']);
const userSession = new StacksConnect.UserSession({ appConfig });

export function useWallet() {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            setAddress(userData.profile.stxAddress.mainnet);
            setIsConnected(true);
        }
    }, []);

    const connect = async () => {
        console.log('Connect function called');
        console.log('Available StacksConnect methods:', Object.keys(StacksConnect));
        
        try {
            StacksConnect.showConnect({
                appDetails: {
                    name: '0xCast',
                    icon: `${window.location.origin}/vite.svg`,
                },
                onFinish: () => {
                    console.log('Connection finished');
                    if (userSession.isUserSignedIn()) {
                        const userData = userSession.loadUserData();
                        console.log('User data:', userData);
                        const mainnetAddress = userData.profile.stxAddress.mainnet;
                        console.log('Mainnet address:', mainnetAddress);
                        setAddress(mainnetAddress);
                        setIsConnected(true);
                    }
                },
                onCancel: () => {
                    console.log('Connection cancelled by user');
                },
                userSession,
            });
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const disconnect = () => {
        userSession.signUserOut();
        setAddress(null);
        setIsConnected(false);
    };

    return {
        address,
        isConnected,
        connect,
        disconnect,
        userSession,
    };
}
