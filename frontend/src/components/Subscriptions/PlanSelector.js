import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiSave } from 'react-icons/fi';
import { memberPlan } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function PlanSelector() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    plan_type: 'QUARTERLY',
    start_date: ''
  });
  const [toast, setToast] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoyal, setIsLoyal] = useState(false);

  useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user?.member_id) {
        return;
      }

      try {
        const [subscriptionResponse, profileResponse] = await Promise.all([
          api.get('/subscriptions'),
          api.get(`/members/${user.member_id}`)
        ]);
        setSubscriptions(subscriptionResponse.data);
        setIsLoyal(Boolean(profileResponse.data.is_loyal));
      } catch (error) {
        setSubscriptions([]);
      }
    };

    loadSubscriptions();
  }, [user]);

  const activeSubscription = useMemo(() => subscriptions[0] || null, [subscriptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.start_date) {
      setToast({ type: 'error', title: 'Thiếu ngày bắt đầu', message: 'Vui lòng chọn ngày kích hoạt gói tập.' });
      return;
    }

    try {
      const { data } = await api.post('/subscriptions', {
        member_id: user?.member_id,
        plan_type: formData.plan_type,
        start_date: formData.start_date
      });
      setToast({
        type: 'success',
        title: 'Đã lưu gói tập',
        message: `Hạn mới của bạn là ${data.end_date}. Thời gian miễn phí được cộng thêm: ${data.free_extension_months} tháng.`
      });
      setSubscriptions((current) => [{
        id: data.subscriptionId,
        member_id: user?.member_id,
        plan_type: formData.plan_type,
        start_date: formData.start_date,
        end_date: data.end_date,
        status: 'ACTIVE'
      }, ...current]);
      setIsLoyal(Boolean(data.is_loyal));
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không thể cập nhật gói tập',
        message: normalizeApiError(error, 'Backend chưa sẵn sàng để xử lý yêu cầu gói tập.')
      });
    }
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member / Gói tập"
        title="Gói tập của bạn"
        subtitle="Xem nhanh trạng thái hiện tại và gửi yêu cầu nâng cấp hoặc gia hạn ngay trong ứng dụng."
      />

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>{activeSubscription?.plan_type || memberPlan.name}</h3>
              <p>Huấn luyện viên đồng hành: {user?.trainer_name || memberPlan.trainer}</p>
            </div>
            <StatusBadge tone={isLoyal ? 'success' : 'info'}>
              {isLoyal ? 'Hội viên thân thiết' : (activeSubscription?.status || memberPlan.status)}
            </StatusBadge>
          </div>
          <div className="plan-summary">
            <div>
              <strong>{activeSubscription?.start_date || memberPlan.startedAt}</strong>
              <p>Ngày kích hoạt</p>
            </div>
            <div>
              <strong>{activeSubscription?.end_date || memberPlan.expiresAt}</strong>
              <p>Ngày hết hạn</p>
            </div>
            <div>
              <strong>{isLoyal ? '+3 tháng khi gia hạn' : memberPlan.sessionsLeft}</strong>
              <p>{isLoyal ? 'Ưu đãi loyal hiện có' : 'Buổi còn lại'}</p>
            </div>
          </div>
          <div className="perks-list">
            {memberPlan.perks.map((perk) => (
              <div key={perk} className="perk-item">
                <span><FiCheck /></span>
                <p>{perk}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Gia hạn hoặc nâng cấp</h3>
              <p>Chọn gói phù hợp với mục tiêu tập luyện tiếp theo của bạn.</p>
            </div>
          </div>
          <form className="form-grid single-column" onSubmit={handleSubmit}>
            <label>
              Gói mong muốn
              <select name="plan_type" value={formData.plan_type} onChange={handleChange}>
                <option value="QUARTERLY">Quý</option>
                <option value="SEMI_ANNUAL">6 tháng</option>
                <option value="ANNUAL">1 năm</option>
              </select>
            </label>
            <label>
              Ngày bắt đầu
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
            </label>
            <button type="submit" className="primary-button">
              <FiSave />
              Gửi yêu cầu
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default PlanSelector;
