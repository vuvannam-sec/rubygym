import { FiActivity, FiClock, FiUsers } from 'react-icons/fi';
import { trainerStats, trainerMembers } from '../../data/mockData';
import { MetricCard, SectionHeader } from '../Layout/ProductUI';

function TrainerDashboard() {
  const statIcons = {
    'Số học viên': <FiUsers />,
    'Buổi tập hôm nay': <FiActivity />,
    'Giờ làm hôm nay': <FiClock />
  };

  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Trainer workspace"
        title="Tổng quan huấn luyện"
        subtitle="Ưu tiên lịch hôm nay, theo dõi mức độ tuân thủ và quản lý tiến độ của học viên."
      />
      <div className="stats-grid">
        {trainerStats.map((stat) => (
          <MetricCard key={stat.label} icon={statIcons[stat.label]} label={stat.label} value={stat.value} caption={stat.caption} />
        ))}
      </div>
      <article className="dashboard-panel">
        <div className="panel-heading">
          <div>
            <h3>Học viên cần theo dõi sát</h3>
            <p>Danh sách ưu tiên cho buổi tư vấn và đánh giá kế tiếp.</p>
          </div>
        </div>
        <div className="priority-grid">
          {trainerMembers.map((member) => (
            <div key={member.id} className="priority-card">
              <strong>{member.name}</strong>
              <p>Mục tiêu: {member.goal}</p>
              <p>Lần tập tiếp theo: {member.nextSession}</p>
              <span>Tỷ lệ tuân thủ {member.adherence}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default TrainerDashboard;
