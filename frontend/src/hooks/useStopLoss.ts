import { useState, useEffect } from 'react';

export interface StopLossOrder {
    id: string;
    marketId: string;
    marketTitle: string;
    outcome: string;
    stopPrice: number;
    amount: number;
    status: 'active' | 'triggered' | 'cancelled';
    createdAt: number;
}

export const useStopLoss = (userAddress?: string) => {
    const [orders, setOrders] = useState<StopLossOrder[]>([]);

    useEffect(() => {
        if (!userAddress) return;
        const stored = localStorage.getItem(`stop_loss_${userAddress}`);
        if (stored) setOrders(JSON.parse(stored));
    }, [userAddress]);

    const createStopLoss = async (order: Omit<StopLossOrder, 'id' | 'status' | 'createdAt'>) => {
        const newOrder: StopLossOrder = {
            ...order,
            id: `sl_${Date.now()}`,
            status: 'active',
            createdAt: Date.now(),
        };
        const updated = [...orders, newOrder];
        setOrders(updated);
        if (userAddress) localStorage.setItem(`stop_loss_${userAddress}`, JSON.stringify(updated));
        return newOrder;
    };

    const cancelStopLoss = (orderId: string) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o);
        setOrders(updated);
        if (userAddress) localStorage.setItem(`stop_loss_${userAddress}`, JSON.stringify(updated));
    };

    return { orders, createStopLoss, cancelStopLoss };
};
