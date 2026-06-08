import i18n from '../i18n/config';

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 10) {
    return i18n.t('common:time.justNow');
  }
  
  if (seconds < 60) {
    return i18n.t('common:time.now');
  }
  
  if (minutes < 60) {
    return i18n.t('common:time.minuteAgo', { count: minutes });
  }
  
  if (hours < 24) {
    return i18n.t('common:time.hourAgo', { count: hours });
  }
  
  if (days < 7) {
    return i18n.t('common:time.dayAgo', { count: days });
  }
  
  if (weeks < 4) {
    return i18n.t('common:time.weekAgo', { count: weeks });
  }
  
  if (months < 12) {
    return i18n.t('common:time.monthAgo', { count: months });
  }
  
  return i18n.t('common:time.yearAgo', { count: years });
}
