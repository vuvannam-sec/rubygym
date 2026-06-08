import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiBell, FiCreditCard, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, MetricCard, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const planLabels = {
  QUARTERLY: 'Gói 3 tháng',
  SEMI_ANNUAL: 'Gói 6 tháng',
  ANNUAL: 'Gói 12 tháng'
};

const formatDate = (value) => (value ? String(value).slice(0, 10) : '—');

function AdminDashboard() {
  const [data, setData] = useState({ members: [], trainers: [], subscriptions: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [members, trainers, subscriptions, events] = await Promise.all([
          api.get('/members'),
          api.get('/trainers'),
          api.get('/subscriptions'),
          api.get('/events')
        ]);
        setData({
          members: members.data || [],
          trainers: trainers.data || [],
          subscriptions: subscriptions.data || [],
          events: events.data || []
        });
      } catch (error) {
        setToast({
          type: 'error',
          title: 'Chưa tải được số liệu vận hành',
          message: normalizeApiError(error, 'Không kết nối được backend. Số liệu sẽ hiển thị khi có dữ liệu thật.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const stats = useMemo(() => {
    const activeSubs = data.subscriptions.filter((sub) => sub.status === 'ACTIVE');
    const loyalCount = data.members.filter((member) => member.is_loyal).length;
    return [
      { label: 'Tổng hội viên', value: String(data.members.length), caption: `${loyalCount} hội viên thân thiết`, icon: <FiUsers /> },
      { label: 'Huấn luyện viên', value: String(data.trainers.length), caption: 'Đang phụ trách hội viên', icon: <FiActivity /> },
      { label: 'Gói đang hoạt động', value: String(activeSubs.length), caption: `${data.subscriptions.length} gói tổng cộng`, icon: <FiCreditCard /> },
      { label: 'Sự kiện', value: String(data.events.length), caption: 'Đang quảng bá trên trang chủ', icon: <FiBell /> }
    ];
  }, [data]);

  const latestMembers = useMemo(
    () => [...data.members]
      .sort((a, b) => new Date(b.join_date) - new Date(a.join_date))
      .slice(0, 5),
    [data.members]
  );

  const planDistribution = useMemo(() => {
    const counts = data.subscriptions.reduce((acc, sub) => {
      acc[sub.plan_type] = (acc[sub.plan_type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(planLabels).map(([key, label]) => ({ label, count: counts[key] || 0 }));
  }, [data.subscriptions]);

  if (loading) {
    return <LoadingPanel label="Đang tải tổng quan vận hành..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Quản trị / Tổng quan"
        title="Tổng quan vận hành"
        subtitle="Số liệu theo thời gian thực về hội viên, huấn luyện viên, gói tập và sự kiện của trung tâm."
      />
      <div className="stats-grid">
        {stats.map((stat) => (
          <MetricCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Hội viên mới tham gia</h3>
              <p>5 hội viên đăng ký gần đây nhất.</p>
            </div>
          </div>
          {latestMembers.length ? (
            <div className="activity-list">
              {latestMembers.map((member) => (
                <div key={member.id} className="activity-item">
                  <div>
                    <strong>{member.full_name}</strong>
                    <p>Tham gia {formatDate(member.join_date)}{member.trainer_name ? ` · HLV ${member.trainer_name}` : ''}</p>
                  </div>
                  <StatusBadge tone={member.is_loyal ? 'success' : 'neutral'}>
                    {member.is_loyal ? 'Thân thiết' : 'Hội viên'}
                  </StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FiUsers />} title="Chưa có hội viên" description="Hội viên mới sẽ xuất hiện ở đây sau khi đăng ký." />
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Phân bổ gói tập</h3>
              <p>Số lượng gói theo từng kỳ hạn.</p>
            </div>
          </div>
          <div className="insight-list">
            {planDistribution.map((row) => (
              <div key={row.label} className="insight-item">
                <span>{row.label}</span>
                <strong>{row.count} gói</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;
