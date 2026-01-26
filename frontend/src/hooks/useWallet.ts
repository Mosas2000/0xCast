import { useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

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

    const connect = () => {
        console.log('Connect function called');
        try {
            showConnect({
                appDetails: {
                    name: '0xCast',
                    icon: window.location.origin + '/vite.svg',
                },
                redirectTo: '/',
                onFinish: () => {
                    console.log('Connection finished');
                    const userData = userSession.loadUserData();
                    setAddress(userData.profile.stxAddress.mainnet);
                    setIsConnected(true);
                },
                onCancel: () => {
                    console.log('Connection cancelled');
                },
                userSession,
            });
        } catch (error) {
            console.error('Error connecting wallet:', error);
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
