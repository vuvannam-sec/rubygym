import { useState } from 'react';
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiClipboard,
  FiCreditCard,
  FiGift,
  FiHome,
  FiTarget,
  FiUsers
} from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';

const roleLinks = {
  ADMIN: [
    { to: '/admin', label: 'Tổng quan', icon: <FiHome /> },
    { to: '/admin/trainers', label: 'Huấn luyện viên', icon: <FiActivity /> },
    { to: '/admin/members', label: 'Hội viên', icon: <FiUsers /> },
    { to: '/admin/subscriptions', label: 'Gói tập', icon: <FiCreditCard /> },
    { to: '/admin/events', label: 'Sự kiện', icon: <FiBell /> },
    { to: '/admin/reports', label: 'Thống kê', icon: <FiBarChart2 /> }
  ],
  TRAINER: [
    { to: '/trainer', label: 'Tổng quan', icon: <FiHome /> },
    { to: '/trainer/members', label: 'Học viên của tôi', icon: <FiUsers /> },
    { to: '/trainer/schedule', label: 'Lịch tập', icon: <FiCalendar /> },
    { to: '/trainer/evaluations', label: 'Đánh giá tháng', icon: <FiClipboard /> }
  ],
  MEMBER: [
    { to: '/member', label: 'Tổng quan', icon: <FiHome /> },
    { to: '/member/onboarding', label: 'Hồ sơ ban đầu', icon: <FiClipboard /> },
    { to: '/member/schedule', label: 'Lịch tập của tôi', icon: <FiCalendar /> },
    { to: '/member/goals', label: 'Mục tiêu', icon: <FiTarget /> },
    { to: '/member/results', label: 'Kết quả đánh giá', icon: <FiBarChart2 /> },
    { to: '/member/subscriptions', label: 'Gói tập', icon: <FiCreditCard /> },
    { to: '/member/referrals', label: 'Giới thiệu bạn', icon: <FiGift /> }
  ]
};

function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const links = roleLinks[user?.role] || [];
  const title = user?.role === 'ADMIN' ? 'Khu quản trị' : user?.role === 'TRAINER' ? 'Khu huấn luyện viên' : 'Khu hội viên';

  return (
    <aside className={`sidebar sidebar-product ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand-block">
          <BrandLogo to="/" light subtitle="Trung tâm thể hình" />
          <p className="sidebar-eyebrow">RubyGYM</p>
          <h2>{title}</h2>
        </div>
        <button type="button" className="icon-button sidebar-toggle" onClick={() => setCollapsed((current) => !current)}>
          {collapsed ? <FiArrowRight /> : <FiArrowLeft />}
        </button>
      </div>
      <div className="sidebar-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            <span className="sidebar-icon">{link.icon}</span>
            <span className="sidebar-label">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
