import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiCreditCard, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { ActionIconButton, EmptyState, Modal, Pagination, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const planLabels = {
  QUARTERLY: 'Standard 3 tháng',
  SEMI_ANNUAL: 'Standard 6 tháng',
  ANNUAL: 'Premium 12 tháng'
};

const statusLabels = {
  ACTIVE: 'Đang hoạt động',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy'
};

const revenueByPlan = {
  QUARTERLY: '4.200.000đ',
  SEMI_ANNUAL: '7.500.000đ',
  ANNUAL: '18.900.000đ'
};

const defaultForm = {
  member_id: '',
  plan_type: 'QUARTERLY',
  start_date: '2026-04-10',
  status: 'ACTIVE'
};

const dateOnly = (value) => (value ? String(value).slice(0, 10) : '');

function SubscriptionStatus() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingSubscription, setViewingSubscription] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const pageSize = 4;

  const mapSubscription = useCallback((subscription) => ({
    id: subscription.id,
    member_id: subscription.member_id || '',
    member: subscription.member_name || subscription.member || 'Chưa xác định',
    plan_type: subscription.plan_type || 'QUARTERLY',
    plan: planLabels[subscription.plan_type] || subscription.plan || subscription.plan_type || 'Chưa xác định',
    start: dateOnly(subscription.start_date || subscription.start),
    end: dateOnly(subscription.end_date || subscription.end),
    status: subscription.status || 'ACTIVE',
    statusLabel: statusLabels[subscription.status] || subscription.status || 'Đang hoạt động',
    revenue: revenueByPlan[subscription.plan_type] || subscription.revenue || 'Theo gói'
  }), []);

  const loadSubscriptions = useCallback(async () => {
    const [subscriptionResponse, memberResponse] = await Promise.all([
      api.get('/subscriptions'),
      api.get('/members')
    ]);

    setSubscriptions(subscriptionResponse.data.map(mapSubscription));
    setMembers(memberResponse.data.map((member) => ({
      id: member.id,
      name: member.full_name
    })));
  }, [mapSubscription]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadSubscriptions();
      } catch (error) {
        setSubscriptions([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được danh sách gói tập',
          message: normalizeApiError(error, 'Không tải được danh sách gói tập từ backend.')
        });
      }
    };

    loadInitialData();
  }, [loadSubscriptions]);

  const filteredSubscriptions = useMemo(() => subscriptions.filter((subscription) => (
    statusFilter === 'ALL' || subscription.status === statusFilter
  )), [subscriptions, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / pageSize));
  const pagedSubscriptions = filteredSubscriptions.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setViewingSubscription(null);
    setEditingSubscription(null);
    setFormData(defaultForm);
    setModalOpen(true);
  };

  const openViewModal = (subscription) => {
    setViewingSubscription(subscription);
    setEditingSubscription(null);
    setModalOpen(true);
  };

  const openEditModal = (subscription) => {
    setViewingSubscription(null);
    setEditingSubscription(subscription);
    setFormData({
      member_id: subscription.member_id || '',
      plan_type: subscription.plan_type || 'QUARTERLY',
      start_date: subscription.start,
      status: subscription.status || 'ACTIVE'
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.member_id || !formData.start_date) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng chọn hội viên và ngày bắt đầu.' });
      return;
    }

    setSaving(true);

    try {
      if (editingSubscription) {
        await api.put(`/subscriptions/${editingSubscription.id}`, {
          member_id: formData.member_id,
          plan_type: formData.plan_type,
          start_date: formData.start_date,
          status: formData.status
        });

        setToast({ type: 'success', title: 'Đã cập nhật gói tập', message: 'Thông tin gói tập đã được lưu vào backend.' });
      } else {
        await api.post('/subscriptions', {
          member_id: formData.member_id,
          plan_type: formData.plan_type,
          start_date: formData.start_date
        });

        setToast({ type: 'success', title: 'Đã tạo gói tập', message: 'Gói tập mới đã được lưu vào backend.' });
      }

      await loadSubscriptions();
      setModalOpen(false);
    } catch (error) {
      setToast({
        type: 'error',
        title: editingSubscription ? 'Không cập nhật được gói tập' : 'Không tạo được gói tập',
        message: normalizeApiError(error, 'Backend từ chối thao tác. Vui lòng kiểm tra dữ liệu và thử lại.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/subscriptions/${id}`);
      await loadSubscriptions();
      setToast({ type: 'success', title: 'Đã xóa gói tập', message: 'Bản ghi gói tập đã được xóa khỏi backend.' });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không xóa được gói tập',
        message: normalizeApiError(error, 'Backend từ chối thao tác xóa.')
      });
    }
  };

  const isViewMode = Boolean(viewingSubscription);

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Gói tập"
        title="Quản lý gói tập"
        subtitle="Kiểm soát trạng thái gia hạn và thông tin hiệu lực của từng hội viên bằng dữ liệu backend."
        actions={(
          <button type="button" className="primary-button" onClick={openCreateModal}>
            <FiPlus />
            Tạo gói tập
          </button>
        )}
      />

      <div className="toolbar">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="ALL">Tất cả</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="EXPIRED">Hết hạn</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {pagedSubscriptions.length ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã gói</th>
                  <th>Hội viên</th>
                  <th>Loại gói</th>
                  <th>Hiệu lực</th>
                  <th>Doanh thu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedSubscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td>{subscription.id}</td>
                    <td>{subscription.member}</td>
                    <td>{subscription.plan}</td>
                    <td>{subscription.start} - {subscription.end}</td>
                    <td>{subscription.revenue}</td>
                    <td>
                      <StatusBadge tone={subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {subscription.statusLabel}
                      </StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem gói tập" onClick={() => openViewModal(subscription)}>
                        <FiEye />
                      </ActionIconButton>
                      <ActionIconButton label="Sửa gói tập" onClick={() => openEditModal(subscription)}>
                        <FiEdit />
                      </ActionIconButton>
                      <ActionIconButton label="Xóa gói tập" tone="danger" onClick={() => handleDelete(subscription.id)}>
                        <FiTrash2 />
                      </ActionIconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={<FiCreditCard />}
          title="Không có gói tập phù hợp"
          description="Thử đổi bộ lọc trạng thái hoặc tạo mới một gói tập cho hội viên."
          action={(
            <button type="button" className="primary-button" onClick={openCreateModal}>
              <FiPlus />
              Tạo gói tập đầu tiên
            </button>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        title={isViewMode ? 'Chi tiết gói tập' : editingSubscription ? 'Cập nhật gói tập' : 'Tạo gói tập'}
        onClose={() => setModalOpen(false)}
        actions={isViewMode ? (
          <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
            <FiX />
            Đóng
          </button>
        ) : (
          <>
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              <FiX />
              Hủy
            </button>
            <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
              <FiCheck />
              {saving ? 'Đang lưu' : 'Lưu thay đổi'}
            </button>
          </>
        )}
      >
        {isViewMode ? (
          <div className="readonly-grid">
            <div><span>Mã gói</span><strong>{viewingSubscription.id}</strong></div>
            <div><span>Hội viên</span><strong>{viewingSubscription.member}</strong></div>
            <div><span>Loại gói</span><strong>{viewingSubscription.plan}</strong></div>
            <div><span>Ngày bắt đầu</span><strong>{viewingSubscription.start}</strong></div>
            <div><span>Ngày kết thúc</span><strong>{viewingSubscription.end}</strong></div>
            <div><span>Doanh thu tham chiếu</span><strong>{viewingSubscription.revenue}</strong></div>
            <div><span>Trạng thái</span><strong>{viewingSubscription.statusLabel}</strong></div>
          </div>
        ) : (
          <div className="form-grid single-column">
            <label>
              Hội viên
              <select value={formData.member_id} onChange={(event) => setFormData((current) => ({ ...current, member_id: event.target.value }))}>
                <option value="">Chọn hội viên</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
            <label>
              Loại gói
              <select value={formData.plan_type} onChange={(event) => setFormData((current) => ({ ...current, plan_type: event.target.value }))}>
                <option value="QUARTERLY">Standard 3 tháng</option>
                <option value="SEMI_ANNUAL">Standard 6 tháng</option>
                <option value="ANNUAL">Premium 12 tháng</option>
              </select>
            </label>
            <label>
              Ngày bắt đầu
              <input type="date" value={formData.start_date} onChange={(event) => setFormData((current) => ({ ...current, start_date: event.target.value }))} />
            </label>
            {editingSubscription ? (
              <label>
                Trạng thái
                <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="EXPIRED">Hết hạn</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </label>
            ) : null}
          </div>
        )}
      </Modal>
    </section>
  );
}

export default SubscriptionStatus;
