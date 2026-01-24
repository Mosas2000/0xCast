import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    label: 'Markets',
    href: '/'
  },
  {
    icon: 'M12 4v16m8-8H4',
    label: 'Create',
    href: '/create'
  },
  {
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    label: 'Positions',
    href: '/positions'
  },
  {
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    label: 'Profile',
    href: '/profile'
  }
];

export const MobileBottomNav: React.FC = () => {
  const { isMobile } = useIsMobile();
  const currentPath = window.location.pathname;
  
  if (!isMobile) return null;
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          
          return (
            <a
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors relative
                ${isActive 
                  ? 'text-indigo-500' 
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              {/* Icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              
              {/* Label */}
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
              
              {/* Badge */}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-500 rounded-b" />
              )}
            </a>
          );
        })}
      </div>
      
      {/* Safe area padding for devices with notch */}
      <div className="h-[env(safe-area-inset-bottom)] bg-gray-900" />
    </nav>
  );
};
