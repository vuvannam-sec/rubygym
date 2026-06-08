import { useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { trainers as fallbackTrainers } from '../../data/mockData';
import BrandLogo from '../Layout/BrandLogo';

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const redirectTimerRef = useRef(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    current_weight: '',
    height_cm: '',
    trainer_id: '',
    referral_code: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        current_weight: formData.current_weight ? Number(formData.current_weight) : null,
        height_cm: formData.height_cm ? Number(formData.height_cm) : null,
        trainer_id: formData.trainer_id || null
      });

      const successToast = {
        type: 'success',
        title: 'Đăng ký thành công',
        message: `Tài khoản ${formData.email} đã được tạo. Hãy đăng nhập để chọn gói tập và hoàn tất hồ sơ ban đầu.`
      };

      setMessage(successToast.message);
      redirectTimerRef.current = window.setTimeout(() => {
        navigate('/login', { state: { flashToast: successToast }, replace: true });
      }, 900);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Không đăng ký được.');
      setLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel auth-panel-brand">
        <BrandLogo to="/" light subtitle="Member onboarding" />
        <h1>Đăng ký hội viên RubyGYM</h1>
        <p>
          Tạo tài khoản hội viên để vào hệ thống. Bạn có thể khai báo chỉ số ban đầu và chọn huấn luyện viên mong muốn.
        </p>
        <div className="auth-hints">
          <strong>Quyền lợi nổi bật</strong>
          <p>Đặt lịch tập, theo dõi kết quả và nhận ưu đãi từ chương trình giới thiệu bạn bè.</p>
        </div>
      </div>

      <div className="page-card auth-card">
        <h1>Tạo tài khoản hội viên</h1>
        <p className="section-subtitle">Điền thông tin cơ bản và chỉ số cơ thể. Sau khi đăng nhập, hệ thống sẽ đưa bạn tới bước chọn gói tập và hoàn tất hồ sơ ban đầu.</p>
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
            Cân nặng hiện tại (kg)
            <input
              type="number"
              name="current_weight"
              value={formData.current_weight}
              onChange={handleChange}
              min="20"
              max="350"
              step="0.1"
              inputMode="decimal"
              placeholder="Ví dụ: 68.5"
              required
            />
          </label>
          <label>
            Chiều cao (cm)
            <input
              type="number"
              name="height_cm"
              value={formData.height_cm}
              onChange={handleChange}
              min="100"
              max="250"
              step="0.1"
              inputMode="decimal"
              placeholder="Ví dụ: 172"
              required
            />
          </label>
          <label>
            Email
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Mật khẩu
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
          <label>
            Chọn huấn luyện viên (không bắt buộc)
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
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? <FiSave /> : <FiCheck />}
            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
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
