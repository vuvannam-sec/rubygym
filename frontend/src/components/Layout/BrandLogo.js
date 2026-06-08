import { Link } from 'react-router-dom';
import { GiWeight } from 'react-icons/gi';

function BrandLogo({ to = '/', light = false, className = '', subtitle = '' }) {
  const classes = ['brand-logo', light ? 'brand-logo-light' : 'brand-logo-dark', className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <GiWeight />
      </span>
      <span className="brand-text-wrap">
        <span className="brand-text">
          <span className="brand-ruby">Ruby</span>
          <span className="brand-gym">GYM</span>
        </span>
        {subtitle ? <span className="brand-subtitle">{subtitle}</span> : null}
      </span>
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
