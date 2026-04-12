import { NavLink, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';

const roleLabels = {
  ADMIN: 'Quản trị viên',
  TRAINER: 'Huấn luyện viên',
  MEMBER: 'Hội viên'
};

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'TRAINER' ? '/trainer' : '/member';
  const isDashboard = location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/trainer')
    || location.pathname.startsWith('/member');

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-menu">
          <BrandLogo to="/" light className="brand" />
        </div>
        <nav className="topbar-links">
          {!isDashboard ? (
            <>
              <a href="#features">Tính năng</a>
              <a href="#pricing">Vận hành</a>
            </>
          ) : null}
          {isAuthenticated ? (
            <>
              <span className="user-chip">
                {user?.full_name || user?.email} | {roleLabels[user?.role] || user?.role}
              </span>
              <NavLink to={dashboardPath}>Bảng điều khiển</NavLink>
              <button type="button" className="ghost-button" onClick={logout}>
                <FiArrowLeft />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng nhập</NavLink>
              <NavLink to="/register">Đăng ký</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
