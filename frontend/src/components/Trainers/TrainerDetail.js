import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function TrainerDetail() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTrainer() {
      try {
        const { data } = await api.get(`/trainers/${id}`);
        setTrainer(data);
      } catch (requestError) {
        setError('Không tải được thông tin huấn luyện viên.');
      }
    }

    loadTrainer();
  }, [id]);

  return (
    <section className="page-card">
      <h1>Chi tiết huấn luyện viên</h1>
      {error ? <p className="error-text">{error}</p> : null}
      {trainer ? (
        <div className="detail-grid">
          <p><strong>Họ tên:</strong> {trainer.full_name}</p>
          <p><strong>Email:</strong> {trainer.email}</p>
          <p><strong>Số điện thoại:</strong> {trainer.phone}</p>
          <p><strong>Chuyên môn:</strong> {trainer.specialization || 'Đang cập nhật'}</p>
          <p><strong>Số giờ tối đa/ngày:</strong> {trainer.max_daily_hours}</p>
        </div>
      ) : null}
    </section>
  );
}

export default TrainerDetail;
