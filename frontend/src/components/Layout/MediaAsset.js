import { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import { getAvatarPlaceholderColor, getMemberInitials } from '../../services/imageUtils';

function MediaAsset({
  src,
  alt,
  className = '',
  fallbackLabel = 'RubyGYM',
  fallbackVariant = 'generic',
  titleOverlay = '',
  entityId,
  initials,
  children
}) {
  const [hasError, setHasError] = useState(false);

  const resolvedInitials = initials || getMemberInitials(fallbackLabel);
  const avatarColor = getAvatarPlaceholderColor(entityId);

  if (!src || hasError) {
    if (fallbackVariant === 'avatar') {
      return (
        <div
          className={`media-avatar-fallback ${className}`.trim()}
          role="img"
          aria-label={alt || fallbackLabel}
          style={{ background: avatarColor }}
        >
          <span>{resolvedInitials}</span>
          {children}
        </div>
      );
    }

    return (
      <div className={`media-fallback media-fallback-${fallbackVariant} ${className}`.trim()} role="img" aria-label={alt || fallbackLabel}>
        {fallbackVariant === 'event' ? (
          <div className="media-fallback-overlay">
            <span>{titleOverlay || fallbackLabel}</span>
          </div>
        ) : (
          <>
            <FiImage />
            <span>{fallbackLabel}</span>
          </>
        )}
        {children}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}

export default MediaAsset;
