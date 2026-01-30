import React, { useState } from 'react';
import { Send, Mail, UserPlus, ShieldOff, MoreVertical, Search } from 'lucide-react';

interface Message {
    id: string;
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
}

interface Thread {
    id: string;
    user: string;
    lastMessage: string;
    unreadCount: number;
}

/**
 * End-to-end encrypted direct messaging for private collaboration and OTC discussions.
 */
export const DirectMessages: React.FC = () => {
    const [activeThread, setActiveThread] = useState('t1');

    const threads: Thread[] = [
        { id: 't1', user: 'BitcoinWizard', lastMessage: 'Check the pool depth again...', unreadCount: 2 },
        { id: 't2', user: 'StacksMaxi', lastMessage: 'Waiting for resolution.', unreadCount: 0 },
        { id: 't3', user: 'AlphaTrader', lastMessage: 'Did you see the latest SEC news?', unreadCount: 5 }
    ];

    const messages: Message[] = [
        { id: 'm1', sender: 'BitcoinWizard', text: 'Hey, are you interested in a large OTC stake on the BTC/USD market?', time: '10:05 AM', isMe: false },
        { id: 'm2', sender: 'Me', text: 'Potentially. What are the terms?', time: '10:07 AM', isMe: true },
        { id: 'm3', sender: 'BitcoinWizard', text: 'Check the pool depth again, I just added 5k STX to the NO side.', time: '10:10 AM', isMe: false }
    ];

    return (
        <div className="flex h-[700px] bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex flex-col border-r border-white/5 bg-slate-950/50">
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                            <Mail size={18} className="text-white" />
                            <span>Inbox</span>
                        </h3>
                        <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all">
                            <UserPlus size={18} />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            placeholder="Search contacts..."
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-[10px] font-black uppercase text-white outline-none focus:border-white/10"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
                    {threads.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveThread(t.id)}
                            className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${activeThread === t.id ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <img src={`https://i.pravatar.cc/150?u=${t.user}`} className="w-12 h-12 rounded-2xl border border-white/10" alt={t.user} />
                            <div className="flex-1 text-left">
                                <div className="flex justify-between">
                                    <span className="text-xs font-black text-white uppercase tracking-tighter">{t.user}</span>
                                    {t.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />}
                                </div>
                                <p className="text-[10px] font-medium text-slate-600 truncate max-w-[120px]">{t.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-6 bg-slate-950/20 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src={`https://i.pravatar.cc/150?u=${threads.find(t => t.id === activeThread)?.user}`} className="w-10 h-10 rounded-2xl border border-white/10" alt="Active" />
                        <div>
                            <h4 className="text-white font-bold text-sm tracking-tight">{threads.find(t => t.id === activeThread)?.user}</h4>
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Now</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-700 hover:text-white transition-colors"><ShieldOff size={18} /></button>
                        <button className="p-2 text-slate-700 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-10 space-y-6 scrollbar-hide">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-5 rounded-[2rem] text-sm font-medium ${m.isMe ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 rounded-tr-none' : 'bg-slate-800 text-slate-300 rounded-tl-none border border-white/5'}`}>
                                {m.text}
                                <div className={`text-[8px] font-black uppercase tracking-tighter mt-2 ${m.isMe ? 'text-indigo-200' : 'text-slate-600'}`}>{m.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-8 bg-slate-950/40 border-t border-white/5">
                    <div className="relative">
                        <input
                            placeholder="Secure message..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-20 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                        <button className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
