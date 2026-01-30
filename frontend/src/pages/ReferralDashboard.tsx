import React from 'react';
import { Gift, Users, Coins, Copy, Share2, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Referral Dashboard for tracking rewards, tier bonuses, and invitee performance.
 */
export const ReferralDashboard: React.FC = () => {
    const invites = [
        { name: 'CryptoKnight', status: 'Active', earned: '150 STX', date: 'Jan 12' },
        { name: 'StacksMaxi', status: 'Pending', earned: '0 STX', date: 'Jan 28' },
        { name: 'Web3Dev', status: 'Active', earned: '45 STX', date: 'Jan 05' }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
                <div>
                    <div className="flex items-center space-x-2 text-primary-400 mb-2">
                        <Gift size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Growth Rewards</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white font-display">Referral Program</h1>
                    <p className="text-slate-400 mt-2 max-w-xl">Invite your inner circle to the decentralized prediction engine and earn pro-rata bonuses on every stake they place.</p>
                </div>

                <div className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                        <Sparkles size={120} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Referral Earnings</p>
                    <p className="text-4xl font-black">1,402.5 STX</p>
                    <div className="flex items-center space-x-2 mt-4 text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full w-fit">
                        <TrendingUp size={12} />
                        <span>TOP 5% INFLUENCER</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Referral Card */}
                <div className="md:col-span-2 glass-morphism rounded-[3rem] p-10 border border-white/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Your Referral Link</h3>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">LOYALTY TIER 2</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-slate-950 border border-white/5 rounded-2xl py-4 px-6 flex items-center justify-between group">
                            <span className="text-sm font-mono text-slate-500 group-hover:text-white transition-colors truncate pr-4">https://0xcast.com/r/ALPHAX</span>
                            <button className="text-indigo-400 hover:text-white transition-colors active:scale-90">
                                <Copy size={18} />
                            </button>
                        </div>
                        <button className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center space-x-2">
                            <Share2 size={16} />
                            <span>Broadcast</span>
                        </button>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <h4 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest">Recent Invitees</h4>
                        <div className="space-y-4">
                            {invites.map((invite, i) => (
                                <div key={i} className="flex items-center justify-between p-5 bg-white/2 rounded-2xl border border-white/2 hover:border-white/5 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 font-bold uppercase tracking-tighter">
                                            {invite.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{invite.name}</p>
                                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">Joined {invite.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-400">{invite.earned}</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{invite.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Perks Card */}
                <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 flex flex-col justify-between">
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-8">Earning Perks</h3>
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <Coins size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Revenue Share</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Earn 2% of the protocol fees from any trade placed by your referrals.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Affiliate Badge</p>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">Unlock unique profile flair and exclusive Discord roles.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-slate-600 font-medium text-center italic">Rewards are distributed automatically in STX every Sunday at 00:00 UTC.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
