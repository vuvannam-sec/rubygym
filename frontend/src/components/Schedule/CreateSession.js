import { useEffect, useState } from 'react';
import { FiAlertCircle, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, Toast } from '../Layout/ProductUI';

function CreateSession() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    trainer_id: '',
    session_date: '',
    start_time: '05:30:00',
    end_time: '06:30:00',
    member_ids: '',
    session_type: 'Cá nhân'
  });
  const [toast, setToast] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    setFormData((current) => ({ ...current, trainer_id: user?.trainer_id || current.trainer_id }));
  }, [user]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!user?.trainer_id) {
        return;
      }

      try {
        const { data } = await api.get(`/trainers/${user.trainer_id}/clients`);
        setMembers(data);
      } catch (error) {
        setMembers([]);
      }
    };

    loadMembers();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setToast(null);

    try {
      const payload = {
        trainer_id: Number(formData.trainer_id),
        session_date: formData.session_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        session_type: formData.session_type,
        member_ids: formData.member_ids
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .map(Number)
      };

      const { data } = await api.post('/schedule', payload);
      setToast({ type: 'success', title: 'Đã tạo buổi tập', message: `Mã buổi tập #${data.sessionId} đã được lưu vào lịch.` });
    } catch (requestError) {
      setToast({
        type: 'error',
        title: 'Không thể tạo buổi tập',
        message: normalizeApiError(requestError, 'Không tạo được buổi tập.')
      });
    }
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <h2>Tạo buổi tập trong tháng</h2>
      <div className="constraint-list">
        <p>Giờ hoạt động: 05:00-11:30 và 13:30-20:00.</p>
        <p>Mỗi buổi tối đa 2 giờ, tối đa 3 hội viên trong cùng một buổi.</p>
        <p>Mỗi hội viên chỉ được 1 buổi cho mỗi khung sáng, chiều, tối trong ngày.</p>
        <p>Huấn luyện viên chỉ được tối đa 8 giờ/ngày và lịch chỉ tạo trong chu kỳ 1 tháng.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          ID HLV
          <input name="trainer_id" value={formData.trainer_id} onChange={handleChange} required disabled={Boolean(user?.trainer_id)} />
        </label>
        <label>
          Ngày tập
          <input type="date" name="session_date" value={formData.session_date} onChange={handleChange} required />
        </label>
        <label>
          Giờ bắt đầu
          <input name="start_time" value={formData.start_time} onChange={handleChange} required />
        </label>
        <label>
          Giờ kết thúc
          <input name="end_time" value={formData.end_time} onChange={handleChange} required />
        </label>
        <label>
          Loại buổi tập
          <select name="session_type" value={formData.session_type} onChange={handleChange}>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Nhóm nhỏ">Nhóm nhỏ</option>
            <option value="Đánh giá thể chất">Đánh giá thể chất</option>
          </select>
        </label>
        <label>
          Danh sách ID hội viên
          <input
            name="member_ids"
            value={formData.member_ids}
            onChange={handleChange}
            placeholder="1,2,3"
          />
        </label>
        <button type="submit" className="primary-button">
          <FiSave />
          Tạo lịch
        </button>
      </form>

      {members.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID hội viên</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.full_name}</td>
                  <td>{member.email}</td>
                  <td>{String(member.join_date).slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FiAlertCircle />}
          title="Chưa có hội viên được phân công"
          description="Danh sách hội viên sẽ hiển thị ở đây để bạn chọn đúng ID khi tạo buổi tập."
        />
      )}
    </section>
  );
}

export default CreateSession;
