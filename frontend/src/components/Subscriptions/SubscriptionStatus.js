import { useMemo, useState } from 'react';
import { FiCheck, FiCreditCard, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { subscriptions as initialSubscriptions } from '../../data/mockData';
import { ActionIconButton, EmptyState, Modal, Pagination, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function SubscriptionStatus() {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    member: '',
    plan: 'Standard 6 tháng',
    start: '2026-04-10',
    end: '2026-10-10',
    status: 'Đang hoạt động',
    revenue: '7.500.000đ'
  });
  const pageSize = 4;

  const filteredSubscriptions = useMemo(() => subscriptions.filter((subscription) => (
    statusFilter === 'Tất cả' || subscription.status === statusFilter
  )), [subscriptions, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / pageSize));
  const pagedSubscriptions = filteredSubscriptions.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setEditingSubscription(null);
    setFormData({
      member: '',
      plan: 'Standard 6 tháng',
      start: '2026-04-10',
      end: '2026-10-10',
      status: 'Đang hoạt động',
      revenue: '7.500.000đ'
    });
    setModalOpen(true);
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      member: subscription.member,
      plan: subscription.plan,
      start: subscription.start,
      end: subscription.end,
      status: subscription.status,
      revenue: subscription.revenue
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.member) {
      setToast({ type: 'error', title: 'Thiếu hội viên', message: 'Vui lòng nhập tên hội viên cho gói tập.' });
      return;
    }

    if (editingSubscription) {
      setSubscriptions((current) => current.map((subscription) => (
        subscription.id === editingSubscription.id ? { ...subscription, ...formData } : subscription
      )));
      setToast({ type: 'success', title: 'Đã cập nhật gói tập', message: 'Thông tin gói tập đã được làm mới.' });
    } else {
      setSubscriptions((current) => [...current, { id: `SUB-${Date.now()}`, ...formData }]);
      setToast({ type: 'success', title: 'Đã tạo gói tập', message: 'Gói tập mới đã được thêm vào danh sách.' });
    }

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setSubscriptions((current) => current.filter((subscription) => subscription.id !== id));
    setToast({ type: 'success', title: 'Đã xóa gói tập', message: 'Bản ghi gói tập đã được xóa.' });
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Gói tập"
        title="Quản lý gói tập"
        subtitle="Kiểm soát trạng thái gia hạn, doanh thu và thông tin hiệu lực của từng hội viên."
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
          <option>Tất cả</option>
          <option>Đang hoạt động</option>
          <option>Sắp hết hạn</option>
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
                      <StatusBadge tone={subscription.status === 'Đang hoạt động' ? 'success' : 'warning'}>
                        {subscription.status}
                      </StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem gói tập" onClick={() => openEditModal(subscription)}>
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
        title={editingSubscription ? 'Cập nhật gói tập' : 'Tạo gói tập'}
        onClose={() => setModalOpen(false)}
        actions={(
          <>
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>
              <FiX />
              Hủy
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              <FiCheck />
              Lưu thay đổi
            </button>
          </>
        )}
      >
        <div className="form-grid single-column">
          <label>
            Hội viên
            <input value={formData.member} onChange={(event) => setFormData((current) => ({ ...current, member: event.target.value }))} />
          </label>
          <label>
            Loại gói
            <select value={formData.plan} onChange={(event) => setFormData((current) => ({ ...current, plan: event.target.value }))}>
              <option>Standard 3 tháng</option>
              <option>Standard 6 tháng</option>
              <option>Premium 12 tháng</option>
            </select>
          </label>
          <label>
            Ngày bắt đầu
            <input type="date" value={formData.start} onChange={(event) => setFormData((current) => ({ ...current, start: event.target.value }))} />
          </label>
          <label>
            Ngày kết thúc
            <input type="date" value={formData.end} onChange={(event) => setFormData((current) => ({ ...current, end: event.target.value }))} />
          </label>
          <label>
            Doanh thu
            <input value={formData.revenue} onChange={(event) => setFormData((current) => ({ ...current, revenue: event.target.value }))} />
          </label>
          <label>
            Trạng thái
            <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
              <option>Đang hoạt động</option>
              <option>Sắp hết hạn</option>
            </select>
          </label>
        </div>
      </Modal>
    </section>
  );
}

export default SubscriptionStatus;
