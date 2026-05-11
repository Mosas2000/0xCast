import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface MobileToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export function MobileToast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom'
}: MobileToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const positionClasses = {
    top: 'top-20',
    bottom: 'bottom-20'
  };

  const content = (
    <div
      className={`
        fixed left-4 right-4 z-50 mx-auto max-w-md
        ${positionClasses[position]}
        transition-all duration-300 transform
        ${isVisible ? 'translate-y-0 opacity-100' : position === 'top' ? '-translate-y-4 opacity-0' : 'translate-y-4 opacity-0'}
      `}
    >
      <div className={`${colors[type]} rounded-lg shadow-lg p-4 flex items-center gap-3`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-sm font-medium">
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
