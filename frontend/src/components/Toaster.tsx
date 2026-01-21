import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
    return (
        <HotToaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                success: {
                    style: {
                        background: '#10b981',
                        color: '#ffffff',
                    },
                },
                error: {
                    style: {
                        background: '#ef4444',
                        color: '#ffffff',
                    },
                },
            }}
        />
    );
}
