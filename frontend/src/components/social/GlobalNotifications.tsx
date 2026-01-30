import React from 'react';
import { Bell, BellOff, MessageSquare, Zap, Trophy, ShieldCheck, X } from 'lucide-react';

interface Notification {
    id: string;
    type: 'trade' | 'social' | 'system' | 'reward';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

/**
 * Universal notification center for real-time alerts across trading and social domains.
 */
export const GlobalNotifications: React.FC = () => {
    const notifications: Notification[] = [
        {
            id: 'n1',
            type: 'trade',
            title: 'Market Resolved',
            message: 'The market "BTC > $50k" has been resolved as YES. Your winnings are available.',
            time: '2m ago',
            read: false
        },
        {
            id: 'n2',
            type: 'social',
            title: 'New Mention',
            message: '@StacksBull mentioned you in a comment on "L2 Scalability".',
            time: '1h ago',
            read: true
        },
        {
            id: 'n3',
            type: 'reward',
            title: 'Achievement Unlocked',
            message: 'You earned the "Diamond Hands" legendary achievement!',
            time: '5h ago',
            read: false
        }
    ];

    const typeIcons = {
        trade: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        social: { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        system: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        reward: { icon: Trophy, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' }
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-white">
                    <Bell size={20} className="animate-wiggle" />
                    <h3 className="text-xl font-bold uppercase tracking-widest">Alert Center</h3>
                </div>
                <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">MARK ALL AS READ</button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {notifications.map((n) => {
                    const { icon: Icon, color, bg } = typeIcons[n.type];
                    return (
                        <div key={n.id} className={`group relative p-6 rounded-[2rem] border transition-all ${n.read ? 'bg-white/2 border-white/5 opacity-60' : 'bg-white/5 border-white/10 border-l-4 border-l-indigo-500'}`}>
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center border border-white/5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <h4 className="text-sm font-bold text-white tracking-tight">{n.title}</h4>
                                        <span className="text-[9px] font-black text-slate-700 uppercase">{n.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{n.message}</p>
                                </div>
                                <button className="p-1 text-slate-800 hover:text-white transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center">
                <button className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">
                    <BellOff size={14} />
                    <span>Notification Settings</span>
                </button>
            </div>
        </div>
    );
};
