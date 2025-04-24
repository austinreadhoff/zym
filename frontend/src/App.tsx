import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      setAuthenticated(true);
    }
  }, []);


  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setAuthenticated(true)} />} />
      <Route path="/" element={authenticated ? <Dashboard /> : <Login onLogin={() => setAuthenticated(true)} />} />
    </Routes>
  );
}

export default App;
