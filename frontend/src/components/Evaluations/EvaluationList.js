import { useEffect, useState } from 'react';
import { FiActivity, FiTarget, FiTrendingDown } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { EmptyState, LoadingPanel, MetricCard, SectionHeader, Toast } from '../Layout/ProductUI';

function EvaluationList() {
  const [evaluations, setEvaluations] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvaluations = async () => {
      setLoading(true);
      setEvaluations([]);

      try {
        const { data } = await api.get('/evaluations');
        if (data.length > 0) {
          setEvaluations(data.map((evaluation) => ({
            month: String(evaluation.month_year).slice(0, 7),
            weight: evaluation.actual_weight ? `${evaluation.actual_weight}kg` : 'Chưa cập nhật',
            bmi: evaluation.actual_bmi || 'Chưa cập nhật',
            note: `${evaluation.weight_progress} / ${evaluation.bmi_progress}`
          })));
        }
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Chưa tải được lịch sử đánh giá',
          message: normalizeApiError(error, 'Không tải được lịch sử đánh giá từ backend.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, []);

  const latest = evaluations[evaluations.length - 1] || null;

  if (loading) {
    return <LoadingPanel label="Đang tải lịch sử đánh giá..." />;
  }

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Member / Kết quả đánh giá"
        title="Theo dõi tiến độ cơ thể"
        subtitle="So sánh cân nặng, BMI và nhận xét của huấn luyện viên qua từng tháng."
      />

      <div className="stats-grid">
        <MetricCard icon={<FiActivity />} label="Cân nặng hiện tại" value={latest?.weight || 'Chưa có dữ liệu'} caption="Cập nhật gần nhất" />
        <MetricCard icon={<FiTrendingDown />} label="BMI hiện tại" value={latest?.bmi || 'Chưa có dữ liệu'} caption="Đang tiến gần ngưỡng mục tiêu" />
        <MetricCard icon={<FiTarget />} label="Mức hoàn thành" value={latest ? 'Đang theo dõi' : 'Chưa có dữ liệu'} caption="So với mục tiêu tháng hiện tại" />
      </div>

      {evaluations.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Cân nặng</th>
                <th>BMI</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.month}>
                  <td>{evaluation.month}</td>
                  <td>{evaluation.weight}</td>
                  <td>{evaluation.bmi}</td>
                  <td>{evaluation.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FiActivity />}
          title="Chưa có đánh giá tháng"
          description="Huấn luyện viên sẽ thêm nhận xét sau khi có buổi đánh giá đầu tiên."
        />
      )}
    </section>
  );
}

export default EvaluationList;
