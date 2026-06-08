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

export const normalizeApiError = (error, fallbackMessage) => {
  const errorMessage = error?.response?.data?.error;

  if (errorMessage === 'Invalid token' || errorMessage === 'No token provided') {
    return 'Phiên đăng nhập không hợp lệ. Vui lòng đăng xuất rồi đăng nhập lại bằng tài khoản backend.';
  }

  return errorMessage || fallbackMessage;
};
