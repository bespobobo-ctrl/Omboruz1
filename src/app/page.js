'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('omboruz_token');
    const user = localStorage.getItem('omboruz_user');
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'rahbar') {
        router.push('/rahbar');
      } else {
        router.push('/ombor');
      }
    } else {
      setCheckingAuth(false);
    }

    // Initialize Telegram Web App
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#0a0a1a');
      window.Telegram.WebApp.setBackgroundColor('#0a0a1a');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('omboruz_token', data.token);
        localStorage.setItem('omboruz_user', JSON.stringify(data.user));

        if (data.user.role === 'rahbar') {
          router.push('/rahbar');
        } else {
          router.push('/ombor');
        }
      } else {
        setError(data.message || 'Login yoki parol noto\'g\'ri');
      }
    } catch (err) {
      setError('Tarmoq xatosi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="login-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-logo">🏭</div>
      <h1 className="login-title">OmborUZ</h1>
      <p className="login-subtitle">Ombor Boshqaruv Tizimi</p>

      <div className="login-card">
        <form onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">Login</label>
            <input
              type="text"
              className="form-input"
              placeholder="Loginni kiriting"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parol</label>
            <input
              type="password"
              className="form-input"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Kirilyapti...' : '🔐 Kirish'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
        ⚡ Powered by Tarraqiyot
      </p>
    </div>
  );
}
