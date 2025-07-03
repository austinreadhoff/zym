import React from 'react';
import logo from '../img/logo_lg.png';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <div id="sidebar-container">
        { !open &&
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        ☰
      </button> }
      <nav className={`sidebar ${open ? 'open' : ''}`}>
        <img id="login-logo" src={logo} alt="Zym Logo" />
        <Link to="/" onClick={() => setOpen(false)}>Dashboard</Link>
        <Link to="/login" onClick={() => localStorage.removeItem('token')}>Logout</Link>
      </nav>
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default Sidebar;
