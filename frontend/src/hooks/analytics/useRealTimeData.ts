import { useState, useEffect } from 'react';

export function useRealTimeData<T>(
    initialData: T | null,
    updateFn: () => Promise<T>,
    interval: number = 5000
) {
    const [data, setData] = useState<T | null>(initialData);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const timer = setInterval(async () => {
            try {
                setIsUpdating(true);
                const updated = await updateFn();
                setData(updated);
            } catch (err) {
                console.error('Real-time update failed:', err);
            } finally {
                setIsUpdating(false);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [updateFn, interval]);

    return { data, isUpdating };
}
