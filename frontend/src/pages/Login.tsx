import './Login.css';
import logo from '../img/logo_lg.png';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../APIClient';

type LoginProps = {
  onLogin: () => void;
};

function Login({ onLogin }: LoginProps) {
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
    <form id="login-form" onSubmit={handleSubmit}>
      <img id="login-logo" src={logo} alt="Zym Logo" />
      <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Username" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button id="login-button" type="submit">Login</button>
      {error && <span id="login-error">{error}</span>}
    </form>
  );
}

export default Login;
