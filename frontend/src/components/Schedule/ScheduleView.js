import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { memberWeeklySchedule, trainerWeeklySchedule, weeklyDays, weeklySlots } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import CreateSession from './CreateSession';
import { EmptyState, LoadingPanel, SectionHeader, Toast } from '../Layout/ProductUI';

function ScheduleView({ variant = 'trainer' }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const endpoint = variant === 'trainer'
          ? `/schedule/trainer/${user?.trainer_id}`
          : `/schedule/member/${user?.member_id}`;

        if (!(variant === 'trainer' ? user?.trainer_id : user?.member_id)) {
          setLoading(false);
          return;
        }

        const { data } = await api.get(endpoint);
        setSessions(data);
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được lịch tập từ backend.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [user, variant]);

  const schedule = useMemo(() => {
    const base = variant === 'trainer'
      ? JSON.parse(JSON.stringify(trainerWeeklySchedule))
      : JSON.parse(JSON.stringify(memberWeeklySchedule));

    sessions.forEach((session) => {
      const date = new Date(session.session_date);
      const weekDay = weeklyDays[date.getDay() === 0 ? 5 : date.getDay() - 1];
      const slot = String(session.start_time).slice(0, 5);

      if (weekDay && base[slot]) {
        base[slot][weekDay] = variant === 'trainer'
          ? `${session.session_type || 'Buổi tập'}: ${session.members || 'Chưa có hội viên'}`
          : `${session.session_type || 'Buổi tập'} với ${session.trainer_name || user?.trainer_name || 'HLV'}`;
      }
    });

    return base;
  }, [sessions, user, variant]);

  if (loading) {
    return <LoadingPanel label="Đang tải lịch tập..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow={variant === 'trainer' ? 'Trainer / Lịch tập' : 'Member / Lịch tập'}
        title={variant === 'trainer' ? 'Lịch tập theo tuần' : 'Lịch tập của tôi'}
        subtitle="Hiển thị theo khung giờ và ngày trong tuần để bạn dễ dàng theo dõi công suất và buổi tập sắp tới."
      />
      <div className="table-wrapper">
        <table className="calendar-table">
          <thead>
            <tr>
              <th>Khung giờ</th>
              {weeklyDays.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklySlots.map((slot) => (
              <tr key={slot}>
                <td>{slot}</td>
                {weeklyDays.map((day) => (
                  <td key={`${slot}-${day}`}>
                    {schedule[slot][day] ? <div className="calendar-session">{schedule[slot][day]}</div> : <span className="calendar-empty">Trống</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Loại buổi</th>
                <th>{variant === 'trainer' ? 'Hội viên' : 'Huấn luyện viên'}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{String(session.session_date).slice(0, 10)}</td>
                  <td>{String(session.start_time).slice(0, 5)} - {String(session.end_time).slice(0, 5)}</td>
                  <td>{session.session_type || 'Buổi tập'}</td>
                  <td>{variant === 'trainer' ? (session.members || 'Chưa có hội viên') : (session.trainer_name || user?.trainer_name || 'Chưa phân công')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FiCalendar />}
          title="Chưa có buổi tập nào trong lịch"
          description={variant === 'trainer'
            ? 'Bạn có thể tạo lịch mới trong chu kỳ 1 tháng để bắt đầu phân bổ buổi tập.'
            : 'Lịch tập của bạn sẽ xuất hiện tại đây sau khi được huấn luyện viên sắp xếp.'}
          action={variant === 'trainer' ? (
            <button type="button" className="primary-button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              <FiPlus />
              Tạo buổi tập mới
            </button>
          ) : null}
        />
      )}

      {variant === 'trainer' ? <CreateSession /> : null}
    </section>
  );
}

export default ScheduleView;
