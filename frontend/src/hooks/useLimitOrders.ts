import { useState, useEffect } from 'react';

export interface LimitOrder {
    id: string;
    marketId: string;
    marketTitle: string;
    outcome: string;
    targetPrice: number;
    amount: number;
    status: 'pending' | 'filled' | 'cancelled';
    createdAt: number;
    filledAt?: number;
}

export const useLimitOrders = (userAddress?: string) => {
    const [orders, setOrders] = useState<LimitOrder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userAddress) return;

        const stored = localStorage.getItem(`limit_orders_${userAddress}`);
        if (stored) {
            setOrders(JSON.parse(stored));
        }
    }, [userAddress]);

    const createOrder = async (order: Omit<LimitOrder, 'id' | 'status' | 'createdAt'>) => {
        setLoading(true);
        try {
            const newOrder: LimitOrder = {
                ...order,
                id: `order_${Date.now()}`,
                status: 'pending',
                createdAt: Date.now(),
            };

            const updated = [...orders, newOrder];
            setOrders(updated);

            if (userAddress) {
                localStorage.setItem(`limit_orders_${userAddress}`, JSON.stringify(updated));
            }

            return newOrder;
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string) => {
        const updated = orders.map(o =>
            o.id === orderId ? { ...o, status: 'cancelled' as const } : o
        );
        setOrders(updated);

        if (userAddress) {
            localStorage.setItem(`limit_orders_${userAddress}`, JSON.stringify(updated));
        }
    };

    return {
        orders,
        loading,
        createOrder,
        cancelOrder,
    };
};
