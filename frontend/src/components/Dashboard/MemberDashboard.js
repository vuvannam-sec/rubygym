import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiCalendar, FiCreditCard, FiUsers } from 'react-icons/fi';
import { memberPlan, memberStats } from '../../data/mockData';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { LoadingPanel, MetricCard, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';
import { useAuth } from '../../context/AuthContext';

function MemberDashboard() {
  const statIcons = {
    'Gói hiện tại': <FiCreditCard />,
    'Buổi tiếp theo': <FiCalendar />,
    'Huấn luyện viên phụ trách': <FiUsers />,
    'Tiến độ 90 ngày': <FiActivity />
  };

  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.member_id) {
        setLoading(false);
        return;
      }

      try {
        const [profileResponse, subscriptionResponse] = await Promise.all([
          api.get(`/members/${user.member_id}`),
          api.get('/subscriptions')
        ]);
        setProfile(profileResponse.data);
        setSubscriptions(subscriptionResponse.data);
      } catch (error) {
        setProfile({
          trainer_name: user?.trainer_name || memberPlan.trainer,
          trainer_email: user?.trainer_email || 'trainer@rubygym.com',
          trainer_phone: user?.trainer_phone || '0900000000',
          is_loyal: false
        });
        setSubscriptions([]);
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Backend chưa sẵn sàng, RubyGYM đang dùng dữ liệu dự phòng.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const activeSubscription = useMemo(() => subscriptions[0] || null, [subscriptions]);

  if (loading) {
    return <LoadingPanel label="Đang tải tổng quan hội viên..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member dashboard"
        title="Tổng quan hành trình luyện tập"
        subtitle="Theo dõi gói tập hiện tại, lịch tập kế tiếp và các mốc tiến bộ mới nhất."
      />
      <div className="stats-grid">
        {[...memberStats.slice(0, 2), {
          label: 'Huấn luyện viên phụ trách',
          value: profile?.trainer_name || user?.trainer_name || 'Chưa phân công',
          caption: profile?.trainer_email || 'Admin sẽ phân công sau'
        }].map((stat) => (
          <MetricCard key={stat.label} icon={statIcons[stat.label]} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>
      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Gói tập hiện tại</h3>
            <p>Thông tin gói đang sử dụng và các quyền lợi đang kích hoạt.</p>
          </div>
          <StatusBadge tone={profile?.is_loyal ? 'success' : 'info'}>
            {profile?.is_loyal ? 'Hội viên thân thiết' : (activeSubscription?.status || memberPlan.status)}
          </StatusBadge>
        </div>
        <div className="plan-summary">
          <div>
            <strong>{activeSubscription?.plan_type || memberPlan.name}</strong>
            <p>Huấn luyện viên: {profile?.trainer_name || memberPlan.trainer || 'Chưa phân công'}</p>
            <p>
              Hiệu lực: {activeSubscription?.start_date || memberPlan.startedAt} - {activeSubscription?.end_date || memberPlan.expiresAt}
            </p>
          </div>
          <div>
            <strong>{profile?.trainer_phone || memberPlan.sessionsLeft}</strong>
            <p>{profile?.trainer_phone ? 'Liên hệ huấn luyện viên' : 'Còn lại trong chu kỳ hiện tại'}</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default MemberDashboard;
