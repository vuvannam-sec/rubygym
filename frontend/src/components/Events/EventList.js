import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiBell, FiCheck, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import { getRotatedEventImage } from '../../services/imageUtils';
import MediaAsset from '../Layout/MediaAsset';
import { ActionIconButton, EmptyState, Modal, Pagination, SearchField, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';

const defaultForm = {
  title: '',
  date: '2026-04-20T08:00',
  attendees: 0,
  status: 'Đang mở đăng ký',
  image_url: ''
};

const normalizeDateTimeInput = (value) => {
  if (!value) {
    return '';
  }

  return String(value).replace(' ', 'T').slice(0, 16);
};

const displayDateTime = (value) => normalizeDateTimeInput(value).replace('T', ' ');

const buildDescription = (status, attendees) => `${status} - ${Number(attendees || 0)} người quan tâm`;

const parseDescription = (description) => {
  const fallback = { status: 'Đang mở đăng ký', attendees: 0 };

  if (!description) {
    return fallback;
  }

  const match = String(description).match(/^(.*?)\s+-\s+(\d+)\s+người quan tâm$/);
  if (!match) {
    return fallback;
  }

  return {
    status: match[1],
    attendees: Number(match[2])
  };
};

function EventList() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const pageSize = 4;

  const mapEvent = useCallback((eventItem) => {
    const parsed = parseDescription(eventItem.description);

    return {
      id: eventItem.id,
      title: eventItem.title,
      date: normalizeDateTimeInput(eventItem.event_date || eventItem.date),
      attendees: parsed.attendees || eventItem.attendees || 0,
      status: parsed.status || eventItem.status || 'Đang mở đăng ký',
      image_url: eventItem.image_url || '',
      created_by_name: eventItem.created_by_name || ''
    };
  }, []);

  const loadEvents = useCallback(async () => {
    const { data } = await api.get('/events');
    setEvents(data.map(mapEvent));
  }, [mapEvent]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await loadEvents();
      } catch (error) {
        setEvents([]);
        setToast({
          type: 'info',
          title: 'Chưa tải được danh sách sự kiện',
          message: normalizeApiError(error, 'Không tải được danh sách sự kiện từ backend.')
        });
      }
    };

    loadInitialData();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => events.filter((eventItem) => (
    eventItem.title.toLowerCase().includes(query.toLowerCase())
    || eventItem.status.toLowerCase().includes(query.toLowerCase())
  )), [events, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setViewingEvent(null);
    setEditingEvent(null);
    setFormData(defaultForm);
    setModalOpen(true);
  };

  const openViewModal = (eventItem) => {
    setViewingEvent(eventItem);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditModal = (eventItem) => {
    setViewingEvent(null);
    setEditingEvent(eventItem);
    setFormData({
      title: eventItem.title,
      date: eventItem.date,
      attendees: eventItem.attendees,
      status: eventItem.status,
      image_url: eventItem.image_url || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      setToast({ type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên sự kiện và thời gian.' });
      return;
    }

    const payload = {
      title: formData.title,
      description: buildDescription(formData.status, formData.attendees),
      event_date: formData.date.replace('T', ' '),
      image_url: formData.image_url
    };

    setSaving(true);

    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        setToast({ type: 'success', title: 'Đã cập nhật sự kiện', message: 'Thông tin sự kiện đã được lưu vào backend.' });
      } else {
        await api.post('/events', payload);
        setToast({ type: 'success', title: 'Đã tạo sự kiện', message: 'Sự kiện mới đã được lưu vào backend.' });
      }

      await loadEvents();
      setModalOpen(false);
    } catch (error) {
      setToast({
        type: 'error',
        title: editingEvent ? 'Không cập nhật được sự kiện' : 'Không tạo được sự kiện',
        message: normalizeApiError(error, 'Backend từ chối thao tác. Vui lòng kiểm tra dữ liệu và thử lại.')
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      await loadEvents();
      setToast({ type: 'success', title: 'Đã xóa sự kiện', message: 'Sự kiện đã được xóa khỏi backend.' });
    } catch (error) {
      setToast({
        type: 'error',
        title: 'Không xóa được sự kiện',
        message: normalizeApiError(error, 'Backend từ chối thao tác xóa.')
      });
    }
  };

  const isViewMode = Boolean(viewingEvent);

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Sự kiện"
        title="Quản lý sự kiện & chiến dịch"
        subtitle="Lên lịch workshop, bootcamp và các hoạt động cộng đồng bằng dữ liệu backend."
        actions={(
          <button type="button" className="primary-button" onClick={openCreateModal}>
            <FiPlus />
            Tạo sự kiện
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
          placeholder="Tìm theo tên sự kiện hoặc trạng thái"
        />
      </div>

      {pagedEvents.length ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sự kiện</th>
                  <th>Thời gian</th>
                  <th>Người tham gia</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedEvents.map((eventItem) => (
                  <tr key={eventItem.id}>
                    <td>
                      <div className="table-event">
                        <MediaAsset
                          src={getRotatedEventImage(eventItem.id, eventItem.image_url)}
                          alt={eventItem.title}
                          className="table-cover"
                          fallbackLabel={eventItem.title}
                          fallbackVariant="event"
                          titleOverlay={eventItem.title}
                          entityId={eventItem.id}
                        />
                        <div>
                          <strong>{eventItem.title}</strong>
                          <p>{eventItem.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{displayDateTime(eventItem.date)}</td>
                    <td>{eventItem.attendees}</td>
                    <td>
                      <StatusBadge
                        tone={eventItem.status === 'Đã đầy' ? 'warning' : eventItem.status === 'Sắp diễn ra' ? 'info' : 'success'}
                      >
                        {eventItem.status}
                      </StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem sự kiện" onClick={() => openViewModal(eventItem)}>
                        <FiEye />
                      </ActionIconButton>
                      <ActionIconButton label="Sửa sự kiện" onClick={() => openEditModal(eventItem)}>
                        <FiEdit />
                      </ActionIconButton>
                      <ActionIconButton label="Xóa sự kiện" tone="danger" onClick={() => handleDelete(eventItem.id)}>
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
          icon={<FiBell />}
          title="Chưa có sự kiện khớp bộ lọc"
          description="Bạn có thể tạo ngay một chiến dịch mới hoặc thay đổi từ khóa tìm kiếm."
          action={(
            <button type="button" className="primary-button" onClick={openCreateModal}>
              <FiPlus />
              Tạo sự kiện mới
            </button>
          )}
        />
      )}

      <Modal
        open={modalOpen}
        title={isViewMode ? 'Chi tiết sự kiện' : editingEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
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
            <div><span>Mã sự kiện</span><strong>{viewingEvent.id}</strong></div>
            <div><span>Tên sự kiện</span><strong>{viewingEvent.title}</strong></div>
            <div><span>Thời gian</span><strong>{displayDateTime(viewingEvent.date)}</strong></div>
            <div><span>Người tham gia</span><strong>{viewingEvent.attendees}</strong></div>
            <div><span>Trạng thái</span><strong>{viewingEvent.status}</strong></div>
            <div><span>Ảnh sự kiện</span><strong>{viewingEvent.image_url || 'Dùng ảnh mặc định'}</strong></div>
          </div>
        ) : (
          <div className="form-grid single-column">
            <label>
              Tên sự kiện
              <input value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} />
            </label>
            <label>
              Thời gian
              <input type="datetime-local" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
            </label>
            <label>
              Ảnh sự kiện
              <input value={formData.image_url} onChange={(event) => setFormData((current) => ({ ...current, image_url: event.target.value }))} />
            </label>
            <label>
              Số người tham gia
              <input
                type="number"
                min="0"
                value={formData.attendees}
                onChange={(event) => setFormData((current) => ({ ...current, attendees: Number(event.target.value) }))}
              />
            </label>
            <label>
              Trạng thái
              <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
                <option>Đang mở đăng ký</option>
                <option>Đã đầy</option>
                <option>Sắp diễn ra</option>
              </select>
            </label>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default EventList;
