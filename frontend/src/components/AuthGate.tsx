import React, { useState, useEffect } from 'react';

const FRANKSTATION_API = 'https://frankstation.org/api/auth';

type AuthState = 'loading' | 'login' | 'redeem' | 'ready';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fs_token');
    if (!token) { setAuthState('login'); return; }
    fetch(`${FRANKSTATION_API}/franksheets-access`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setAuthState(d.hasAccess ? 'ready' : 'redeem'))
      .catch(() => setAuthState('login'));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await fetch(`${FRANKSTATION_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Login failed'); return; }
      localStorage.setItem('fs_token', d.token);
      const access = await fetch(`${FRANKSTATION_API}/franksheets-access`, {
        headers: { Authorization: `Bearer ${d.token}` },
      });
      const ad = await access.json();
      setAuthState(ad.hasAccess ? 'ready' : 'redeem');
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const token = localStorage.getItem('fs_token');
    try {
      const r = await fetch(`${FRANKSTATION_API}/franksheets-redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: inviteCode }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || 'Invalid code'); return; }
      setAuthState('ready');
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  if (authState === 'ready') return <>{children}</>;

  const accent = '#10b981';
  const accentDark = '#059669';

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #0d1a14 50%, #0a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#e5e7eb',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${accent}33`,
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: `0 0 60px ${accent}11`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#e5e7eb',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px',
    background: `linear-gradient(135deg, ${accent}, ${accentDark})`,
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: 600,
    fontSize: '15px',
    cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.7 : 1,
    marginTop: '4px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '6px',
  };

  const fieldStyle: React.CSSProperties = { marginBottom: '16px' };

  if (authState === 'loading') {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px', height: '40px', border: `3px solid ${accent}44`,
            borderTop: `3px solid ${accent}`, borderRadius: '50%',
            animation: 'fs-spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <style>{`@keyframes fs-spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (authState === 'login') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#f9fafb' }}>FrankSheets</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
              Sign in with your FrankStation account
            </p>
          </div>
          <form onSubmit={handleLogin}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} type="text" value={username}
                onChange={e => setUsername(e.target.value)} required autoFocus />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
            <button style={btnStyle} type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔑</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#f9fafb' }}>FrankSheets Access</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
            Enter your invite code to unlock FrankSheets
          </p>
        </div>
        <form onSubmit={handleRedeem}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Invite Code</label>
            <input style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
              type="text" value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX" required autoFocus />
          </div>
          {error && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
          <button style={btnStyle} type="submit" disabled={busy}>
            {busy ? 'Redeeming…' : 'Unlock Access'}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '20px' }}>
          Need an invite? Contact the FrankStation admin.
        </p>
      </div>
    </div>
  );
}
