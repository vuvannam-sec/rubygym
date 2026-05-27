import { useEffect, useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { trainerMembers } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { getDefaultMemberAvatar } from '../../services/imageUtils';
import MediaAsset from '../Layout/MediaAsset';
import { EmptyState, LoadingPanel, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function MyMembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState(trainerMembers);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadClients = async () => {
      if (!user?.trainer_id) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/trainers/${user.trainer_id}/clients`);
        setMembers(data.map((member) => ({
          id: member.id,
          name: member.full_name,
          goal: member.goal_type || (member.is_loyal ? 'Duy trì thể trạng' : 'Theo lộ trình cá nhân'),
          goalDetail: [
            member.target_weight ? `${member.target_weight}kg` : null,
            member.target_bmi ? `BMI ${member.target_bmi}` : null,
            member.target_date ? `đến ${String(member.target_date).slice(0, 10)}` : null
          ].filter(Boolean).join(' / '),
          nextSession: 'Theo lịch tuần',
          adherence: member.is_loyal ? '90%' : '85%',
          gender: member.gender || trainerMembers.find((fallbackMember) => fallbackMember.id === member.id)?.gender || '',
          avatar_url: member.avatar_url || trainerMembers.find((fallbackMember) => fallbackMember.id === member.id)?.avatar_url || ''
        })));
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được danh sách học viên từ backend.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user]);

  if (loading) {
    return <LoadingPanel label="Đang tải danh sách học viên..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Trainer / Học viên"
        title="Học viên của tôi"
        subtitle="Theo dõi mục tiêu, buổi tập kế tiếp và mức độ tuân thủ của từng học viên."
      />

      {members.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Mục tiêu</th>
                <th>Buổi tiếp theo</th>
                <th>Mức độ tuân thủ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="table-person">
                      <MediaAsset
                        src={getDefaultMemberAvatar(member)}
                        alt={member.name}
                        className="table-avatar"
                        fallbackLabel={member.name}
                        fallbackVariant="avatar"
                        entityId={member.id}
                      />
                      <div>
                        <strong>{member.name}</strong>
                        <p>{member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{member.goal}</strong>
                    <p>{member.goalDetail || 'Chưa có mục tiêu định lượng'}</p>
                  </td>
                  <td>{member.nextSession}</td>
                  <td>{member.adherence}</td>
                  <td>
                    <StatusBadge tone="success">Đang theo lộ trình</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FiUsers />}
          title="Chưa có học viên được phân công"
          description="Khi admin gán hội viên cho bạn, danh sách này sẽ được cập nhật tự động."
        />
      )}
    </section>
  );
}

export default MyMembersPage;
