import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiClock, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, MetricCard, SectionHeader, Toast } from '../Layout/ProductUI';

const todayString = () => new Date().toISOString().slice(0, 10);

const getDurationHours = (session) => {
  const [startHours, startMinutes] = String(session.start_time || '00:00').split(':').map(Number);
  const [endHours, endMinutes] = String(session.end_time || '00:00').split(':').map(Number);
  return Math.max(0, ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)) / 60);
};

function TrainerDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const statIcons = {
    'Số học viên': <FiUsers />,
    'Buổi tập hôm nay': <FiActivity />,
    'Giờ làm hôm nay': <FiClock />
  };

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.trainer_id) {
        setLoading(false);
        return;
      }

      try {
        const [memberResponse, scheduleResponse] = await Promise.all([
          api.get(`/trainers/${user.trainer_id}/clients`),
          api.get(`/schedule/trainer/${user.trainer_id}`)
        ]);
        setMembers(memberResponse.data);
        setSessions(scheduleResponse.data);
      } catch (error) {
        setMembers([]);
        setSessions([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được dữ liệu huấn luyện',
          message: normalizeApiError(error, 'Backend chưa trả về dữ liệu học viên/lịch tập.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  const todaySessions = useMemo(() => {
    const today = todayString();
    return sessions.filter((session) => String(session.session_date).slice(0, 10) === today);
  }, [sessions]);

  const stats = [
    {
      label: 'Số học viên',
      value: members.length,
      caption: members.length ? 'Đang được phân công' : 'Chưa có học viên'
    },
    {
      label: 'Buổi tập hôm nay',
      value: todaySessions.length,
      caption: todaySessions.length ? 'Theo lịch backend' : 'Chưa có lịch hôm nay'
    },
    {
      label: 'Giờ làm hôm nay',
      value: `${todaySessions.reduce((total, session) => total + getDurationHours(session), 0).toFixed(1)}h`,
      caption: 'Giới hạn nghiệp vụ: tối đa 8h/ngày'
    }
  ];

  const priorityMembers = members.filter((member) => !member.goal_type || !member.target_weight || !member.target_bmi).slice(0, 4);

  if (loading) {
    return <LoadingPanel label="Đang tải tổng quan huấn luyện..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Huấn luyện viên / Tổng quan"
        title="Tổng quan huấn luyện"
        subtitle="Ưu tiên lịch hôm nay, theo dõi mức độ tuân thủ và quản lý tiến độ của học viên."
      />
      <div className="stats-grid">
        {stats.map((stat) => (
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
        {priorityMembers.length ? (
          <div className="priority-grid">
            {priorityMembers.map((member) => (
              <div key={member.id} className="priority-card">
                <strong>{member.full_name}</strong>
                <p>Mục tiêu: {member.goal_type || 'Chưa có mục tiêu'}</p>
                <p>Chỉ số mục tiêu: {[member.target_weight ? `${member.target_weight} kg` : null, member.target_bmi ? `BMI ${member.target_bmi}` : null].filter(Boolean).join(' / ') || 'Chưa định lượng'}</p>
                <span>Cần hoàn thiện hồ sơ tập luyện</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FiUsers />}
            title="Không có học viên cần nhắc hồ sơ"
            description="Các học viên được phân công hiện đã có mục tiêu định lượng hoặc danh sách đang trống."
          />
        )}
      </article>
    </section>
  );
}

export default TrainerDashboard;
