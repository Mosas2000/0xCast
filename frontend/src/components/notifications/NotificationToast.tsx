import React, { useEffect, useState } from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationToastProps {
    type: NotificationType;
    message: string;
    duration?: number;
    onClose: () => void;
}

/**
 * Premium notification toast (snackbar) for transient systemic feedback.
 */
export const NotificationToast: React.FC<NotificationToastProps> = ({
    type,
    message,
    duration = 5000,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const configs: Record<NotificationType, { icon: any, color: string, border: string }> = {
        info: { icon: Info, color: 'text-primary-400', border: 'border-primary-500/20 bg-primary-500/10' },
        success: { icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/20 bg-emerald-500/10' },
        warning: { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/10' },
        error: { icon: XCircle, color: 'text-rose-400', border: 'border-rose-500/20 bg-rose-500/10' }
    };

    const { icon: Icon, color, border } = configs[type];

    return (
        <div className={`fixed bottom-6 right-6 z-[110] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
            }`}>
            <div className={`flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${border} min-w-[300px]`}>
                <div className={`flex-shrink-0 ${color}`}>
                    <Icon size={20} />
                </div>
                <p className="flex-grow text-sm font-bold text-white pr-4">{message}</p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
