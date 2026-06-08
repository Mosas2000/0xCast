import { useEffect, useState } from 'react';
import type { ScreenReaderAnnouncement } from '@/types/accessibility';

interface AccessibilityAnnouncerProps {
  announcement?: ScreenReaderAnnouncement;
}

export function AccessibilityAnnouncer({ announcement }: AccessibilityAnnouncerProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  useEffect(() => {
    if (announcement) {
      setMessage(announcement.message);
      setPriority(announcement.priority);

      const clearAfter = announcement.clearAfter || 1000;
      const timer = setTimeout(() => {
        setMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [announcement]);

  if (!message) return null;

  return (
    <div
      role={priority === 'assertive' ? 'alert' : 'status'}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
