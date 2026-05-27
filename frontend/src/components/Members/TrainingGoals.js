import { useEffect, useState } from 'react';
import { FiSave, FiTarget } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function TrainingGoals() {
  const [formData, setFormData] = useState({
    goal_type: 'General fitness',
    target_weight: '',
    target_bmi: '',
    target_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [hasGoal, setHasGoal] = useState(false);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const { data } = await api.get('/goals/me');
        setFormData({
          goal_type: data.goal_type || 'General fitness',
          target_weight: data.target_weight || '',
          target_bmi: data.target_bmi || '',
          target_date: data.target_date ? String(data.target_date).slice(0, 10) : '',
          notes: data.notes || ''
        });
        setHasGoal(true);
      } catch (error) {
        if (error?.response?.status !== 404) {
          setToast({
            type: 'info',
            title: 'Chưa đồng bộ được mục tiêu',
            message: normalizeApiError(error, 'Bạn vẫn có thể nhập mục tiêu để lưu khi backend sẵn sàng.')
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.put('/goals/me', {
        ...formData,
        target_weight: formData.target_weight ? Number(formData.target_weight) : null,
        target_bmi: formData.target_bmi ? Number(formData.target_bmi) : null
      });
      setHasGoal(true);
      setToast({ type: 'success', title: 'Đã lưu mục tiêu', message: 'Huấn luyện viên sẽ thấy mục tiêu này khi đánh giá tháng.' });
    } catch (error) {
      setToast({ type: 'error', title: 'Không thể lưu mục tiêu', message: normalizeApiError(error, 'Vui lòng thử lại sau.') });
    }
  };

  if (loading) {
    return <LoadingPanel label="Đang tải mục tiêu tập luyện..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member / Mục tiêu"
        title="Mục tiêu tập luyện của tôi"
        subtitle="Cập nhật mục tiêu cân nặng, BMI và ghi chú để huấn luyện viên dùng trong đánh giá tháng."
        actions={<StatusBadge tone={hasGoal ? 'success' : 'warning'}>{hasGoal ? 'Đã có mục tiêu' : 'Chưa có mục tiêu'}</StatusBadge>}
      />

      {!hasGoal ? (
        <EmptyState
          icon={<FiTarget />}
          title="Bạn chưa lưu mục tiêu tập luyện"
          description="Mục tiêu được lưu tại đây sẽ không tự đăng ký buổi tập; huấn luyện viên vẫn là người tạo lịch cho bạn."
        />
      ) : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nhóm mục tiêu
          <select name="goal_type" value={formData.goal_type} onChange={handleChange}>
            <option value="General fitness">Thể lực tổng quát</option>
            <option value="Fat loss">Giảm mỡ</option>
            <option value="Muscle gain">Tăng cơ</option>
            <option value="Mobility">Linh hoạt</option>
            <option value="Strength maintenance">Duy trì sức mạnh</option>
          </select>
        </label>
        <label>
          Cân nặng mục tiêu
          <input name="target_weight" value={formData.target_weight} onChange={handleChange} placeholder="Ví dụ: 58" />
        </label>
        <label>
          BMI mục tiêu
          <input name="target_bmi" value={formData.target_bmi} onChange={handleChange} placeholder="Ví dụ: 21.5" />
        </label>
        <label>
          Ngày mục tiêu
          <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} />
        </label>
        <label className="full-width">
          Ghi chú cho huấn luyện viên
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" />
        </label>
        <button type="submit" className="primary-button">
          <FiSave />
          Lưu mục tiêu
        </button>
      </form>
    </section>
  );
}

export default TrainingGoals;
