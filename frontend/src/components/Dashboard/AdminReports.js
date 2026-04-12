import { reportRows } from '../../data/mockData';
import { SectionHeader, StatusBadge } from '../Layout/ProductUI';

function AdminReports() {
  return (
    <section className="page-card">
      <SectionHeader
        eyebrow="Admin / Thống kê"
        title="Báo cáo kinh doanh"
        subtitle="Tập trung vào các chỉ số tăng trưởng, duy trì hội viên và hiệu quả vận hành."
      />

      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Hiệu suất tháng 04/2026</h3>
              <p>Tổng hợp nhanh các KPI vận hành quan trọng.</p>
            </div>
            <StatusBadge tone="success">Tăng trưởng tốt</StatusBadge>
          </div>
          <div className="report-grid">
            {reportRows.map((row) => (
              <div key={row.metric} className="report-item">
                <span>{row.metric}</span>
                <strong>{row.value}</strong>
                <p>{row.change} so với kỳ trước</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Khuyến nghị ưu tiên</h3>
              <p>Các hành động có tác động lớn lên doanh thu và trải nghiệm hội viên.</p>
            </div>
          </div>
          <div className="insight-list">
            <div className="insight-item">
              <span>Gia hạn hội viên premium</span>
              <strong>Liên hệ 8 hội viên trong tuần này</strong>
            </div>
            <div className="insight-item">
              <span>Tối ưu lớp nhóm</span>
              <strong>Mở thêm 1 ca HIIT 19:00</strong>
            </div>
            <div className="insight-item">
              <span>Chăm sóc sau đăng ký</span>
              <strong>Tăng onboarding 7 ngày đầu</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminReports;
