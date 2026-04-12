import { useState } from 'react';
import { FiArrowLeft, FiCheck, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../Layout/BrandLogo';

const dashboardByRole = {
  ADMIN: '/admin',
  TRAINER: '/trainer',
  MEMBER: '/member'
};

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'admin@rubygym.com',
    password: 'admin123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      navigate(dashboardByRole[user.role] || '/');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Không đăng nhập được.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel auth-panel-brand">
        <BrandLogo to="/" light subtitle="RubyGYM Cloud" />
        <h1>Điều hành phòng gym trong một nền tảng duy nhất</h1>
        <p>
          Theo dõi vận hành, lịch tập, hội viên và hiệu suất huấn luyện viên bằng trải nghiệm quản trị gọn gàng, hiện đại.
        </p>
        <div className="auth-hints">
          <strong>Tài khoản demo</strong>
          <p><code>admin@rubygym.com / admin123</code></p>
          <p><code>trainer@rubygym.com / trainer123</code></p>
          <p><code>member@rubygym.com / member123</code></p>
        </div>
      </div>

      <div className="page-card auth-card">
        <h1>Đăng nhập</h1>
        <p className="section-subtitle">Truy cập workspace quản lý của bạn.</p>
        <form className="form-grid single-column" onSubmit={handleSubmit}>
          <label>
            Email
            <input name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Mật khẩu
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
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
