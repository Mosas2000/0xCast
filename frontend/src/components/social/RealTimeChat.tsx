import React, { useState } from 'react';
import { Send, Hash, Users, Sparkles, MessageCircle } from 'lucide-react';

interface ChatMessage {
    id: string;
    user: string;
    text: string;
    timestamp: string;
    avatar: string;
}

/**
 * A sleek real-time chat interface for market discussions and community bonding.
 */
export const RealTimeChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', user: 'StacksBull', text: 'This market is looking bullish for YES! 🚀', timestamp: '2:14 PM', avatar: 'https://i.pravatar.cc/150?u=1' },
        { id: '2', user: 'CryptoWhale', text: 'Anyone seen the latest on-chain volume?', timestamp: '2:15 PM', avatar: 'https://i.pravatar.cc/150?u=2' },
        { id: '3', user: 'BetaTester', text: 'Staked 100 STX on NO just in case.', timestamp: '2:18 PM', avatar: 'https://i.pravatar.cc/150?u=3' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const sendMessage = () => {
        if (!inputValue.trim()) return;
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            user: 'Me',
            text: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: 'https://i.pravatar.cc/150?u=me'
        };
        setMessages([...messages, newMessage]);
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Market Lobby</h3>
                        <div className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">124 Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-8 h-8 rounded-xl border-2 border-slate-900" alt="User" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((m) => (
                    <div key={m.id} className="flex items-start space-x-4 group">
                        <img src={m.avatar} className="w-10 h-10 rounded-2xl shadow-lg border border-white/5" alt={m.user} />
                        <div className="flex-1 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{m.user}</span>
                                <span className="text-[9px] font-black text-slate-700">{m.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed bg-white/2 p-3 rounded-2xl border border-white/2 hover:border-white/5 transition-all">
                                {m.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-950/50 border-t border-white/5">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                        <Sparkles size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="w-full bg-slate-900 border border-white/10 rounded-[1.5rem] py-4 pl-12 pr-16 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                    <button
                        onClick={sendMessage}
                        className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
