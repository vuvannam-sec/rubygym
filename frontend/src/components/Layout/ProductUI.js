import { FiEye, FiInbox, FiSearch, FiX } from 'react-icons/fi';

export function SectionHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({ icon, label, value, caption }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <p className="metric-label">{label}</p>
        <strong className="metric-value">{value}</strong>
        {caption ? <p className="metric-caption">{caption}</p> : null}
      </div>
    </article>
  );
}

export function StatusBadge({ tone = 'neutral', children }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}

export function SearchField({ value, onChange, placeholder }) {
  return (
    <label className="search-field">
      <FiSearch aria-hidden="true" />
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

export function ActionIconButton({ label, tone = 'ghost', onClick, children, type = 'button' }) {
  return (
    <button type={type} className={`icon-action-button icon-action-${tone}`} onClick={onClick} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export function EmptyState({ icon = <FiInbox />, title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}

export function LoadingPanel({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="loading-panel">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function Modal({ open, title, onClose, children, actions }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Đóng">
            <FiX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Toast({ toast, onClose }) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast-${toast.type || 'info'}`}>
      <div>
        <strong>{toast.title}</strong>
        {toast.message ? <p>{toast.message}</p> : null}
      </div>
      <button type="button" className="icon-button" onClick={onClose} aria-label="Tắt thông báo">
        <FiX />
      </button>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button type="button" className="ghost-button" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
        Trước
      </button>
      <span>
        Trang {page}/{totalPages}
      </span>
      <button
        type="button"
        className="ghost-button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        Sau
      </button>
    </div>
  );
}

export function PreviewHint({ text = 'Xem nhanh' }) {
  return (
    <span className="preview-hint">
      <FiEye aria-hidden="true" />
      {text}
    </span>
  );
}
