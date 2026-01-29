import React from 'react';
import { useInsights, usePlatformMetrics } from '../hooks/analytics';
import { Card } from './Card';
import { TrendingUp, AlertCircle, Info } from 'lucide-react';

export const PlatformInsights: React.FC = () => {
    const { metrics } = usePlatformMetrics();
    const insights = useInsights(metrics);

    if (insights.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
                <Card key={index} className={`border-none shadow-sm ${insight.type === 'positive' ? 'bg-green-50' :
                        insight.type === 'negative' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                    <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl ${insight.type === 'positive' ? 'bg-white text-green-600' :
                                insight.type === 'negative' ? 'bg-white text-red-600' : 'bg-white text-blue-600'
                            }`}>
                            {insight.type === 'positive' ? <TrendingUp className="w-5 h-5" /> :
                                insight.type === 'negative' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                        </div>
                        <div>
                            <h5 className={`font-bold ${insight.type === 'positive' ? 'text-green-900' :
                                    insight.type === 'negative' ? 'text-red-900' : 'text-blue-900'
                                }`}>{insight.title}</h5>
                            <p className={`text-sm mt-1 mb-2 ${insight.type === 'positive' ? 'text-green-700' :
                                    insight.type === 'negative' ? 'text-red-700' : 'text-blue-700'
                                }`}>{insight.description}</p>
                            {insight.value && (
                                <span className={`text-xs font-extrabold px-2 py-1 rounded-lg ${insight.type === 'positive' ? 'bg-green-100 text-green-700' :
                                        insight.type === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {insight.value}
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};
