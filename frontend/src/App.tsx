import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Recipe from './pages/Recipe';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

function App() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setAuthenticated(true);
    }
  }, []);

  return (
    <div>
      {!isLoginPage && authenticated && <Header />}
      {!isLoginPage && authenticated && <Sidebar />}
      <div id="app-container">
        <Routes>
          <Route path="/login" element={<Login onLogin={() => setAuthenticated(true)} />} />
          <Route path="/" element={authenticated ? <Dashboard /> : <Login onLogin={() => setAuthenticated(true)} />} />
          <Route path="/recipe/:id" element={authenticated ? <Recipe /> : <Login onLogin={() => setAuthenticated(true)} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
