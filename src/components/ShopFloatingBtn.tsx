import { useNavigate, useLocation } from 'react-router-dom';
import './ShopFloatingBtn.css';

export default function ShopFloatingBtn() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname !== '/') return null;

  function handleClick() {
    const el = document.getElementById('browse-trees-cards');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate('/shop');
    }
  }

  return (
    <button className="shop-float-btn" onClick={handleClick} aria-label="Browse trees">
      <span className="shop-float-pulse" />
      🌳 Pick Your Tree
    </button>
  );
}
