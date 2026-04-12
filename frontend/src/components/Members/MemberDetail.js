import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMember() {
      try {
        const { data } = await api.get(`/members/${id}`);
        setMember(data);
      } catch (requestError) {
        setError('Không tải được thông tin hội viên.');
      }
    }

    loadMember();
  }, [id]);

  return (
    <section className="page-card">
      <h1>Chi tiết hội viên</h1>
      {error ? <p className="error-text">{error}</p> : null}
      {member ? (
        <div className="detail-grid">
          <p><strong>Họ tên:</strong> {member.full_name}</p>
          <p><strong>Email:</strong> {member.email}</p>
          <p><strong>Số điện thoại:</strong> {member.phone}</p>
          <p><strong>Ngày tham gia:</strong> {String(member.join_date).slice(0, 10)}</p>
          <p><strong>Hội viên thân thiết:</strong> {member.is_loyal ? 'Có' : 'Không'}</p>
          <p><strong>HLV:</strong> {member.trainer_name || 'Chưa phân công'}</p>
        </div>
      ) : null}
    </section>
  );
}

export default MemberDetail;
