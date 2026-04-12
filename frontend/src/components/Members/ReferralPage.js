import { useEffect, useState } from 'react';
import { FiGift, FiInbox, FiLink } from 'react-icons/fi';
import { referralData } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function ReferralPage() {
  const { user } = useAuth();
  const [referral, setReferral] = useState(referralData);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadReferrals = async () => {
      if (!user?.member_id) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/members/${user.member_id}/referrals`);
        setReferral({
          code: data.referral_code,
          link: data.referral_link,
          reward: 'Mỗi hội viên đăng ký thành công sẽ được cộng thêm 1 tháng vào gói tập đang active.',
          friends: data.referred_members.map((member) => ({
            id: member.id,
            name: member.full_name,
            status: 'Đã đăng ký',
            joinedAt: String(member.join_date).slice(0, 10)
          }))
        });
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được thông tin giới thiệu từ backend.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadReferrals();
  }, [user]);

  if (loading) {
    return <LoadingPanel label="Đang tải dữ liệu giới thiệu..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member / Giới thiệu bạn"
        title="Chương trình giới thiệu"
        subtitle="Mời bạn bè tham gia RubyGYM để nhận thêm quyền lợi trên gói tập hiện tại."
      />

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Mã giới thiệu của bạn</h3>
              <p>{referral.reward}</p>
            </div>
            <StatusBadge tone="success">
              <span className="inline-icon-text"><FiGift /> Đang hoạt động</span>
            </StatusBadge>
          </div>
          <div className="referral-box">
            <strong>{referral.code}</strong>
            <p className="inline-icon-text"><FiLink /> {referral.link}</p>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Danh sách bạn bè đã giới thiệu</h3>
              <p>Theo dõi trạng thái từng lượt mời để tối ưu thưởng giới thiệu.</p>
            </div>
          </div>
          {referral.friends.length ? (
            <div className="activity-list">
              {referral.friends.map((friend) => (
                <div key={friend.id} className="activity-item">
                  <div className="activity-dot tone-info" />
                  <div>
                    <strong>{friend.name}</strong>
                    <p>{friend.joinedAt}</p>
                  </div>
                  <StatusBadge tone={friend.status === 'Đã đăng ký' ? 'success' : 'neutral'}>{friend.status}</StatusBadge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FiInbox />}
              title="Chưa có lượt giới thiệu thành công"
              description="Chia sẻ mã giới thiệu để bắt đầu nhận thêm tháng tập miễn phí."
            />
          )}
        </article>
      </div>
    </section>
  );
}

export default ReferralPage;
