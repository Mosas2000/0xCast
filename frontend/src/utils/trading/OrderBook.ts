/**
 * Logic for managing an off-chain order book for prediction markets.
 */
export interface Order {
    id: string;
    price: number;
    amount: number;
    type: 'YES' | 'NO';
    timestamp: number;
}

export class OrderBook {
    private orders: Order[] = [];

    /**
     * Adds an order to the book and sorts it by price.
     */
    addOrder(order: Order): void {
        this.orders.push(order);
        this.orders.sort((a, b) => b.price - a.price);
    }

    /**
     * Returns the top N orders for a specific side.
     */
    getDepth(type: 'YES' | 'NO', depth: number = 10): Order[] {
        return this.orders
            .filter((o) => o.type === type)
            .slice(0, depth);
    }

    /**
     * Calculates the total liquidity available up to a certain price point.
     */
    getTotalLiquidityAtPrice(type: 'YES' | 'NO', targetPrice: number): number {
        return this.orders
            .filter((o) => o.type === type && (type === 'YES' ? o.price >= targetPrice : o.price <= targetPrice))
            .reduce((sum, o) => sum + o.amount, 0);
    }

    /**
     * Removes an order by ID.
     */
    removeOrder(id: string): void {
        this.orders = this.orders.filter((o) => o.id !== id);
    }

    /**
     * Resets the order book.
     */
    clear(): void {
        this.orders = [];
    }
}
