import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function EventDetail() {
  const { id } = useParams();
  const [eventItem, setEventItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEventDetail() {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEventItem(data);
      } catch (requestError) {
        setError('Không tải được chi tiết sự kiện.');
      }
    }

    loadEventDetail();
  }, [id]);

  return (
    <section className="page-card">
      <h1>Chi tiết sự kiện</h1>
      {error ? <p className="error-text">{error}</p> : null}
      {eventItem ? (
        <div className="detail-grid">
          <p><strong>Tiêu đề:</strong> {eventItem.title}</p>
          <p><strong>Mô tả:</strong> {eventItem.description}</p>
          <p><strong>Thời gian:</strong> {String(eventItem.event_date).replace('T', ' ').slice(0, 16)}</p>
          <p><strong>Người tạo:</strong> {eventItem.created_by_name || 'Hệ thống'}</p>
        </div>
      ) : null}
    </section>
  );
}

export default EventDetail;
