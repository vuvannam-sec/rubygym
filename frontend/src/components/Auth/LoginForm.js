import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck, FiSave } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../Layout/BrandLogo';
import { Toast } from '../Layout/ProductUI';

const dashboardByRole = {
  ADMIN: '/admin',
  TRAINER: '/trainer',
  MEMBER: '/member'
};

const getDashboardPath = (user) => {
  if (user?.role === 'MEMBER' && user.onboarding_completed === false) {
    return '/member/onboarding';
  }

  return dashboardByRole[user?.role] || '/';
};

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [flashToast, setFlashToast] = useState(location.state?.flashToast || null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.flashToast) {
      setFlashToast(location.state.flashToast);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData);
      navigate(getDashboardPath(user));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Không đăng nhập được.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel auth-panel-brand">
        <BrandLogo to="/" light subtitle="Trung tâm thể hình" />
        <h1>Chào mừng trở lại RubyGYM</h1>
        <p>
          Đăng nhập để xem lịch tập, mục tiêu, gói hội viên và tiến độ của bạn. Huấn luyện viên và quản trị viên đăng nhập để quản lý hoạt động trung tâm.
        </p>
      </div>

      <div className="page-card auth-card">
        <Toast toast={flashToast} onClose={() => setFlashToast(null)} />
        <h1>Đăng nhập</h1>
        <p className="section-subtitle">Đăng nhập để tiếp tục với tài khoản RubyGYM của bạn.</p>
        <form className="form-grid single-column" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? <FiSave /> : <FiCheck />}
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/')}>
            <FiArrowLeft />
            Quay lại trang chủ
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginForm;
