export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback;
}

export function homeForRole(role) {
  if (role === 'doctor') return '/doctor';
  if (role === 'admin') return '/admin';
  if (role === 'patient') return '/patient/doctors';
  return '/';
}

export function formatDate(value) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(new Date(value));
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase() || 'D';
}
