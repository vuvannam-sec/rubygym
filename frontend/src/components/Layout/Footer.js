import BrandLogo from './BrandLogo';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <BrandLogo to="/" subtitle="Fitness center management" />
        </div>
        <p>© 2026 RubyGYM. Nền tảng quản lý phòng gym dành cho vận hành, huấn luyện và chăm sóc hội viên.</p>
      </div>
    </footer>
  );
}

export default Footer;
