import { useState, useEffect } from 'react';

export function useAnalytics<T>(
    fetchFn: () => Promise<T>,
    dependencies: any[] = []
) {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);
                const result = await fetchFn();
                if (mounted) {
                    setData(result);
                }
            } catch (err) {
                if (mounted) {
                    setError(err as Error);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            mounted = false;
        };
    }, dependencies);

    const refetch = async () => {
        setIsLoading(true);
        try {
            const result = await fetchFn();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, error, refetch };
}
