import { useEffect, useState } from 'react';
import { FiCheck, FiSave } from 'react-icons/fi';
import { trainerEvaluationRows, trainerMembers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { SectionHeader, Toast } from '../Layout/ProductUI';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';

function EvaluationForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    member_id: String(trainerMembers[0].id),
    month_year: '',
    target_weight: '',
    actual_weight: '',
    target_bmi: '',
    actual_bmi: '',
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [rows, setRows] = useState(trainerEvaluationRows);
  const [members, setMembers] = useState(trainerMembers);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [memberResponse, evaluationResponse] = await Promise.all([
          user?.trainer_id ? api.get(`/trainers/${user.trainer_id}/clients`) : Promise.resolve({ data: [] }),
          api.get('/evaluations')
        ]);

        if (memberResponse.data.length > 0) {
          setMembers(memberResponse.data.map((member) => ({
            id: member.id,
            name: member.full_name
          })));
          setFormData((current) => ({
            ...current,
            member_id: String(memberResponse.data[0].id)
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
    setFormData((current) => ({ ...current, [name]: value }));
  };

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
      const nextRow = {
        id: Date.now(),
        member: selectedMember?.name || 'Học viên',
        month: formData.month_year,
        weight: formData.actual_weight ? `${formData.actual_weight}kg` : 'Chưa cập nhật',
        bmi: formData.actual_bmi || 'Chưa cập nhật',
        note: formData.notes || 'Đã lưu đánh giá mới'
      };

      setRows((current) => [nextRow, ...current]);
      setMessage('Đánh giá đã được lưu cục bộ.');
      setToast({ type: 'info', title: 'Đang dùng dữ liệu cục bộ', message: normalizeApiError(error, 'Backend chưa sẵn sàng nên đánh giá được lưu tạm trong giao diện.') });
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
    </section>
  );
}

export default EvaluationForm;
