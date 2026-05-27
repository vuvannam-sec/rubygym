import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import './App.css';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import AdminReports from './components/Dashboard/AdminReports';
import TrainerDashboard from './components/Dashboard/TrainerDashboard';
import MemberDashboard from './components/Dashboard/MemberDashboard';
import EventList from './components/Events/EventList';
import EvaluationForm from './components/Evaluations/EvaluationForm';
import EvaluationList from './components/Evaluations/EvaluationList';
import Footer from './components/Layout/Footer';
import Navbar from './components/Layout/Navbar';
import { EmptyState } from './components/Layout/ProductUI';
import Sidebar from './components/Layout/Sidebar';
import LandingPage from './components/Landing/LandingPage';
import MemberList from './components/Members/MemberList';
import MyMembersPage from './components/Members/MyMembersPage';
import ReferralPage from './components/Members/ReferralPage';
import TrainingGoals from './components/Members/TrainingGoals';
import ScheduleView from './components/Schedule/ScheduleView';
import PlanSelector from './components/Subscriptions/PlanSelector';
import SubscriptionStatus from './components/Subscriptions/SubscriptionStatus';
import TrainerList from './components/Trainers/TrainerList';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function PublicLayout() {
  return (
    <div className="page-wrapper">
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="page-wrapper dashboard-layout">
      <Sidebar />
      <main className="page-content dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

function RedirectToRoleHome() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'TRAINER') {
    return <Navigate to="/trainer" replace />;
  }

  return <Navigate to="/member" replace />;
}

function NotFoundPage() {
  return (
    <section className="page-card">
      <EmptyState
        icon={<FiAlertCircle />}
        title="Không tìm thấy trang"
        description="Đường dẫn này không tồn tại hoặc bạn không có quyền truy cập."
        action={(
          <Link to="/" className="primary-button">
            <FiArrowLeft />
            Quay lại trang chủ
          </Link>
        )}
      />
    </section>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        <Route path="/dashboard" element={<RedirectToRoleHome />} />
        <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
        <Route path="/dashboard/trainer" element={<Navigate to="/trainer" replace />} />
        <Route path="/dashboard/member" element={<Navigate to="/member" replace />} />

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/trainers" element={<TrainerList />} />
            <Route path="/admin/members" element={<MemberList />} />
            <Route path="/admin/subscriptions" element={<SubscriptionStatus />} />
            <Route path="/admin/events" element={<EventList />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/trainer" element={<TrainerDashboard />} />
            <Route path="/trainer/members" element={<MyMembersPage />} />
            <Route path="/trainer/schedule" element={<ScheduleView variant="trainer" />} />
            <Route path="/trainer/evaluations" element={<EvaluationForm />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/schedule" element={<ScheduleView variant="member" />} />
            <Route path="/member/goals" element={<TrainingGoals />} />
            <Route path="/member/results" element={<EvaluationList />} />
            <Route path="/member/subscriptions" element={<PlanSelector />} />
            <Route path="/member/referrals" element={<ReferralPage />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
