import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiPlus } from 'react-icons/fi';
import { weeklyDays } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import CreateSession from './CreateSession';
import { EmptyState, LoadingPanel, SectionHeader, Toast } from '../Layout/ProductUI';

const BASE_SLOTS = [
  '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
  '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value).split(':').map(Number);
  return (hours * 60) + minutes;
};

const createEmptySchedule = (slots) => slots.reduce((schedule, slot) => ({
  ...schedule,
  [slot]: weeklyDays.reduce((days, day) => ({
    ...days,
    [day]: ''
  }), {})
}), {});

function ScheduleView({ variant = 'trainer' }) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setSessions([]);

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
      setSessions([]);
      setToast({
        type: 'info',
        title: 'Chưa tải được lịch tập',
        message: normalizeApiError(error, 'Không tải được lịch tập từ backend.')
      });
    } finally {
      setLoading(false);
    }
  }, [user, variant]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const schedule = useMemo(() => {
    const displaySlots = Array.from(new Set([
      ...BASE_SLOTS,
      ...sessions.map((session) => String(session.start_time).slice(0, 5))
    ])).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
    const base = createEmptySchedule(displaySlots);

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

    return { base, slots: displaySlots };
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
            {schedule.slots.map((slot) => (
              <tr key={slot}>
                <td>{slot}</td>
                {weeklyDays.map((day) => (
                  <td key={`${slot}-${day}`}>
                    {schedule.base[slot][day] ? <div className="calendar-session">{schedule.base[slot][day]}</div> : <span className="calendar-empty">Trống</span>}
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

      {variant === 'trainer' ? <CreateSession onCreated={loadSchedule} /> : null}
    </section>
  );
}

export default ScheduleView;
