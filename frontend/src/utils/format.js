/**
 * Format a date string like "May 5, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

/**
 * Format runtime in minutes to "Xh Ym"
 */
export const formatRuntime = (minutes) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Get language display name
 */
export const getLanguageLabel = (code) => {
  const languages = {
    en: 'English',
    hi: 'Hindi',
    fr: 'French',
    es: 'Spanish',
    de: 'German',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ta: 'Tamil',
    te: 'Telugu',
    bn: 'Bengali',
  };
  return languages[code] || code?.toUpperCase() || 'Unknown';
};

/**
 * Get poster placeholder SVG data URL
 */
export const getPosterPlaceholder = () =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%2316161f'/%3E%3Ctext x='150' y='225' text-anchor='middle' fill='%232a2a3d' font-size='60'%3E🎬%3C/text%3E%3C/svg%3E`;

/**
 * Truncate text to a max length
 */
export const truncate = (str, maxLen = 100) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
};

/**
 * Get user initials from username
 */
export const getInitials = (username = '') => {
  return username.slice(0, 2).toUpperCase();
};

/**
 * Get a deterministic color for a user (for avatar)
 */
export const getUserColor = (username = '') => {
  const colors = [
    '#f5c518', '#e63946', '#2ec4b6', '#a8dadc', '#457b9d',
    '#e9c46a', '#f4a261', '#e76f51', '#06d6a0', '#118ab2',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
