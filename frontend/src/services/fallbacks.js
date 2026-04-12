export const isDemoToken = () => {
  try {
    const rawAuth = localStorage.getItem('rubygym_auth');
    if (!rawAuth) {
      return false;
    }

    const { token } = JSON.parse(rawAuth);
    return String(token || '').startsWith('demo-token-');
  } catch (error) {
    return false;
  }
};

export const normalizeApiError = (error, fallbackMessage) => (
  error?.response?.data?.error || fallbackMessage
);
