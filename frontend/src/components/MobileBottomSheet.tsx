import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9]
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const height = snapPoints[currentSnap] * 100;

  const content = (
    <div className="fixed inset-0 z-50 md:flex md:items-center md:justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl transition-all duration-300 md:relative md:max-w-lg md:rounded-3xl"
        style={{ height: `${height}vh`, maxHeight: '90vh' }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center py-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
          </div>

          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {snapPoints.length > 1 && (
            <div className="flex items-center justify-center gap-2 py-3 border-t border-neutral-200 dark:border-neutral-800">
              {snapPoints.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSnap(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSnap === index
                      ? 'bg-blue-500'
                      : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
