import { useEffect, useState } from 'react';
import { FiActivity, FiArrowLeft, FiCalendar, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { events as fallbackEvents, facilityHighlights, landingFeatures, landingTrainers } from '../../data/mockData';
import api from '../../services/api';
import MediaAsset from '../Layout/MediaAsset';
import { getRotatedEventImage, imageCatalog } from '../../services/imageUtils';

function LandingPage() {
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    const loadPublicEvents = async () => {
      try {
        const { data } = await api.get('/events');
        if (data.length > 0) {
          setEvents(data.map((eventItem) => ({
            id: eventItem.id,
            title: eventItem.title,
            date: String(eventItem.event_date).replace('T', ' ').slice(0, 16),
            status: 'Sự kiện cộng đồng',
            attendees: 0,
            image_url: eventItem.image_url || ''
          })));
        }
      } catch (error) {
        // Keep fallback events for public landing page.
      }
    };

    loadPublicEvents();
  }, []);

  return (
    <div className="landing-page">
      <section className="hero-section" id="pricing">
        <MediaAsset
          src={imageCatalog.heroPrimary}
          alt="Không gian luyện tập RubyGYM"
          className="hero-background"
          fallbackLabel="Hero banner"
        />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="hero-eyebrow">Nền tảng quản lý phòng gym thế hệ mới</p>
          <h1>Quản lý phòng gym thông minh</h1>
          <p className="hero-description">
            RubyGYM giúp phòng tập vận hành tập trung từ lịch tập, hội viên, huấn luyện viên đến doanh thu và trải nghiệm
            khách hàng trong một giao diện chuyên nghiệp, hiện đại.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="primary-button">
              <FiArrowLeft />
              Bắt đầu ngay
            </Link>
            <Link to="/register" className="ghost-button hero-ghost">
              Tạo tài khoản
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-visual-card">
            <MediaAsset
              src={imageCatalog.heroSecondary}
              alt="Huấn luyện viên đang hướng dẫn hội viên"
              className="feature-image"
              fallbackLabel="Hero alternate"
            />
          </div>
          <div className="hero-stat">
            <span>Tỷ lệ giữ chân</span>
            <strong>82%</strong>
          </div>
          <div className="hero-stat">
            <span>Lịch được lấp đầy</span>
            <strong>91%</strong>
          </div>
          <div className="hero-stat">
            <span>Tăng trưởng doanh thu</span>
            <strong>+12%</strong>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Năng lực cốt lõi</p>
            <h2>Thiết kế cho phòng gym vận hành thực chiến</h2>
          </div>
        </div>
        <div className="feature-grid">
          {landingFeatures.map((feature) => (
            <article key={feature.title} className="feature-card">
              <MediaAsset src={feature.image} alt={feature.title} className="feature-image" fallbackLabel={feature.title} />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Sự kiện công khai</p>
            <h2>Hoạt động nổi bật tại RubyGYM</h2>
            <p className="section-subtitle">Workshop, challenge và bootcamp giúp tăng sự gắn kết với cộng đồng hội viên.</p>
          </div>
        </div>
        <div className="feature-grid">
          {events.slice(0, 3).map((eventItem) => (
            <article key={eventItem.id} className="feature-card event-card">
              <MediaAsset
                src={getRotatedEventImage(eventItem.id, eventItem.image_url)}
                alt={eventItem.title}
                className="feature-image"
                fallbackLabel={eventItem.title}
                fallbackVariant="event"
                titleOverlay={eventItem.title}
                entityId={eventItem.id}
              />
              <div className="event-meta">
                <span className="inline-icon-text"><FiCalendar /> {eventItem.date}</span>
                <span className="inline-icon-text"><FiUsers /> {eventItem.attendees || 0} người quan tâm</span>
              </div>
              <h3>{eventItem.title}</h3>
              <p>{eventItem.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Đội ngũ huấn luyện</p>
            <h2>Huấn luyện viên đồng hành cùng từng mục tiêu</h2>
            <p className="section-subtitle">Đội ngũ PT nhiều kinh nghiệm giúp hội viên bám sát lộ trình và theo dõi tiến bộ rõ ràng.</p>
          </div>
        </div>
        <div className="feature-grid">
          {landingTrainers.map((trainer) => (
            <article key={trainer.id} className="feature-card trainer-card">
              <MediaAsset
                src={trainer.image}
                alt={trainer.name}
                className="feature-image"
                fallbackLabel={trainer.name}
                titleOverlay={trainer.name}
              />
              <h3>{trainer.name}</h3>
              <p className="inline-icon-text"><FiActivity /> {trainer.specialization}</p>
              <p>{trainer.quote}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Cơ sở vật chất</p>
            <h2>Không gian hiện đại, sạch và dễ vận hành</h2>
            <p className="section-subtitle">Từ khu tạ, cardio đến lễ tân, mọi khu vực đều được hiển thị đồng bộ với thương hiệu RubyGYM.</p>
          </div>
        </div>
        <div className="feature-grid">
          {facilityHighlights.map((facility) => (
            <article key={facility.title} className="feature-card">
              <MediaAsset src={facility.image} alt={facility.title} className="feature-image" fallbackLabel={facility.title} />
              <h3>{facility.title}</h3>
              <p>{facility.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
