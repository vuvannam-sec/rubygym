import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiActivity, FiCheck, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { trainers as initialTrainers } from '../../data/mockData';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { getTrainerImage } from '../../services/imageUtils';
import MediaAsset from '../Layout/MediaAsset';
import { ActionIconButton, EmptyState, Modal, Pagination, SearchField, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const defaultForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  phone: '',
  max_daily_hours: 8
};

function TrainerList() {
  const [trainers, setTrainers] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingTrainer, setViewingTrainer] = useState(null);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const pageSize = 4;

  const mapTrainer = useCallback((trainer, memberRows = []) => {
    const fallbackTrainer = initialTrainers.find((item) => item.id === trainer.id);
    const clients = memberRows.filter((member) => Number(member.trainer_id) === Number(trainer.id)).length;

    return {
      id: trainer.id,
      name: trainer.full_name,
      email: trainer.email || '',
      specialization: trainer.specialization || 'Đang cập nhật',
      phone: trainer.phone || '',
      max_daily_hours: trainer.max_daily_hours || 8,
      status: 'Đang hoạt động',
      clients,
      image: fallbackTrainer?.image || ''
    };
  }, []);

  const loadTrainers = useCallback(async () => {
    const [trainerResponse, memberResponse] = await Promise.all([
      api.get('/trainers'),
      api.get('/members')
    ]);

    setTrainers(trainerResponse.data.map((trainer) => mapTrainer(trainer, memberResponse.data)));
  }, [mapTrainer]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadTrainers();
      } catch (error) {
        setTrainers([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được danh sách huấn luyện viên',
          message: normalizeApiError(error, 'Không tải được danh sách huấn luyện viên từ backend.')
        });
      }
    };

    loadInitialData();
  }, [loadTrainers]);

  const filteredTrainers = useMemo(() => trainers.filter((trainer) => {
    const matchQuery = trainer.name.toLowerCase().includes(query.toLowerCase())
      || trainer.specialization.toLowerCase().includes(query.toLowerCase())
      || String(trainer.email || '').toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || trainer.status === statusFilter;
    return matchQuery && matchStatus;
  }), [trainers, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTrainers.length / pageSize));
  const pagedTrainers = filteredTrainers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setViewingTrainer(null);
    setEditingTrainer(null);
    setFormData(defaultForm);
    setModalOpen(true);
  };

  const openViewModal = (trainer) => {
    setViewingTrainer(trainer);
    setEditingTrainer(null);
    setModalOpen(true);
  };

  const openEditModal = (trainer) => {
    setViewingTrainer(null);
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      email: trainer.email || '',
      password: '',
      specialization: trainer.specialization,
      phone: trainer.phone,
      max_daily_hours: trainer.max_daily_hours || 8
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.specialization || !formData.phone) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập họ tên, email, chuyên môn và số điện thoại.' });
      return;
    }

    if (!editingTrainer && !formData.password) {
      setToast({ type: 'error', title: 'Thiếu mật khẩu', message: 'Vui lòng nhập mật khẩu ban đầu cho huấn luyện viên mới.' });
      return;
    }

    setSaving(true);

    try {
      if (editingTrainer) {
        await api.put(`/trainers/${editingTrainer.id}`, {
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization,
          max_daily_hours: Number(formData.max_daily_hours) || 8
        });

        setToast({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin huấn luyện viên đã được lưu vào backend.' });
      } else {
        await api.post('/trainers', {
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          specialization: formData.specialization,
          max_daily_hours: Number(formData.max_daily_hours) || 8
        });

        setToast({ type: 'success', title: 'Đã thêm huấn luyện viên', message: 'Hồ sơ mới đã được lưu vào backend.' });
      }

      await loadTrainers();
      setModalOpen(false);
    } catch (error) {
      setToast({
        type: 'error',
        title: editingTrainer ? 'Không cập nhật được huấn luyện viên' : 'Không thêm được huấn luyện viên',
        message: normalizeApiError(error, 'Backend từ chối thao tác. Vui lòng kiểm tra dữ liệu và thử lại.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trainers/${id}`);
      await loadTrainers();
      setToast({ type: 'success', title: 'Đã xóa bản ghi', message: 'Huấn luyện viên đã được xóa khỏi backend.' });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không xóa được huấn luyện viên',
        message: normalizeApiError(error, 'Backend từ chối thao tác xóa.')
      });
    }
  };

  const isViewMode = Boolean(viewingTrainer);

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Huấn luyện viên"
        title="Quản lý huấn luyện viên"
        subtitle="Tìm kiếm nhanh, xem chi tiết và cập nhật hồ sơ huấn luyện viên bằng dữ liệu backend."
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
          placeholder="Tìm theo tên, email hoặc chuyên môn"
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
                          <p>{trainer.email || trainer.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td>{trainer.specialization}</td>
                    <td>{trainer.phone}</td>
                    <td>{trainer.clients}</td>
                    <td>
                      <StatusBadge tone="success">{trainer.status}</StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem huấn luyện viên" onClick={() => openViewModal(trainer)}>
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
        title={isViewMode ? 'Chi tiết huấn luyện viên' : editingTrainer ? 'Cập nhật huấn luyện viên' : 'Thêm huấn luyện viên'}
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
            <div><span>Mã HLV</span><strong>{viewingTrainer.id}</strong></div>
            <div><span>Họ tên</span><strong>{viewingTrainer.name}</strong></div>
            <div><span>Email</span><strong>{viewingTrainer.email || 'Chưa cập nhật'}</strong></div>
            <div><span>Số điện thoại</span><strong>{viewingTrainer.phone || 'Chưa cập nhật'}</strong></div>
            <div><span>Chuyên môn</span><strong>{viewingTrainer.specialization}</strong></div>
            <div><span>Giờ tối đa/ngày</span><strong>{viewingTrainer.max_daily_hours}</strong></div>
            <div><span>Học viên đang phụ trách</span><strong>{viewingTrainer.clients}</strong></div>
            <div><span>Trạng thái</span><strong>{viewingTrainer.status}</strong></div>
          </div>
        ) : (
          <div className="form-grid single-column">
            <label>
              Họ tên
              <input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Email
              <input type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
            </label>
            {!editingTrainer ? (
              <label>
                Mật khẩu ban đầu
                <input type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} />
              </label>
            ) : null}
            <label>
              Chuyên môn
              <input value={formData.specialization} onChange={(event) => setFormData((current) => ({ ...current, specialization: event.target.value }))} />
            </label>
            <label>
              Số điện thoại
              <input value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label>
              Giờ tối đa/ngày
              <input type="number" min="1" max="12" value={formData.max_daily_hours} onChange={(event) => setFormData((current) => ({ ...current, max_daily_hours: event.target.value }))} />
            </label>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default TrainerList;
