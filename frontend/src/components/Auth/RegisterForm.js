import { useEffect, useState } from 'react';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { trainers as fallbackTrainers } from '../../data/mockData';
import BrandLogo from '../Layout/BrandLogo';

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    trainer_id: '',
    referral_code: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const { data } = await api.get('/trainers/public');
        setTrainers(data);
      } catch (requestError) {
        setTrainers(fallbackTrainers.map((trainer) => ({
          id: trainer.id,
          full_name: trainer.name,
          specialization: trainer.specialization
        })));
      }
    };

    loadTrainers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await register(formData);
      setMessage('Đăng ký thành công. Hãy đăng nhập để tiếp tục.');
      navigate('/login');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Không đăng ký được.');
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel auth-panel-brand">
        <BrandLogo to="/" light subtitle="Member onboarding" />
        <h1>Đăng ký nhanh để bắt đầu hành trình tập luyện</h1>
        <p>
          Tạo tài khoản hội viên, chọn huấn luyện viên phù hợp và sẵn sàng sử dụng đầy đủ hệ sinh thái RubyGYM.
        </p>
        <div className="auth-hints">
          <strong>Quyền lợi nổi bật</strong>
          <p>Đặt lịch tập, theo dõi kết quả và nhận ưu đãi từ chương trình giới thiệu bạn bè.</p>
        </div>
      </div>

      <div className="page-card auth-card">
        <h1>Tạo tài khoản hội viên</h1>
        <p className="section-subtitle">Điền thông tin bên dưới để bắt đầu sử dụng RubyGYM.</p>
        <form className="form-grid single-column" onSubmit={handleSubmit}>
          <label>
            Họ tên
            <input name="full_name" value={formData.full_name} onChange={handleChange} required />
          </label>
          <label>
            Số điện thoại
            <input name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Mật khẩu
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
          <label>
            Chọn huấn luyện viên
            <select name="trainer_id" value={formData.trainer_id} onChange={handleChange}>
              <option value="">Để admin phân công sau</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>
                  {trainer.full_name} {trainer.specialization ? `- ${trainer.specialization}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Mã giới thiệu
            <input
              name="referral_code"
              value={formData.referral_code}
              onChange={handleChange}
              placeholder="Ví dụ: RUBY-15"
            />
          </label>
          {message ? <p className="success-text">{message}</p> : null}
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary-button">
            <FiCheck />
            Tạo tài khoản
          </button>
          <button type="button" className="ghost-button" onClick={() => navigate('/login')}>
            <FiArrowLeft />
            Quay lại đăng nhập
          </button>
        </form>
      </div>
    </section>
  );
}

export default RegisterForm;
