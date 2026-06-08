import { useEffect, useMemo, useState } from 'react';
import { FiAlertCircle, FiSave, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, Toast } from '../Layout/ProductUI';

const formatMetric = (value, suffix) => {
  if (value === null || value === undefined || value === '') {
    return 'Chưa cập nhật';
  }

  return `${Number(value).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}${suffix}`;
};

const toTimeValue = (value) => String(value || '').slice(0, 5);
const toApiTime = (value) => (value && value.length === 5 ? `${value}:00` : value);

function CreateSession({ onCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    session_date: '',
    start_time: '05:30',
    end_time: '06:30',
    session_type: 'Cá nhân'
  });
  const [toast, setToast] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      setLoadingMembers(true);

      if (!user?.trainer_id) {
        setMembers([]);
        setLoadingMembers(false);
        return;
      }

      try {
        const { data } = await api.get(`/trainers/${user.trainer_id}/clients`);
        setMembers(data);
      } catch (error) {
        setMembers([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được học viên',
          message: normalizeApiError(error, 'Danh sách học viên sẽ hiện khi backend có dữ liệu.')
        });
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [user]);

  const selectedCount = selectedMemberIds.length;

  const selectedLabel = useMemo(() => {
    if (!selectedCount) {
      return 'Chưa chọn hội viên';
    }

    return `${selectedCount}/3 hội viên`;
  }, [selectedCount]);

  const toggleMember = (memberId) => {
    setSelectedMemberIds((current) => {
      const normalizedId = Number(memberId);
      if (current.includes(normalizedId)) {
        return current.filter((id) => id !== normalizedId);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, normalizedId];
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setToast(null);

    if (!selectedMemberIds.length) {
      setToast({
        type: 'error',
        title: 'Thiếu hội viên',
        message: 'Chọn ít nhất 1 hội viên và tối đa 3 hội viên cho mỗi buổi tập.'
      });
      return;
    }

    try {
      const payload = {
        trainer_id: Number(user?.trainer_id),
        session_date: formData.session_date,
        start_time: toApiTime(formData.start_time),
        end_time: toApiTime(formData.end_time),
        session_type: formData.session_type,
        member_ids: selectedMemberIds
      };

      const { data } = await api.post('/schedule', payload);
      setToast({
        type: 'success',
        title: 'Đã tạo buổi tập',
        message: `Mã buổi tập #${data.sessionId} đã được lưu vào lịch.`
      });
      setFormData((current) => ({
        ...current,
        session_date: '',
        start_time: '05:30',
        end_time: '06:30',
        session_type: 'Cá nhân'
      }));
      setSelectedMemberIds([]);
      await onCreated?.();
    } catch (requestError) {
      setToast({
        type: 'error',
        title: 'Không thể tạo buổi tập',
        message: normalizeApiError(requestError, 'Không tạo được buổi tập.')
      });
    }
  };

  if (!user?.trainer_id) {
    return (
      <EmptyState
        icon={<FiAlertCircle />}
        title="Chưa có huấn luyện viên"
        description="Bạn cần tài khoản HLV được phân công để tạo buổi tập."
      />
    );
  }

  return (
    <section className="page-card schedule-create">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="panel-heading">
        <div>
          <h3>Tạo buổi tập</h3>
          <p>Chọn hội viên từ danh sách được phân công, sau đó đặt ngày và giờ tập.</p>
        </div>
        <span className="schedule-selection-count">{selectedLabel}</span>
      </div>

      <div className="constraint-list">
        <p>Giờ hoạt động: 05:00-11:30 và 13:30-20:00.</p>
        <p>Mỗi buổi tối đa 2 giờ, tối đa 3 hội viên trong cùng một buổi.</p>
        <p>Mỗi hội viên chỉ được 1 buổi cho mỗi khung sáng, chiều, tối trong ngày.</p>
        <p>Huấn luyện viên chỉ được tối đa 8 giờ/ngày và lịch chỉ tạo trong chu kỳ 1 tháng.</p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Ngày tập
          <input type="date" name="session_date" value={formData.session_date} onChange={handleChange} required />
        </label>
        <label>
          Giờ bắt đầu
          <input type="time" name="start_time" value={toTimeValue(formData.start_time)} onChange={handleChange} required />
        </label>
        <label>
          Giờ kết thúc
          <input type="time" name="end_time" value={toTimeValue(formData.end_time)} onChange={handleChange} required />
        </label>
        <label>
          Loại buổi tập
          <select name="session_type" value={formData.session_type} onChange={handleChange}>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Nhóm nhỏ">Nhóm nhỏ</option>
            <option value="Đánh giá thể chất">Đánh giá thể chất</option>
          </select>
        </label>
        <div className="full-width schedule-member-picker">
          <div className="panel-heading">
            <div>
              <h3>Chọn hội viên</h3>
              <p>Chọn tối đa 3 người trong danh sách bên dưới.</p>
            </div>
          </div>
          {loadingMembers ? (
            <p className="schedule-helper">Đang tải danh sách hội viên...</p>
          ) : members.length ? (
            <div className="member-pick-grid">
              {members.map((member) => {
                const isSelected = selectedMemberIds.includes(Number(member.id));
                const selectionDisabled = !isSelected && selectedMemberIds.length >= 3;

                return (
                  <label key={member.id} className={`member-pick-card ${isSelected ? 'selected' : ''} ${selectionDisabled ? 'disabled' : ''}`}>
                    <div className="member-pick-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={selectionDisabled}
                        onChange={() => toggleMember(member.id)}
                      />
                      <strong>{member.full_name}</strong>
                    </div>
                    <p>{member.goal_type || 'Chưa có mục tiêu'}</p>
                    <span>{formatMetric(member.current_weight, ' kg')} - {formatMetric(member.height_cm, ' cm')}</span>
                    <small>
                      {[
                        member.target_weight ? `Mục tiêu ${member.target_weight}kg` : null,
                        member.target_bmi ? `BMI ${member.target_bmi}` : null
                      ].filter(Boolean).join(' / ') || 'Chưa có chỉ tiêu định lượng'}
                    </small>
                  </label>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<FiUsers />}
              title="Chưa có hội viên được phân công"
              description="Khi admin gán hội viên cho bạn, danh sách này sẽ hiện để tạo lịch."
            />
          )}
        </div>
        <button type="submit" className="primary-button full-width" disabled={!selectedMemberIds.length}>
          <FiSave />
          Tạo lịch cho {selectedLabel}
        </button>
      </form>
    </section>
  );
}

export default CreateSession;
