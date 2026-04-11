import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const C = {
  bgBase: '#09090B',
  bgCard: 'rgba(39,39,42,0.70)',
  bgCardHover: 'rgba(55,55,59,0.80)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentDim: 'rgba(99,102,241,0.12)',
  success: '#10b981',
  successDim: 'rgba(16,185,129,0.12)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.12)',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  textPrimary: '#fafafa',
  textSec: '#a1a1aa',
  textMuted: '#71717a',
  shadow: '0 0 0 1px rgba(255,255,255,0.05)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.40)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.50)',
  radiusSm: '10px',
  radiusMd: '12px',
  radiusLg: '14px',
};

const BentoCard = ({ children, style, ...props }) => (
  <div style={{
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: C.radiusMd,
    backdropFilter: 'blur(16px)',
    ...style,
  }} {...props}>
    {children}
  </div>
);

const EmployeeDashboard = ({ user, logout }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Work');
  const [currentTime, setCurrentTime] = useState(new Date());
  const BASE_URL = 'http://192.168.1.6:8000';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchScreenshots = useCallback(async () => {
    if (!user?.id) return;
    try {
      const userId = user.id.trim().toUpperCase();
      const res = await axios.get(`${BASE_URL}/check-db`, { params: { employee_id: userId } });
      setScreenshots(res.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [user?.id, BASE_URL]);

  useEffect(() => {
    fetchScreenshots();
    const pollId = setInterval(fetchScreenshots, 30000);
    return () => clearInterval(pollId);
  }, [fetchScreenshots]);

  const handleToggleMonitoring = async () => {
    const action = isMonitoring ? 'stop' : 'start';
    try {
      await axios.post(`${BASE_URL}/trigger-system-capture`, {
        action,
        employee_id: user.id,
        status: currentStatus,
      });
      setIsMonitoring(!isMonitoring);
    } catch (err) {
      console.error('Agent communication failed.', err);
      alert('Could not connect to the monitoring agent.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;
    const wasMonitoring = isMonitoring;
    setCurrentStatus(newStatus);
    if (newStatus === 'Break') {
      try {
        if (wasMonitoring) {
          await axios.post(`${BASE_URL}/trigger-system-capture`, {
            action: 'stop', employee_id: user.id, status: newStatus,
          });
        }
        await axios.post(`${BASE_URL}/trigger-system-capture`, {
          action: 'start', employee_id: user.id, status: newStatus,
        });
        setIsMonitoring(false);
      } catch (err) {
        console.error('Failed to update status on backend.', err);
      }
    } else if (isMonitoring || newStatus === 'Work') {
      try {
        await axios.post(`${BASE_URL}/trigger-system-capture`, {
          action: 'start', employee_id: user.id, status: newStatus,
        });
        setIsMonitoring(true);
      } catch (err) {
        console.error('Failed to update status on backend.');
      }
    }
  };

  const stats = {
    total: screenshots.length,
    work: screenshots.filter(l => l.category === 'Work').length,
    distraction: screenshots.filter(l => l.category === 'Distraction').length,
  };

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      background: C.bgBase,
      color: C.textPrimary,
    }}>
      {/* Top Nav */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: '64px',
        background: 'rgba(39,39,42,0.60)',
        borderBottom: `1px solid ${C.border}`,
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>🛡️</div>
          <span style={{ fontWeight: '600', fontSize: '15px', color: C.textPrimary, letterSpacing: '-0.01em' }}>
            AdminGuard
          </span>
          <span style={{
            background: C.accentDim,
            border: '1px solid rgba(99,102,241,0.20)',
            color: C.accentLight,
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            Employee
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: C.textPrimary }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: C.textMuted }}>
              {user?.id}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: C.dangerDim,
              color: C.danger,
              border: '1px solid rgba(239,68,68,0.15)',
              padding: '8px 16px',
              borderRadius: C.radiusSm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              transition: 'all 0.2s',
            }}
          >
            ⏻ Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', color: C.textPrimary, marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '14px', color: C.textMuted }}>
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Control Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', marginBottom: '24px' }}>

          {/* Session Control Card */}
          <BentoCard style={{ padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '20px' }}>
              SESSION CONTROL
            </div>

            {/* Status Indicator */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isMonitoring ? C.success : C.textMuted,
                  boxShadow: isMonitoring ? `0 0 0 3px rgba(16,185,129,0.15)` : 'none',
                  transition: 'all 0.3s', flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '15px', fontWeight: '700',
                  color: isMonitoring ? C.success : C.textSec,
                }}>
                  {isMonitoring ? 'Session Active' : 'Session Paused'}
                </span>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleToggleMonitoring}
              style={{
                width: '100%', padding: '12px',
                background: isMonitoring
                  ? C.dangerDim
                  : `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                color: isMonitoring ? C.danger : '#ffffff',
                border: `1px solid ${isMonitoring ? 'rgba(220,38,38,0.15)' : 'rgba(37,99,235,0.20)'}`,
                borderRadius: C.radiusSm, cursor: 'pointer',
                fontWeight: '700', fontSize: '13px',
                marginBottom: '10px',
                boxShadow: isMonitoring ? 'none' : '0 4px 14px rgba(37,99,235,0.20)',
                transition: 'all 0.2s',
              }}
            >
              {isMonitoring ? '⏸ Pause Session' : '▶ Start Session'}
            </button>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { label: 'Work Mode', key: 'Work', icon: '◈' },
                { label: 'Break', key: 'Break', icon: '☕' },
              ].map(({ label, key, icon }) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: C.radiusSm, cursor: 'pointer',
                    fontWeight: '600', fontSize: '12px',
                    background: currentStatus === key ? C.accentDim : 'transparent',
                    color: currentStatus === key ? C.accentLight : C.textSec,
                    border: currentStatus === key ? '1px solid rgba(37,99,235,0.15)' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </BentoCard>

          {/* Info Card */}
          <BentoCard style={{ padding: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.textMuted, letterSpacing: '0.08em', marginBottom: '20px' }}>
              SYSTEM NOTICE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '◈', title: 'Work Mode', desc: 'Continuous screen capture every 1 minute while active.', color: C.success },
                { icon: '☕', title: 'Break Mode', desc: 'Takes 1 notification capture then stops monitoring.', color: C.warning },
                { icon: '🔒', title: 'Storage', desc: 'All captures are stored securely in PostgreSQL.', color: C.accentLight },
              ].map(({ icon, title, desc, color }) => (
                <div key={title} style={{
                  display: 'flex', gap: '12px', padding: '12px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: C.radiusSm,
                  border: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: color, marginBottom: '2px' }}>
                      {title}
                    </div>
                    <div style={{ fontSize: '12px', color: C.textSec, lineHeight: '1.5' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>

      </main>
    </div>
  );
};

export default EmployeeDashboard;
