import { memberEvaluationHistory } from '../../data/mockData';
import { useEffect, useState } from 'react';
import { FiActivity, FiTarget, FiTrendingDown } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { LoadingPanel, MetricCard, SectionHeader, Toast } from '../Layout/ProductUI';

function EvaluationList() {
  const [evaluations, setEvaluations] = useState(memberEvaluationHistory);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvaluations = async () => {
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
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được lịch sử đánh giá từ backend.')
        });
      } finally {
        setLoading(false);
      }
    };

    loadEvaluations();
  }, []);

  const latest = evaluations[evaluations.length - 1] || memberEvaluationHistory[memberEvaluationHistory.length - 1];

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
        <MetricCard icon={<FiActivity />} label="Cân nặng hiện tại" value={latest.weight} caption="Cập nhật gần nhất" />
        <MetricCard icon={<FiTrendingDown />} label="BMI hiện tại" value={latest.bmi} caption="Đang tiến gần ngưỡng mục tiêu" />
        <MetricCard icon={<FiTarget />} label="Mức hoàn thành" value="84%" caption="So với mục tiêu quý hiện tại" />
      </div>

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
    </section>
  );
}

export default EvaluationList;
