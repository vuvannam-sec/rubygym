import { useEffect, useMemo, useState } from 'react';
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
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    plan: 'Standard 6 tháng',
    trainer: '',
    trainer_id: '',
    joinDate: '2026-04-10',
    status: 'Đang hoạt động'
  });
  const pageSize = 4;

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [memberResponse, trainerResponse] = await Promise.all([
          api.get('/members'),
          api.get('/trainers')
        ]);

        setMembers(memberResponse.data.map((member) => ({
          id: member.id,
          name: member.full_name,
          plan: member.is_loyal ? 'Hội viên thân thiết' : 'Hội viên thường',
          trainer: member.trainer_name || 'Chưa phân công',
          trainer_id: member.trainer_id || '',
          joinDate: String(member.join_date).slice(0, 10),
          status: 'Đang hoạt động',
          gender: member.gender || initialMembers.find((fallbackMember) => fallbackMember.id === member.id)?.gender || '',
          avatar_url: member.avatar_url || member.avatar || initialMembers.find((fallbackMember) => fallbackMember.id === member.id)?.avatar_url || ''
        })));
        setTrainers(trainerResponse.data.map((trainer) => ({
          id: trainer.id,
          name: trainer.full_name
        })));
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Đang hiển thị dữ liệu mẫu',
          message: normalizeApiError(error, 'Không tải được danh sách hội viên từ backend.')
        });
      }
    };

    loadAdminData();
  }, []);

  const filteredMembers = useMemo(() => members.filter((member) => (
    member.name.toLowerCase().includes(query.toLowerCase())
    || member.trainer.toLowerCase().includes(query.toLowerCase())
    || member.plan.toLowerCase().includes(query.toLowerCase())
  )), [members, query]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const pagedMembers = filteredMembers.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      plan: 'Standard 6 tháng',
      trainer: '',
      trainer_id: '',
      joinDate: '2026-04-10',
      status: 'Đang hoạt động'
    });
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      plan: member.plan,
      trainer: member.trainer,
      trainer_id: member.trainer_id || '',
      joinDate: member.joinDate,
      status: member.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên hội viên.' });
      return;
    }

    if (editingMember) {
      try {
        await api.put(`/members/${editingMember.id}`, {
          trainer_id: formData.trainer_id || null
        });
      } catch (error) {
        setToast({
          type: 'info',
          title: 'Không đồng bộ được backend',
          message: normalizeApiError(error, 'Thay đổi hiện chỉ được áp dụng trên giao diện hiện tại.')
        });
      }

      setMembers((current) => current.map((member) => (
        member.id === editingMember.id ? { ...member, ...formData } : member
      )));
      setToast({ type: 'success', title: 'Đã cập nhật hội viên', message: 'Thông tin hồ sơ đã được lưu.' });
    } else {
      setMembers((current) => [...current, { id: Date.now(), ...formData }]);
      setToast({ type: 'success', title: 'Đã thêm hội viên', message: 'Hồ sơ hội viên mới đã sẵn sàng.' });
    }

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setMembers((current) => current.filter((member) => member.id !== id));
    setToast({ type: 'success', title: 'Đã xóa hội viên', message: 'Bản ghi hiển thị đã được gỡ khỏi bảng quản lý.' });
  };

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
                  <th>Gói tập</th>
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
                      <ActionIconButton label="Xem hội viên" onClick={() => openEditModal(member)}>
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
        title={editingMember ? 'Cập nhật hội viên' : 'Thêm hội viên'}
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
            <input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Gói tập
            <select value={formData.plan} onChange={(event) => setFormData((current) => ({ ...current, plan: event.target.value }))}>
              <option>Standard 3 tháng</option>
              <option>Standard 6 tháng</option>
              <option>Premium 12 tháng</option>
            </select>
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
          <label>
            Trạng thái
            <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
              <option>Đang hoạt động</option>
              <option>Tạm dừng</option>
            </select>
          </label>
        </div>
      </Modal>
    </section>
  );
}

export default MemberList;
