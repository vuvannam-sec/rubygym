import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const planLabels = {
  QUARTERLY: 'Gói 3 tháng',
  SEMI_ANNUAL: 'Gói 6 tháng',
  ANNUAL: 'Gói 12 tháng'
};

const monthLabel = new Intl.DateTimeFormat('vi-VN', { month: '2-digit', year: 'numeric' }).format(new Date());
const daysUntil = (value) => Math.ceil((new Date(value) - new Date()) / (1000 * 60 * 60 * 24));

function AdminReports() {
  const [members, setMembers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [membersRes, subsRes] = await Promise.all([
          api.get('/members'),
          api.get('/subscriptions')
        ]);
        setMembers(membersRes.data || []);
        setSubscriptions(subsRes.data || []);
      } catch (error) {
        setToast({
          type: 'error',
          title: 'Chưa tải được báo cáo',
          message: normalizeApiError(error, 'Không kết nối được backend. Báo cáo sẽ hiển thị khi có dữ liệu thật.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const kpis = useMemo(() => {
    const total = members.length;
    const loyal = members.filter((m) => m.is_loyal).length;
    const active = subscriptions.filter((s) => s.status === 'ACTIVE').length;
    const annual = subscriptions.filter((s) => s.plan_type === 'ANNUAL').length;
    const loyalRate = total ? Math.round((loyal / total) * 100) : 0;
    return [
      { metric: 'Tổng hội viên', value: String(total) },
      { metric: 'Hội viên thân thiết', value: `${loyal} (${loyalRate}%)` },
      { metric: 'Gói đang hoạt động', value: String(active) },
      { metric: 'Gói 12 tháng', value: String(annual) }
    ];
  }, [members, subscriptions]);

  const expiringSoon = useMemo(
    () => subscriptions
      .filter((s) => s.status === 'ACTIVE' && s.end_date)
      .map((s) => ({ ...s, days: daysUntil(s.end_date) }))
      .filter((s) => s.days >= 0 && s.days <= 30)
      .sort((a, b) => a.days - b.days),
    [subscriptions]
  );

  if (loading) {
    return <LoadingPanel label="Đang tổng hợp báo cáo..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Quản trị / Thống kê"
        title="Báo cáo kinh doanh"
        subtitle="Các chỉ số được tính trực tiếp từ dữ liệu hội viên và gói tập hiện tại."
      />

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Chỉ số tháng {monthLabel}</h3>
              <p>Tổng hợp nhanh từ dữ liệu hiện hành.</p>
            </div>
            <StatusBadge tone="info">Realtime</StatusBadge>
          </div>
          <div className="report-grid">
            {kpis.map((row) => (
              <div key={row.metric} className="report-item">
                <span>{row.metric}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Gói sắp hết hạn (≤ 30 ngày)</h3>
              <p>Ưu tiên liên hệ gia hạn để giữ chân hội viên.</p>
            </div>
            <StatusBadge tone={expiringSoon.length ? 'warning' : 'success'}>{expiringSoon.length} gói</StatusBadge>
          </div>
          {expiringSoon.length ? (
            <div className="insight-list">
              {expiringSoon.slice(0, 6).map((sub) => (
                <div key={sub.id} className="insight-item">
                  <span>{sub.member_name} · {planLabels[sub.plan_type] || sub.plan_type}</span>
                  <strong>còn {sub.days} ngày</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<FiBarChart2 />} title="Không có gói sắp hết hạn" description="Mọi gói hiện đều còn hiệu lực trên 30 ngày." />
          )}
        </article>
      </div>
    </section>
  );
}

export default AdminReports;
