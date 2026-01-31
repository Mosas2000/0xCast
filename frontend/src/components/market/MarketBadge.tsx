import React from 'react';
import { TrendingUp, Award, Zap } from 'lucide-react';

type BadgeType = 'roi' | 'trending' | 'hot';

interface MarketBadgeProps {
    type: BadgeType;
    value?: string;
}

/**
 * Premium badges for market cards to emphasize ROI, trending status, or high volume.
 */
export const MarketBadge: React.FC<MarketBadgeProps> = ({ type, value }) => {
    const configs: Record<BadgeType, { icon: any, label: string, color: string, ring: string }> = {
        roi: {
            icon: TrendingUp,
            label: value ? `${value} ROI` : 'High ROI',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            ring: 'ring-emerald-500/30'
        },
        trending: {
            icon: Award,
            label: 'Trending',
            color: 'bg-primary-500/10 text-primary-400 border-primary-500/20',
            ring: 'ring-primary-500/30'
        },
        hot: {
            icon: Zap,
            label: 'High Volume',
            color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            ring: 'ring-rose-500/30'
        }
    };

    const { icon: Icon, label, color, ring } = configs[type];

    return (
        <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border shadow-sm ring-1 ring-inset ${color} ${ring} animate-pulse-soft`}>
            <Icon size={14} className="flex-shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                {label}
            </span>
        </div>
    );
};
