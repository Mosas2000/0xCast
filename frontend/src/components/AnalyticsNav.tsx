import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PieChart, Trophy, Settings, HelpCircle, Menu, X } from 'lucide-react';

export const AnalyticsNav: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const links = [
        { to: '/analytics', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview' },
        { to: '/analytics/markets/0', icon: <BarChart3 className="w-5 h-5" />, label: 'Market Insights' },
        { to: '/analytics/portfolio', icon: <PieChart className="w-5 h-5" />, label: 'Portfolio' },
        { to: '/analytics/leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard' },
    ];

    const bottomLinks = [
        { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
        { to: '/help', icon: <HelpCircle className="w-5 h-5" />, label: 'Support' },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-40 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center space-x-3 mb-12 px-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">0xCast<span className="text-indigo-600">.</span></span>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200
                  ${isActive
                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                `}
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-gray-50 space-y-2">
                        {bottomLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                            >
                                {link.icon}
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};
