import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiCreditCard, FiTarget, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { LoadingPanel, MetricCard, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';
import { useAuth } from '../../context/AuthContext';

const planLabels = {
  QUARTERLY: 'Gói 3 tháng',
  SEMI_ANNUAL: 'Gói 6 tháng',
  ANNUAL: 'Gói 12 tháng'
};

const subscriptionStatusLabels = {
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy'
};

const formatWeight = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} kg`;
};

const formatHeight = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} cm`;
};

const calculateBmi = (weight, heightCm) => {
  const numericWeight = Number(weight);
  const numericHeight = Number(heightCm);

  if (!numericWeight || !numericHeight) {
    return null;
  }

  const heightInMeters = numericHeight / 100;
  return Number((numericWeight / (heightInMeters * heightInMeters)).toFixed(2));
};

function MemberDashboard() {
  const statIcons = {
    'Cân nặng hiện tại': <FiActivity />,
    'BMI hiện tại': <FiTarget />,
    'Gói hiện tại': <FiCreditCard />,
    'Huấn luyện viên phụ trách': <FiUsers />,
    'Trạng thái hội viên': <FiActivity />
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
          trainer_name: user?.trainer_name || '',
          trainer_email: user?.trainer_email || '',
          trainer_phone: user?.trainer_phone || '',
          current_weight: user?.current_weight || null,
          height_cm: user?.height_cm || null,
          is_loyal: false
        });
        setSubscriptions([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được dữ liệu hội viên',
          message: normalizeApiError(error, 'Backend chưa sẵn sàng, hệ thống sẽ giữ trạng thái trống cho tới khi có dữ liệu.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const activeSubscription = useMemo(() => subscriptions[0] || null, [subscriptions]);
  const currentPlanLabel = activeSubscription ? (planLabels[activeSubscription.plan_type] || activeSubscription.plan_type) : 'Chưa có gói tập';
  const currentWeight = profile?.current_weight ?? user?.current_weight ?? null;
  const heightCm = profile?.height_cm ?? user?.height_cm ?? null;
  const currentBmi = profile?.current_bmi ?? user?.current_bmi ?? calculateBmi(currentWeight, heightCm);
  const trainerName = profile?.trainer_name || user?.trainer_name || 'Chưa phân công';
  const trainerContact = profile?.trainer_phone || user?.trainer_phone || 'Chưa có thông tin liên hệ';
  const membershipState = profile?.is_loyal
    ? 'Hội viên thân thiết'
    : (activeSubscription ? (subscriptionStatusLabels[activeSubscription.status] || 'Đang hoạt động') : 'Chưa kích hoạt');
  const needsOnboarding = user?.onboarding_completed === false || !activeSubscription || currentWeight === null || heightCm === null;

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
      {needsOnboarding ? (
        <article className="onboarding-callout">
          <div>
            <strong>Hồ sơ hội viên chưa hoàn tất</strong>
            <p>Hãy cập nhật chỉ số cơ thể, chọn gói tập và xác nhận HLV mong muốn để bắt đầu theo dõi lịch tập. Mục tiêu tập luyện đặt riêng ở trang Mục tiêu.</p>
          </div>
          <Link to="/member/onboarding" className="primary-button">
            Hoàn tất hồ sơ
            <FiArrowRight />
          </Link>
        </article>
      ) : null}
      <div className="stats-grid">
        {[
          {
            label: 'Cân nặng hiện tại',
            value: formatWeight(currentWeight),
            caption: heightCm ? `Chiều cao ${formatHeight(heightCm)}` : 'Có thể cập nhật lại trong hồ sơ ban đầu'
          },
          {
            label: 'BMI hiện tại',
            value: currentBmi ? currentBmi : 'Chưa tính',
            caption: currentBmi ? 'Tính từ cân nặng và chiều cao hiện tại' : 'Cần đủ cân nặng và chiều cao'
          },
          {
            label: 'Gói hiện tại',
            value: currentPlanLabel,
            caption: activeSubscription
              ? `Hiệu lực đến ${activeSubscription.end_date || 'chưa xác định'}`
              : 'Chưa có gói tập'
          },
          {
            label: 'Huấn luyện viên phụ trách',
            value: trainerName,
            caption: trainerContact
          },
          {
            label: 'Trạng thái hội viên',
            value: membershipState,
            caption: profile?.is_loyal ? 'Đã đủ điều kiện loyal' : 'Đang chờ kích hoạt hoặc gia hạn'
          }
        ].map((stat) => (
          <MetricCard key={stat.label} icon={statIcons[stat.label]} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>
      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Gói tập hiện tại</h3>
            <p>Thông tin gói đang sử dụng và các quyền lợi đang kích hoạt.</p>
          </div>
          <StatusBadge tone={profile?.is_loyal ? 'success' : (activeSubscription ? 'info' : 'warning')}>
            {membershipState}
          </StatusBadge>
        </div>
        <div className="plan-summary">
          <div>
            <strong>{currentPlanLabel}</strong>
            <p>Huấn luyện viên: {trainerName}</p>
            <p>
              Hiệu lực: {activeSubscription?.start_date || 'Chưa có'} - {activeSubscription?.end_date || 'Chưa có'}
            </p>
          </div>
          <div>
            <strong>{trainerContact}</strong>
            <p>Liên hệ huấn luyện viên</p>
          </div>
          <div>
            <strong>{profile?.is_loyal ? '+3 tháng khi gia hạn 1 năm' : 'Chưa áp dụng'}</strong>
            <p>{profile?.is_loyal ? 'Ưu đãi loyal hiện có' : 'Ưu đãi loyal'}</p>
          </div>
        </div>
      </article>
    </section>
  );
}

export default MemberDashboard;
