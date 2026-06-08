import { Link } from 'react-router-dom';

function BrandLogo({ to = '/', light = false, className = '', subtitle = '' }) {
  const classes = ['brand-logo', light ? 'brand-logo-light' : 'brand-logo-dark', className].filter(Boolean).join(' ');

  const content = (
    <>
      <img src="/images/logo.png" alt="RubyGYM" className="brand-logo-img" />
      {subtitle ? <span className="brand-subtitle">{subtitle}</span> : null}
    </>
  );

  if (!to) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}

export default BrandLogo;
