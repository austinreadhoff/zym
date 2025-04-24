import React, { useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './APIClient';

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    apiFetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    .then((responseObj) => {
      if (responseObj.response.ok) {
        localStorage.setItem('token', responseObj.data.token);
        onLogin();
        navigate('/');
      } else {
        setError(responseObj.data.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
