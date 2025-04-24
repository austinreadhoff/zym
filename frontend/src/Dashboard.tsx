import React, { useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './APIClient';

function Dashboard() {
  const [message, setMessage] = React.useState("");

  //TODO: export logout button and function to a common location
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    apiFetch('/api/hello')
    .then((responseObj) => {
      setMessage(responseObj.data.message);
    });
  }, []);

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <h1>{message}</h1>
    </div>
  );
}

export default Dashboard;
