import React, { useState, useEffect } from 'react';

export const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        }

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-primary-600 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <div className="flex items-center space-x-4 z-10">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                        ⚡
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg">Experience 0xCast Lite</h3>
                        <p className="text-primary-100 text-sm">Add to home screen for a premium mobile experience.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 z-10 w-full md:w-auto">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="flex-1 md:flex-none px-6 py-3 text-primary-100 font-bold hover:text-white transition-colors"
                    >
                        Later
                    </button>
                    <button
                        onClick={handleInstall}
                        className="flex-1 md:flex-none px-8 py-3 bg-white text-primary-600 font-black rounded-xl shadow-lg hover:bg-primary-50 transition-all active:scale-95"
                    >
                        Install Now
                    </button>
                </div>
            </div>
        </div>
    );
};
