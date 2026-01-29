import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, AppConfig, showConnect, UserData } from '@stacks/connect';
import { StacksMainnet, StacksTestnet, StacksMocknet } from '@stacks/network';

interface WalletContextType {
    userSession: UserSession;
    userData: UserData | null;
    isConnected: boolean;
    address: string | null;
    network: StacksMainnet | StacksTestnet | StacksMocknet;
    connect: () => void;
    disconnect: () => void;
    setTestnet: (isTestnet: boolean) => void;
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [network, setNetwork] = useState<StacksMainnet | StacksTestnet | StacksMocknet>(new StacksMainnet());

    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            setUserData(userSession.loadUserData());
        }
    }, []);

    const connect = () => {
        showConnect({
            appDetails: {
                name: '0xCast',
                icon: window.location.origin + '/logo.png',
            },
            userSession,
            onFinish: () => {
                setUserData(userSession.loadUserData());
            },
            onCancel: () => {
                console.log('User cancelled login');
            },
        });
    };

    const disconnect = () => {
        userSession.signUserOut();
        setUserData(null);
    };

    const setTestnet = (isTestnet: boolean) => {
        setNetwork(isTestnet ? new StacksTestnet() : new StacksMainnet());
    };

    const isConnected = !!userData;
    const address = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet || null;

    return (
        <WalletContext.Provider value={{
            userSession,
            userData,
            isConnected,
            address,
            network,
            connect,
            disconnect,
            setTestnet
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
