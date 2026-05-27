import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheck, FiEdit, FiEye, FiPlus, FiTrash2, FiUsers, FiX } from 'react-icons/fi';
import { members as initialMembers } from '../../data/mockData';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { getDefaultMemberAvatar } from '../../services/imageUtils';
import MediaAsset from '../Layout/MediaAsset';
import { ActionIconButton, EmptyState, Modal, Pagination, SearchField, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

function MemberList() {
  const [members, setMembers] = useState(initialMembers);
  const [trainers, setTrainers] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    is_loyal: false,
    trainer: '',
    trainer_id: '',
    joinDate: '2026-04-10',
    status: 'Đang hoạt động'
  });
  const pageSize = 4;

  const mapMember = useCallback((member) => {
    const fallbackMember = initialMembers.find((item) => item.id === member.id);

    return {
      id: member.id,
      name: member.full_name,
      email: member.email || '',
      phone: member.phone || '',
      plan: member.is_loyal ? 'Hội viên thân thiết' : 'Hội viên thường',
      is_loyal: Boolean(member.is_loyal),
      trainer: member.trainer_name || 'Chưa phân công',
      trainer_id: member.trainer_id || '',
      joinDate: String(member.join_date).slice(0, 10),
      status: 'Đang hoạt động',
      gender: member.gender || fallbackMember?.gender || '',
      avatar_url: member.avatar_url || member.avatar || fallbackMember?.avatar_url || ''
    };
  }, []);

  const loadAdminData = useCallback(async () => {
    const [memberResponse, trainerResponse] = await Promise.all([
      api.get('/members'),
      api.get('/trainers')
    ]);

    setMembers(memberResponse.data.map(mapMember));
    setTrainers(trainerResponse.data.map((trainer) => ({
      id: trainer.id,
      name: trainer.full_name
    })));
  }, [mapMember]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadAdminData();
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được danh sách hội viên từ backend.')
        });
      }
    };

    loadInitialData();
  }, [loadAdminData]);

  const filteredMembers = useMemo(() => members.filter((member) => (
    member.name.toLowerCase().includes(query.toLowerCase())
    || member.trainer.toLowerCase().includes(query.toLowerCase())
    || member.plan.toLowerCase().includes(query.toLowerCase())
  )), [members, query]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const pagedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setViewingMember(null);
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      is_loyal: false,
      trainer: '',
      trainer_id: '',
      joinDate: '2026-04-10',
      status: 'Đang hoạt động'
    });
    setModalOpen(true);
  };

  const openViewModal = (member) => {
    setViewingMember(member);
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setViewingMember(null);
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      password: '',
      phone: member.phone || '',
      is_loyal: Boolean(member.is_loyal),
      trainer: member.trainer,
      trainer_id: member.trainer_id || '',
      joinDate: member.joinDate,
      status: member.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.joinDate) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập họ tên, email, số điện thoại và ngày tham gia.' });
      return;
    }

    if (!editingMember && !formData.password) {
      setToast({ type: 'error', title: 'Thiếu mật khẩu', message: 'Vui lòng nhập mật khẩu ban đầu cho hội viên mới.' });
      return;
    }

    setSaving(true);

    try {
      if (editingMember) {
        await api.put(`/members/${editingMember.id}`, {
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
          trainer_id: formData.trainer_id || null,
          join_date: formData.joinDate,
          is_loyal: formData.is_loyal
        });

        setToast({ type: 'success', title: 'Đã cập nhật hội viên', message: 'Thông tin hồ sơ đã được lưu vào backend.' });
      } else {
        await api.post('/members', {
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          trainer_id: formData.trainer_id || null,
          join_date: formData.joinDate,
          is_loyal: formData.is_loyal
        });

        setToast({ type: 'success', title: 'Đã thêm hội viên', message: 'Hồ sơ hội viên mới đã được lưu vào backend.' });
      }

      await loadAdminData();
      setModalOpen(false);
    } catch (error) {
      setToast({
        type: 'error',
        title: editingMember ? 'Không cập nhật được hội viên' : 'Không thêm được hội viên',
        message: normalizeApiError(error, 'Backend từ chối thao tác. Vui lòng kiểm tra dữ liệu và thử lại.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/members/${id}`);
      await loadAdminData();
      setToast({ type: 'success', title: 'Đã xóa hội viên', message: 'Bản ghi đã được xóa khỏi backend.' });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không xóa được hội viên',
        message: normalizeApiError(error, 'Backend từ chối thao tác xóa.')
      });
    }
  };

  const isViewMode = Boolean(viewingMember);

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Hội viên"
        title="Quản lý hội viên"
        subtitle="Tra cứu nhanh, cập nhật hồ sơ và điều phối huấn luyện viên phụ trách trong một bảng quản trị duy nhất."
        actions={(
          <button type="button" className="primary-button" onClick={openCreateModal}>
            <FiPlus />
            Thêm hội viên
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
          placeholder="Tìm theo tên, gói tập hoặc huấn luyện viên"
        />
      </div>

      {pagedMembers.length ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hội viên</th>
	                  <th>Loại hội viên</th>
                  <th>Huấn luyện viên</th>
                  <th>Ngày tham gia</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="table-person">
                        <MediaAsset
                          src={getDefaultMemberAvatar(member)}
                          alt={member.name}
                          className="table-avatar"
                          fallbackLabel={member.name}
                          fallbackVariant="avatar"
                          entityId={member.id}
                        />
                        <div>
                          <strong>{member.name}</strong>
                          <p>{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{member.plan}</td>
                    <td>{member.trainer}</td>
                    <td>{member.joinDate}</td>
                    <td>
                      <StatusBadge tone={member.status === 'Đang hoạt động' ? 'success' : 'neutral'}>{member.status}</StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem hội viên" onClick={() => openViewModal(member)}>
                        <FiEye />
                      </ActionIconButton>
                      <ActionIconButton label="Sửa hội viên" onClick={() => openEditModal(member)}>
                        <FiEdit />
                      </ActionIconButton>
                      <ActionIconButton label="Xóa hội viên" tone="danger" onClick={() => handleDelete(member.id)}>
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
          icon={<FiUsers />}
          title="Chưa có kết quả phù hợp"
          description="Không tìm thấy hội viên khớp với từ khóa hiện tại."
          action={(
            <button type="button" className="primary-button" onClick={openCreateModal}>
              <FiPlus />
              Tạo hội viên mới
            </button>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        title={isViewMode ? 'Chi tiết hội viên' : editingMember ? 'Cập nhật hội viên' : 'Thêm hội viên'}
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
            <div>
              <span>Mã hội viên</span>
              <strong>{viewingMember.id}</strong>
            </div>
            <div>
              <span>Họ tên</span>
              <strong>{viewingMember.name}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{viewingMember.email || 'Chưa cập nhật'}</strong>
            </div>
            <div>
              <span>Số điện thoại</span>
              <strong>{viewingMember.phone || 'Chưa cập nhật'}</strong>
            </div>
            <div>
              <span>Huấn luyện viên</span>
              <strong>{viewingMember.trainer}</strong>
            </div>
            <div>
              <span>Ngày tham gia</span>
              <strong>{viewingMember.joinDate}</strong>
            </div>
            <div>
              <span>Loại hội viên</span>
              <strong>{viewingMember.plan}</strong>
            </div>
            <div>
              <span>Trạng thái</span>
              <strong>{viewingMember.status}</strong>
            </div>
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
            {!editingMember ? (
              <label>
                Mật khẩu ban đầu
                <input type="password" value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} />
              </label>
            ) : null}
            <label>
              Số điện thoại
              <input value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label>
              Huấn luyện viên
              <select
                value={formData.trainer_id}
                onChange={(event) => {
                  const selectedTrainer = trainers.find((trainer) => String(trainer.id) === event.target.value);
                  setFormData((current) => ({
                    ...current,
                    trainer_id: event.target.value,
                    trainer: selectedTrainer?.name || 'Chưa phân công'
                  }));
                }}
              >
                <option value="">Chưa phân công</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Ngày tham gia
              <input type="date" value={formData.joinDate} onChange={(event) => setFormData((current) => ({ ...current, joinDate: event.target.value }))} />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={formData.is_loyal} onChange={(event) => setFormData((current) => ({ ...current, is_loyal: event.target.checked }))} />
              Hội viên thân thiết
            </label>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default MemberList;
