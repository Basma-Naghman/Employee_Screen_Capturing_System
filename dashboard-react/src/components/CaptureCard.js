import React from 'react';

const C = {
  bgBase: '#09090B',
  bgCard: 'rgba(39,39,42,0.70)',
  bgCardHover: 'rgba(55,55,59,0.80)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accentLight: '#818cf8',
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

const CaptureCard = ({ log, baseUrl }) => {
  const getBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'work':
        return { label: 'Work', icon: '◈', bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)' };
      case 'distraction':
        return { label: 'Distraction', icon: '⚠', bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.25)' };
      case 'break':
        return { label: 'Break', icon: '☕', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)' };
      case 'idle':
        return { label: 'Idle', icon: '○', bg: 'rgba(113,113,122,0.15)', color: '#a1a1aa', border: 'rgba(113,113,122,0.25)' };
      default:
        return { label: 'Active', icon: '●', bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' };
    }
  };

  const badge = getBadge(log.category || log.status);
  const imageUrl = `${baseUrl}/screenshots/${log.file_path}?t=${new Date(log.timestamp).getTime()}`;
  const ts = new Date(log.timestamp);

  const handleOpenImage = () => {
    window.open(`${baseUrl}/screenshots/${log.file_path}`, '_blank');
  };

  return (
    <div
      onClick={handleOpenImage}
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: C.radiusMd,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(16px)',
        boxShadow: C.shadow,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = C.shadowMd;
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = C.bgCardHover;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = C.shadow;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = C.bgCard;
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '150px', background: 'rgba(0,0,0,0.30)' }}>
        <img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s ease',
          }}
          alt={`Screenshot for ${log.employee_id}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x150/1a1a1a/3f3f46?text=No+Image';
          }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Status Badge */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          padding: '5px 12px',
          borderRadius: '20px',
          background: badge.bg,
          color: badge.color,
          border: `1px solid ${badge.border}`,
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(12px)',
          boxShadow: `0 2px 12px ${badge.color}30`,
        }}>
          <span style={{ fontSize: '12px', filter: `drop-shadow(0 0 4px ${badge.color})` }}>{badge.icon}</span>
          {badge.label}
        </div>

        {/* Expand icon */}
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          width: 28, height: 28,
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid rgba(255,255,255,0.10)`,
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px',
          color: '#ffffff',
          backdropFilter: 'blur(8px)',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}>
          +
        </div>
      </div>

      {/* Info Row */}
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: C.textPrimary,
              letterSpacing: '0.02em',
            }}>
              {log.employee_id}
            </div>
            <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>
              #{log.id || 'N/A'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: C.textSec }}>
              {ts.toLocaleDateString()}
            </div>
            <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>
              {ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptureCard;
