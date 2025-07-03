import './Header.css';
import { useLocation } from 'react-router-dom';

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/recipe': 'Recipe'
};

function Header() {
  const location = useLocation();
  const firstSegment = '/' + location.pathname.split('/')[1];
  const title = TITLES[firstSegment] || 'Page';

  return (
    <div id="header">
      <h1 id="page-title">{title}</h1>
    </div>
  );
}

export default Header;
