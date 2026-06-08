import { useEffect, useState } from 'react';
import {
  FiActivity,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiStar,
  FiUsers
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  contactInfo,
  events as fallbackEvents,
  facilityHighlights,
  gymClasses,
  landingTrainers,
  membershipPlans,
  testimonials
} from '../../data/mockData';
import api from '../../services/api';
import MediaAsset from '../Layout/MediaAsset';
import { getRotatedEventImage, imageCatalog } from '../../services/imageUtils';

const heroStats = [
  { label: 'Hội viên đang tập', value: '1.200+' },
  { label: 'Huấn luyện viên', value: '18' },
  { label: 'Lớp mỗi tuần', value: '60+' }
];

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
        // Keep fallback events for the public landing page.
      }
    };

    loadPublicEvents();
  }, []);

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero-section">
        <MediaAsset
          src={imageCatalog.heroPrimary}
          alt="Không gian luyện tập RubyGYM"
          className="hero-background"
          fallbackLabel="Hero banner"
        />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="hero-eyebrow">Trung tâm thể hình RubyGYM</p>
          <h1>Mạnh mẽ hơn mỗi ngày</h1>
          <p className="hero-description">
            Phòng tập hiện đại, huấn luyện viên đồng hành và lộ trình cá nhân hóa. Đăng ký hội viên, chọn HLV và bắt đầu
            hành trình thay đổi vóc dáng của bạn ngay hôm nay.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Đăng ký hội viên
              <FiArrowRight />
            </Link>
            <a href="#pricing" className="ghost-button hero-ghost">
              Xem bảng giá
            </a>
          </div>
          <div className="hero-stat-row">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
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
        </div>
      </section>

      {/* Programs / classes */}
      <section className="landing-section" id="classes">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Chương trình tập luyện</p>
            <h2>Lớp tập cho mọi mục tiêu</h2>
            <p className="section-subtitle">Từ đốt mỡ, tăng cơ đến yoga phục hồi — chọn chương trình phù hợp với thể trạng và mục tiêu của bạn.</p>
          </div>
        </div>
        <div className="feature-grid">
          {gymClasses.map((item) => (
            <article key={item.id} className="feature-card class-card">
              <MediaAsset src={item.image} alt={item.name} className="feature-image" fallbackLabel={item.name} />
              <span className="class-level"><FiActivity /> {item.level}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Membership pricing */}
      <section className="landing-section" id="pricing">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Gói hội viên</p>
            <h2>Chọn gói phù hợp với bạn</h2>
            <p className="section-subtitle">Đóng phí theo 3 tháng, 6 tháng hoặc 1 năm. Thời gian ưu đãi được cộng dồn vào thời hạn hội viên.</p>
          </div>
        </div>
        <div className="pricing-grid">
          {membershipPlans.map((plan) => (
            <article key={plan.id} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured ? <span className="pricing-badge">Phổ biến nhất</span> : null}
              <p className="pricing-tagline">{plan.tagline}</p>
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                <strong>{plan.price}</strong>
                <span>{plan.perMonth}</span>
              </div>
              <ul className="pricing-perks">
                {plan.perks.map((perk) => (
                  <li key={perk}><FiCheck /> {perk}</li>
                ))}
              </ul>
              <Link to="/register" className={plan.featured ? 'primary-button' : 'ghost-button'}>
                Đăng ký gói này
                <FiArrowRight />
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note">
          <FiStar /> Hội viên tập trên 1 năm trở thành hội viên thân thiết và được tặng 3 tháng khi gia hạn. Giới thiệu bạn bè nhận thêm 1 tháng tập miễn phí cho mỗi người tham gia.
        </p>
      </section>

      {/* Trainers */}
      <section className="landing-section" id="trainers">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Đội ngũ huấn luyện</p>
            <h2>Huấn luyện viên đồng hành cùng bạn</h2>
            <p className="section-subtitle">Đội ngũ PT nhiều kinh nghiệm giúp bạn bám sát lộ trình và theo dõi tiến bộ rõ ràng.</p>
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

      {/* Facilities */}
      <section className="landing-section" id="facilities">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Cơ sở vật chất</p>
            <h2>Không gian hiện đại, đầy đủ tiện nghi</h2>
            <p className="section-subtitle">Từ khu tạ, cardio đến lễ tân — mọi khu vực đều sạch sẽ và sẵn sàng cho buổi tập của bạn.</p>
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

      {/* Events */}
      <section className="landing-section" id="events">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Sự kiện hằng tháng</p>
            <h2>Hoạt động nổi bật tại RubyGYM</h2>
            <p className="section-subtitle">Workshop, challenge và bootcamp giúp tăng động lực và gắn kết cộng đồng hội viên.</p>
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

      {/* Testimonials */}
      <section className="landing-section" id="stories">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">Cảm nhận hội viên</p>
            <h2>Kết quả thật từ hội viên RubyGYM</h2>
          </div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.id} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, index) => <FiStar key={index} />)}
              </div>
              <p className="testimonial-quote">“{item.quote}”</p>
              <div className="testimonial-person">
                <MediaAsset
                  src={item.image}
                  alt={item.name}
                  className="table-avatar"
                  fallbackVariant="avatar"
                  fallbackLabel={item.name}
                  entityId={item.id}
                />
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.result}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA + contact */}
      <section className="cta-band">
        <MediaAsset src={imageCatalog.ctaBanner} alt="Tham gia RubyGYM" className="cta-bg" fallbackLabel="RubyGYM" />
        <div className="cta-overlay" />
        <div className="cta-copy">
          <p className="section-eyebrow">Sẵn sàng bắt đầu?</p>
          <h2>Buổi tập đầu tiên của bạn đang chờ tại RubyGYM</h2>
          <p>Đăng ký hội viên hôm nay, chọn huấn luyện viên và để chúng tôi đồng hành cùng mục tiêu của bạn.</p>
          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Đăng ký ngay
              <FiArrowRight />
            </Link>
            <Link to="/login" className="ghost-button">Đã có tài khoản? Đăng nhập</Link>
          </div>
        </div>
        <div className="contact-card">
          <h3>Thông tin liên hệ</h3>
          <ul className="contact-list">
            <li><FiMapPin /> {contactInfo.address}</li>
            <li><FiPhone /> {contactInfo.phone}</li>
            <li><FiMail /> {contactInfo.email}</li>
            {contactInfo.hours.map((slot) => (
              <li key={slot.label}><FiClock /> {slot.label}: {slot.value}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
