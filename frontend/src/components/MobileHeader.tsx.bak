import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showNotifications?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
}

export function MobileHeader({
  title = '0xCast',
  showNotifications = true,
  showProfile = true,
  onMenuClick
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 safe-area-top">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors tap-target lg:hidden"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="text-xl font-bold text-blue-600">
            {title}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {showNotifications && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors tap-target"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          )}

          {showProfile && (
            <Link
              to="/profile"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors tap-target"
              aria-label="Profile"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
