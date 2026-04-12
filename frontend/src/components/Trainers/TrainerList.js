import { useMemo, useState } from 'react';
import { FiActivity, FiCheck, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { trainers as initialTrainers } from '../../data/mockData';
import { getTrainerImage } from '../../services/imageUtils';
import MediaAsset from '../Layout/MediaAsset';
import { ActionIconButton, EmptyState, Modal, Pagination, SearchField, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function TrainerList() {
  const [trainers, setTrainers] = useState(initialTrainers);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    status: 'Đang hoạt động'
  });
  const pageSize = 4;

  const filteredTrainers = useMemo(() => trainers.filter((trainer) => {
    const matchQuery = trainer.name.toLowerCase().includes(query.toLowerCase())
      || trainer.specialization.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || trainer.status === statusFilter;
    return matchQuery && matchStatus;
  }), [trainers, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTrainers.length / pageSize));
  const pagedTrainers = filteredTrainers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setEditingTrainer(null);
    setFormData({ name: '', specialization: '', phone: '', status: 'Đang hoạt động' });
    setModalOpen(true);
  };

  const openEditModal = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      specialization: trainer.specialization,
      phone: trainer.phone,
      status: trainer.status
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.specialization || !formData.phone) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập đầy đủ họ tên, chuyên môn và số điện thoại.' });
      return;
    }

    if (editingTrainer) {
      setTrainers((current) => current.map((trainer) => (
        trainer.id === editingTrainer.id ? { ...trainer, ...formData } : trainer
      )));
      setToast({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin huấn luyện viên đã được cập nhật.' });
    } else {
      setTrainers((current) => [...current, { id: Date.now(), clients: 0, ...formData }]);
      setToast({ type: 'success', title: 'Đã thêm huấn luyện viên', message: 'Bản ghi mới đã sẵn sàng trong danh sách.' });
    }

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setTrainers((current) => current.filter((trainer) => trainer.id !== id));
    setToast({ type: 'success', title: 'Đã xóa bản ghi', message: 'Huấn luyện viên đã được xóa khỏi danh sách hiển thị.' });
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Huấn luyện viên"
        title="Quản lý huấn luyện viên"
        subtitle="Tìm kiếm nhanh, lọc trạng thái và cập nhật hồ sơ huấn luyện viên bằng modal thao tác."
        actions={(
          <button type="button" className="primary-button" onClick={openCreateModal}>
            <FiPlus />
            Thêm huấn luyện viên
          </button>
        )}
      />

      <div className="toolbar">
        <SearchField
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Tìm theo tên hoặc chuyên môn"
        />
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option>Tất cả</option>
          <option>Đang hoạt động</option>
          <option>Tạm nghỉ</option>
        </select>
      </div>

      {pagedTrainers.length ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Huấn luyện viên</th>
                  <th>Chuyên môn</th>
                  <th>Số điện thoại</th>
                  <th>Học viên</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedTrainers.map((trainer) => (
                  <tr key={trainer.id}>
                    <td>
                      <div className="table-person">
                        <MediaAsset
                          src={getTrainerImage(trainer)}
                          alt={trainer.name}
                          className="table-avatar"
                          fallbackLabel={trainer.name}
                          titleOverlay={trainer.name}
                        />
                        <div>
                          <strong>{trainer.name}</strong>
                          <p>{trainer.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td>{trainer.specialization}</td>
                    <td>{trainer.phone}</td>
                    <td>{trainer.clients}</td>
                    <td>
                      <StatusBadge tone={trainer.status === 'Đang hoạt động' ? 'success' : 'neutral'}>{trainer.status}</StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem huấn luyện viên" onClick={() => openEditModal(trainer)}>
                        <FiEye />
                      </ActionIconButton>
                      <ActionIconButton label="Sửa huấn luyện viên" onClick={() => openEditModal(trainer)}>
                        <FiEdit />
                      </ActionIconButton>
                      <ActionIconButton label="Xóa huấn luyện viên" tone="danger" onClick={() => handleDelete(trainer.id)}>
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
          icon={<FiActivity />}
          title="Chưa có huấn luyện viên phù hợp"
          description="Hãy thử thay đổi bộ lọc hoặc thêm một hồ sơ huấn luyện viên mới."
          action={(
            <button type="button" className="primary-button" onClick={openCreateModal}>
              <FiPlus />
              Tạo hồ sơ đầu tiên
            </button>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        title={editingTrainer ? 'Cập nhật huấn luyện viên' : 'Thêm huấn luyện viên'}
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
            Họ tên
            <input
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label>
            Chuyên môn
            <input
              value={formData.specialization}
              onChange={(event) => setFormData((current) => ({ ...current, specialization: event.target.value }))}
            />
          </label>
          <label>
            Số điện thoại
            <input
              value={formData.phone}
              onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            />
          </label>
          <label>
            Trạng thái
            <select
              value={formData.status}
              onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
            >
              <option>Đang hoạt động</option>
              <option>Tạm nghỉ</option>
            </select>
          </label>
        </div>
      </Modal>
    </section>
  );
}

export default TrainerList;
