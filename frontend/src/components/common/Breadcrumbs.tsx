import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Modern Breadcrumbs component for clear hierarchical navigation.
 */
export const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="flex mb-6 text-sm">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/"
                        className="text-slate-400 hover:text-primary-400 transition-colors flex items-center"
                    >
                        <Home size={14} className="mr-1" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;

                    return (
                        <li key={to} className="flex items-center space-x-2">
                            <ChevronRight size={14} className="text-slate-600" />
                            {last ? (
                                <span className="text-white font-medium capitalize">
                                    {value.replace(/-/g, ' ')}
                                </span>
                            ) : (
                                <Link
                                    to={to}
                                    className="text-slate-400 hover:text-white transition-colors capitalize"
                                >
                                    {value.replace(/-/g, ' ')}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
