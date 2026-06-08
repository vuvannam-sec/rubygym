import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiClipboard, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, SectionHeader, Toast } from '../Layout/ProductUI';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';

function EvaluationForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    member_id: '',
    month_year: '',
    target_weight: '',
    actual_weight: '',
    target_bmi: '',
    actual_bmi: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [rows, setRows] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [memberResponse, evaluationResponse] = await Promise.all([
          user?.trainer_id ? api.get(`/trainers/${user.trainer_id}/clients`) : Promise.resolve({ data: [] }),
          api.get('/evaluations')
        ]);

        if (memberResponse.data.length > 0) {
          const mappedMembers = memberResponse.data.map((member) => ({
            id: member.id,
            name: member.full_name,
            goal_type: member.goal_type,
            target_weight: member.target_weight,
            target_bmi: member.target_bmi,
            target_date: member.target_date,
            goal_notes: member.goal_notes
          }));
          setMembers(mappedMembers);
          setFormData((current) => ({
            ...current,
            member_id: String(mappedMembers[0].id),
            target_weight: mappedMembers[0].target_weight || current.target_weight,
            target_bmi: mappedMembers[0].target_bmi || current.target_bmi
          }));
        }

        if (evaluationResponse.data.length > 0) {
          setRows(evaluationResponse.data.map((evaluation) => ({
            id: evaluation.id,
            member: evaluation.member_name,
            month: String(evaluation.month_year).slice(0, 7),
            weight: evaluation.actual_weight ? `${evaluation.actual_weight}kg` : 'Chưa cập nhật',
            bmi: evaluation.actual_bmi || 'Chưa cập nhật',
            note: `${evaluation.weight_progress} / ${evaluation.bmi_progress}`
          })));
        }
      } catch (error) {
        // Keep fallback data.
      }
    };

    loadInitialData();
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      if (name !== 'member_id') {
        return { ...current, [name]: value };
      }

      const selectedMember = members.find((member) => String(member.id) === value);
      return {
        ...current,
        member_id: value,
        target_weight: selectedMember?.target_weight || '',
        target_bmi: selectedMember?.target_bmi || ''
      };
    });
  };

  const selectedGoal = useMemo(() => (
    members.find((member) => String(member.id) === formData.member_id)
  ), [members, formData.member_id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!formData.member_id || !formData.month_year || !formData.actual_weight || !formData.actual_bmi) {
      setToast({ type: 'error', title: 'Thiếu dữ liệu đánh giá', message: 'Vui lòng nhập đầy đủ học viên, tháng đánh giá và các chỉ số chính.' });
      return;
    }

    const selectedMember = members.find((member) => String(member.id) === formData.member_id);

    try {
      const { data } = await api.post('/evaluations', {
        member_id: Number(formData.member_id),
        month_year: formData.month_year,
        target_weight: Number(formData.target_weight),
        actual_weight: formData.actual_weight ? Number(formData.actual_weight) : null,
        target_bmi: Number(formData.target_bmi),
        actual_bmi: formData.actual_bmi ? Number(formData.actual_bmi) : null,
        notes: formData.notes
      });

      setRows((current) => [{
        id: data.evaluationId,
        member: selectedMember?.name || 'Học viên',
        month: formData.month_year,
        weight: formData.actual_weight ? `${formData.actual_weight}kg` : 'Chưa cập nhật',
        bmi: formData.actual_bmi || 'Chưa cập nhật',
        note: formData.notes || 'Đã lưu đánh giá mới'
      }, ...current]);
      setMessage('Đánh giá đã được lưu thành công.');
      setToast({ type: 'success', title: 'Đã lưu đánh giá', message: 'Biểu mẫu đánh giá tháng đã được cập nhật.' });
    } catch (error) {
      setToast({ type: 'error', title: 'Không lưu được đánh giá', message: normalizeApiError(error, 'Vui lòng kiểm tra backend và thử lại.') });
    }
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Trainer / Đánh giá tháng"
        title="Cập nhật đánh giá học viên"
        subtitle="Nhập cân nặng, BMI và ghi chú chuyên môn cho từng học viên theo tháng."
      />
      {selectedGoal?.goal_type ? (
        <article className="dashboard-panel compact-panel">
          <div className="panel-heading">
            <div>
              <h3>Mục tiêu hiện tại của học viên</h3>
              <p>{selectedGoal.goal_type}</p>
            </div>
          </div>
          <div className="plan-summary">
            <div>
              <strong>{selectedGoal.target_weight || 'Chưa đặt'}</strong>
              <p>Cân nặng mục tiêu</p>
            </div>
            <div>
              <strong>{selectedGoal.target_bmi || 'Chưa đặt'}</strong>
              <p>BMI mục tiêu</p>
            </div>
            <div>
              <strong>{selectedGoal.target_date ? String(selectedGoal.target_date).slice(0, 10) : 'Không giới hạn'}</strong>
              <p>Ngày mục tiêu</p>
            </div>
          </div>
          {selectedGoal.goal_notes ? <p>{selectedGoal.goal_notes}</p> : null}
        </article>
      ) : null}
      {members.length === 0 ? (
        <EmptyState
          icon={<FiClipboard />}
          title="Chưa có học viên để đánh giá"
          description="Bạn cần được phân công học viên trước khi tạo đánh giá tháng. Liên hệ quản trị viên nếu danh sách trống."
        />
      ) : (
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Học viên
          <select name="member_id" value={formData.member_id} onChange={handleChange} required>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tháng đánh giá
          <input type="month" name="month_year" value={formData.month_year} onChange={handleChange} required />
        </label>
        <label>
          Cân nặng mục tiêu
          <input name="target_weight" value={formData.target_weight} onChange={handleChange} required />
        </label>
        <label>
          Cân nặng thực tế
          <input name="actual_weight" value={formData.actual_weight} onChange={handleChange} required />
        </label>
        <label>
          BMI mục tiêu
          <input name="target_bmi" value={formData.target_bmi} onChange={handleChange} required />
        </label>
        <label>
          BMI thực tế
          <input name="actual_bmi" value={formData.actual_bmi} onChange={handleChange} required />
        </label>
        <label className="full-width">
          Ghi chú
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" />
        </label>
        {message ? <p className="success-text">{message}</p> : null}
        <button type="submit" className="primary-button">
          {message ? <FiCheck /> : <FiSave />}
          Lưu đánh giá
        </button>
      </form>
      )}

      {rows.length ? (
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Tháng</th>
              <th>Cân nặng</th>
              <th>BMI</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.member}</td>
                <td>{row.month}</td>
                <td>{row.weight}</td>
                <td>{row.bmi}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}
    </section>
  );
}

export default EvaluationForm;
