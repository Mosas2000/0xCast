import { Skeleton } from './Skeleton';
import { Card } from './Card';

export function SkeletonMarketCard() {
    return (
        <Card>
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                    <Skeleton width="70%" height="1.5rem" />
                    <Skeleton width="80px" height="1.5rem" variant="text" />
                </div>
                <Skeleton width="40%" height="0.75rem" />
            </div>

            {/* Pool Info */}
            <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                <Skeleton width="100%" height="3rem" className="mb-2" />
                <div className="flex justify-between">
                    <Skeleton width="45%" height="1rem" />
                    <Skeleton width="45%" height="1rem" />
                </div>
            </div>

            {/* Odds */}
            <div className="mb-4">
                <div className="flex gap-2">
                    <Skeleton width="50%" height="3rem" />
                    <Skeleton width="50%" height="3rem" />
                </div>
            </div>

            {/* Action Button */}
            <Skeleton width="100%" height="3rem" />
        </Card>
    );
}
