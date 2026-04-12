import { useEffect, useMemo, useState } from 'react';
import { FiBell, FiCheck, FiEdit, FiEye, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { events as initialEvents } from '../../data/mockData';
import api from '../../services/api';
import { normalizeApiError } from '../../services/fallbacks';
import MediaAsset from '../Layout/MediaAsset';
import { ActionIconButton, EmptyState, Modal, Pagination, SearchField, SectionHeader, StatusBadge, Toast } from '../Layout/ProductUI';
import { getRotatedEventImage } from '../../services/imageUtils';

function EventList() {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '2026-04-20 08:00',
    attendees: 0,
    status: 'Đang mở đăng ký',
    image_url: ''
  });
  const pageSize = 4;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await api.get('/events');
        if (data.length > 0) {
          setEvents(data.map((eventItem) => ({
            id: eventItem.id,
            title: eventItem.title,
            date: String(eventItem.event_date).replace('T', ' ').slice(0, 16),
            attendees: 0,
            status: 'Đang mở đăng ký',
            image_url: eventItem.image_url || ''
          })));
        }
      } catch (error) {
        // Keep fallback data.
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => events.filter((eventItem) => (
    eventItem.title.toLowerCase().includes(query.toLowerCase())
    || eventItem.status.toLowerCase().includes(query.toLowerCase())
  )), [events, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '2026-04-20 08:00',
      attendees: 0,
      status: 'Đang mở đăng ký',
      image_url: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (eventItem) => {
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
    if (!formData.title) {
      setToast({ type: 'error', title: 'Thiếu tiêu đề sự kiện', message: 'Vui lòng nhập tên sự kiện trước khi lưu.' });
      return;
    }

    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, {
          title: formData.title,
          description: `${formData.status} - ${formData.attendees} người quan tâm`,
          event_date: formData.date,
          image_url: formData.image_url
        });
        setEvents((current) => current.map((eventItem) => (
          eventItem.id === editingEvent.id ? { ...eventItem, ...formData } : eventItem
        )));
        setToast({ type: 'success', title: 'Đã cập nhật sự kiện', message: 'Thông tin sự kiện đã được cập nhật.' });
      } else {
        const { data } = await api.post('/events', {
          title: formData.title,
          description: `${formData.status} - ${formData.attendees} người quan tâm`,
          event_date: formData.date,
          image_url: formData.image_url
        });
        setEvents((current) => [...current, { id: data.eventId, ...formData }]);
        setToast({ type: 'success', title: 'Đã tạo sự kiện', message: 'Sự kiện mới đã được thêm vào lịch marketing.' });
      }
    } catch (error) {
      if (editingEvent) {
        setEvents((current) => current.map((eventItem) => (
          eventItem.id === editingEvent.id ? { ...eventItem, ...formData } : eventItem
        )));
      } else {
        setEvents((current) => [...current, { id: `EV-${Date.now()}`, ...formData }]);
      }

      setToast({ type: 'info', title: 'Đang dùng dữ liệu cục bộ', message: normalizeApiError(error, 'Backend chưa sẵn sàng, sự kiện được lưu tạm trên giao diện.') });
    }

    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      setToast({ type: 'success', title: 'Đã xóa sự kiện', message: 'Sự kiện đã được gỡ khỏi danh sách.' });
    } catch (error) {
      setToast({ type: 'info', title: 'Đang dùng dữ liệu cục bộ', message: normalizeApiError(error, 'Backend chưa sẵn sàng, sự kiện chỉ được xóa trên giao diện hiện tại.') });
    }

    setEvents((current) => current.filter((eventItem) => eventItem.id !== id));
  };

  return (
    <section className="page-card">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <SectionHeader
        eyebrow="Admin / Sự kiện"
        title="Quản lý sự kiện & chiến dịch"
        subtitle="Lên lịch workshop, bootcamp và các hoạt động cộng đồng giúp tăng mức độ gắn kết hội viên."
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
                    <td>{eventItem.date}</td>
                    <td>{eventItem.attendees}</td>
                    <td>
                      <StatusBadge
                        tone={eventItem.status === 'Đã đầy' ? 'warning' : eventItem.status === 'Sắp diễn ra' ? 'info' : 'success'}
                      >
                        {eventItem.status}
                      </StatusBadge>
                    </td>
                    <td className="table-actions">
                      <ActionIconButton label="Xem sự kiện" onClick={() => openEditModal(eventItem)}>
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
        title={editingEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
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
            Tên sự kiện
            <input value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} />
          </label>
          <label>
            Thời gian
            <input value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
          </label>
          <label>
            Ảnh sự kiện
            <input value={formData.image_url} onChange={(event) => setFormData((current) => ({ ...current, image_url: event.target.value }))} />
          </label>
          <label>
            Số người tham gia
            <input
              type="number"
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
      </Modal>
    </section>
  );
}

export default EventList;
