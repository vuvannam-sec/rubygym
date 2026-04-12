import { FiActivity, FiCreditCard, FiDollarSign, FiUsers } from 'react-icons/fi';
import { adminStats, recentActivities } from '../../data/mockData';
import { MetricCard, SectionHeader, StatusBadge } from '../Layout/ProductUI';

function AdminDashboard() {
  const statIcons = {
    'Tổng hội viên': <FiUsers />,
    'HLV đang hoạt động': <FiActivity />,
    'Gói tập active': <FiCreditCard />,
    'Doanh thu tháng': <FiDollarSign />
  };

  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Admin dashboard"
        title="Tổng quan vận hành"
        subtitle="Theo dõi sức khỏe kinh doanh, trạng thái hệ thống và các hoạt động mới nhất của phòng gym."
      />
      <div className="stats-grid">
        {adminStats.map((stat) => (
          <MetricCard key={stat.label} icon={statIcons[stat.label]} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Hoạt động gần đây</h3>
              <p>Dòng công việc mới nhất từ vận hành và đội ngũ chăm sóc hội viên.</p>
            </div>
            <StatusBadge tone="success">Đang ổn định</StatusBadge>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-dot tone-${activity.tone}`} />
                <div>
                  <strong>{activity.title}</strong>
                  <p>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Tín hiệu nổi bật</h3>
              <p>Những chỉ số cần ưu tiên trong 7 ngày tiếp theo.</p>
            </div>
          </div>
          <div className="insight-list">
            <div className="insight-item">
              <span>Khung giờ 18:00 - 20:00</span>
              <strong>Đạt 94% công suất</strong>
            </div>
            <div className="insight-item">
              <span>Gia hạn sắp tới</span>
              <strong>16 hội viên trong 10 ngày</strong>
            </div>
            <div className="insight-item">
              <span>Hiệu suất chuyển đổi lead</span>
              <strong>31% từ gói dùng thử</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboard;
