import { UserAvatar } from './UserAvatar';

interface UserProfileProps {
    userAddress: string;
    className?: string;
}

export function UserProfile({ userAddress, className = '' }: UserProfileProps) {
    // Placeholder data - would come from contract/API
    const joinDate = new Date('2024-01-01');
    const totalMarketsCreated = 0;
    const totalStakes = 0;

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`.trim()}>
            {/* Avatar and Address */}
            <div className="flex items-center space-x-4 mb-6">
                <UserAvatar address={userAddress} size="lg" />
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                    </h2>
                    <p className="text-sm text-slate-400">
                        Member since {joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Markets Created</p>
                    <p className="text-2xl font-bold text-white">{totalMarketsCreated}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Total Stakes</p>
                    <p className="text-2xl font-bold text-white">{totalStakes}</p>
                </div>
            </div>

            {/* Full Address */}
            <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-2">Full Address</p>
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <code className="text-xs text-slate-300 font-mono break-all">{userAddress}</code>
                    <button
                        onClick={() => navigator.clipboard.writeText(userAddress)}
                        className="ml-2 p-2 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                        title="Copy address"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
