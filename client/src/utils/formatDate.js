// "5m", "3h", "2d" style time for posts and comments; falls back to a date.
export const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const fullDate = (dateString) =>
  new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const monthYear = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
