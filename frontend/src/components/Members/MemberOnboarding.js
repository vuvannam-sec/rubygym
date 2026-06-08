import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiArrowRight, FiCheck, FiCreditCard, FiSave, FiTarget, FiUserCheck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { LoadingPanel, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const planLabels = {
  QUARTERLY: 'Gói 3 tháng',
  SEMI_ANNUAL: 'Gói 6 tháng',
  ANNUAL: 'Gói 12 tháng'
};

const todayString = () => new Date().toISOString().slice(0, 10);
const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

const calculateBmi = (weight, heightCm) => {
  const numericWeight = Number(weight);
  const numericHeight = Number(heightCm);

  if (!numericWeight || !numericHeight) {
    return null;
  }

  const heightInMeters = numericHeight / 100;
  return Number((numericWeight / (heightInMeters * heightInMeters)).toFixed(2));
};

function MemberOnboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [missingSteps, setMissingSteps] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    current_weight: user?.current_weight || '',
    height_cm: user?.height_cm || '',
    trainer_id: user?.trainer_id || '',
    plan_type: 'QUARTERLY',
    start_date: todayString()
  });

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const { data } = await api.get('/members/me/onboarding');
        setCompleted(Boolean(data.completed));
        setMissingSteps(data.missing_steps || []);
        setTrainers(data.trainers || []);
        setFormData({
          current_weight: data.member?.current_weight ?? user?.current_weight ?? '',
          height_cm: data.member?.height_cm ?? user?.height_cm ?? '',
          trainer_id: data.member?.trainer_id ?? user?.trainer_id ?? '',
          plan_type: data.subscription?.plan_type || 'QUARTERLY',
          start_date: dateOnly(data.subscription?.start_date) || todayString()
        });
      } catch (error) {
        setToast({
          type: 'error',
          title: 'Không tải được hồ sơ ban đầu',
          message: normalizeApiError(error, 'Vui lòng kiểm tra backend trước khi hoàn tất onboarding.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadOnboarding();
  }, [user]);

  const currentBmi = useMemo(
    () => calculateBmi(formData.current_weight, formData.height_cm),
    [formData.current_weight, formData.height_cm]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        current_weight: Number(formData.current_weight),
        height_cm: Number(formData.height_cm),
        trainer_id: formData.trainer_id || null,
        plan_type: formData.plan_type,
        start_date: formData.start_date
      };

      const { data } = await api.put('/members/me/onboarding', payload);
      setCompleted(true);
      setMissingSteps([]);
      setToast({
        type: 'success',
        title: 'Đã hoàn tất hồ sơ ban đầu',
        message: `Gói ${planLabels[data.subscription.plan_type] || data.subscription.plan_type} có hiệu lực đến ${data.subscription.end_date}.`
      });

      await refreshProfile?.();
      window.setTimeout(() => navigate('/member'), 700);
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không lưu được onboarding',
        message: normalizeApiError(error, 'Vui lòng kiểm tra lại chỉ số cơ thể và gói tập.')
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingPanel label="Đang tải hồ sơ hội viên ban đầu..." />;
  }

  return (
    <section className="page-card onboarding-page">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member onboarding"
        title="Hoàn tất hồ sơ hội viên"
        subtitle="Hội viên mới cần có chỉ số cơ thể và gói tập trước khi dashboard hiển thị như một hồ sơ đang vận hành. Mục tiêu tập luyện được đặt riêng ở trang Mục tiêu."
        actions={<StatusBadge tone={completed ? 'success' : 'warning'}>{completed ? 'Đã hoàn tất' : 'Cần bổ sung'}</StatusBadge>}
      />

      <div className="onboarding-steps">
        {[
          { key: 'PROFILE_METRICS', icon: <FiActivity />, title: 'Chỉ số ban đầu', text: currentBmi ? `BMI hiện tại ${currentBmi}` : 'Cân nặng và chiều cao' },
          { key: 'SUBSCRIPTION', icon: <FiCreditCard />, title: 'Gói tập', text: planLabels[formData.plan_type] }
        ].map((step, index) => (
          <article key={step.key} className={`step-card ${missingSteps.includes(step.key) ? 'step-missing' : 'step-ready'}`}>
            <span className="step-index">{index + 1}</span>
            <div className="step-icon">{step.icon}</div>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <form className="onboarding-form" onSubmit={handleSubmit}>
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Chỉ số cơ thể</h3>
              <p>Cân nặng và chiều cao dùng làm baseline cho đánh giá tháng.</p>
            </div>
            <StatusBadge tone={currentBmi ? 'info' : 'warning'}>{currentBmi ? `BMI ${currentBmi}` : 'Chưa đủ dữ liệu'}</StatusBadge>
          </div>
          <div className="form-grid">
            <label>
              Cân nặng hiện tại (kg)
              <input type="number" name="current_weight" min="20" max="350" step="0.1" value={formData.current_weight} onChange={handleChange} required />
            </label>
            <label>
              Chiều cao (cm)
              <input type="number" name="height_cm" min="100" max="250" step="0.1" value={formData.height_cm} onChange={handleChange} required />
            </label>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Gói tập và HLV</h3>
              <p>Chọn gói thanh toán ban đầu; HLV có thể chọn ngay hoặc để trung tâm phân công.</p>
            </div>
            <FiUserCheck className="panel-icon" />
          </div>
          <div className="form-grid">
            <label>
              Gói tập
              <select name="plan_type" value={formData.plan_type} onChange={handleChange}>
                <option value="QUARTERLY">Gói 3 tháng</option>
                <option value="SEMI_ANNUAL">Gói 6 tháng</option>
                <option value="ANNUAL">Gói 12 tháng</option>
              </select>
            </label>
            <label>
              Ngày bắt đầu
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </label>
            <label className="full-width">
              Huấn luyện viên mong muốn
              <select name="trainer_id" value={formData.trainer_id || ''} onChange={handleChange}>
                <option value="">Để trung tâm phân công sau</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.full_name} {trainer.specialization ? `- ${trainer.specialization}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>

        <article className="onboarding-callout">
          <div>
            <strong>Bước tiếp theo: đặt mục tiêu tập luyện</strong>
            <p>Sau khi hoàn tất hồ sơ, hãy mở trang Mục tiêu để tự đặt cân nặng/BMI mong muốn. Huấn luyện viên sẽ dùng mục tiêu đó khi đánh giá hằng tháng.</p>
          </div>
          <Link to="/member/goals" className="ghost-button">
            <FiTarget />
            Tới trang Mục tiêu
          </Link>
        </article>

        <div className="onboarding-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? <FiSave /> : <FiCheck />}
            {saving ? 'Đang lưu hồ sơ...' : 'Lưu và vào dashboard'}
          </button>
          {completed ? (
            <Link to="/member/goals" className="ghost-button">
              Đặt mục tiêu ngay
              <FiArrowRight />
            </Link>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default MemberOnboarding;
