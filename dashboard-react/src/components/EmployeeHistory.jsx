import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CaptureCard from './CaptureCard';
import PrivacyZoneEditor from './PrivacyZoneEditor';
import { WorkDistractionChart, HourlyActivityChart, ProductivityScore, StatsMini, WeeklyTrend } from './AdvancedAnalytics';

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
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  warning: '#f59e0b',
  warningDim: 'rgba(245,158,11,0.12)',
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

const EmployeeHistory = ({ employee, baseUrl, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empStartDate, setEmpStartDate] = useState('');
  const [empEndDate, setEmpEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState('captures');
  const PAGE_SIZE = 24;

  useEffect(() => {
    fetchHistory();
  }, [employee, empStartDate, empEndDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/check-db`, {
        params: {
          employee_id: employee.employee_id,
          start_date: empStartDate || undefined,
          end_date: empEndDate || undefined,
        }
      });
      setLogs(res.data.data || []);
      setPage(0);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: logs.length,
    work: logs.filter(l => l.category === 'Work').length,
    distraction: logs.filter(l => l.category === 'Distraction').length,
    break: logs.filter(l => l.category === 'Break').length,
    idle: logs.filter(l => l.category === 'Idle').length,
  };

  const distractionRate = stats.total > 0 ? Math.round((stats.distraction / stats.total) * 100) : 0;
  const lastSeen = logs.length > 0 ? new Date(logs[0].timestamp) : null;

  const paginatedLogs = logs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);

  const StatBox = ({ icon, label, value, color }) => (
    <div style={{
      background: `${color}12`,
      border: `1px solid ${color}25`,
      borderRadius: C.radiusMd,
      padding: '20px 16px',
      textAlign: 'center',
      transition: 'all 0.2s',
      boxShadow: `0 0 20px ${color}10`,
    }}>
      <div style={{ fontSize: '26px', marginBottom: '10px', filter: `drop-shadow(0 0 8px ${color}50)` }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: color, textShadow: `0 0 20px ${color}40` }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: C.textMuted, marginTop: '6px', fontWeight: '600', letterSpacing: '0.06em' }}>
        {label}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(9,9,11,0.85)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      overflow: 'auto',
      padding: '32px',
    }}>
      {/* Main Panel */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(30,30,32,0.60)',
        borderRadius: C.radiusLg,
        border: `1px solid ${C.border}`,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        boxShadow: C.shadowLg,
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(99,102,241,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Avatar */}
              <div style={{
                width: 52, height: 52,
                borderRadius: C.radiusMd,
                background: C.accentDim,
                border: `1px solid rgba(99,102,241,0.20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '700',
                color: C.accentLight,
              }}>
                {employee.name ? employee.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
              </div>
              <div>
                <h2 style={{ color: C.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                  {employee.name}
                </h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px', color: C.textSec,
                    background: 'rgba(255,255,255,0.04)',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${C.border}`,
                    fontWeight: '600',
                  }}>
                    {employee.employee_id}
                  </span>
                  {employee.department && (
                    <span style={{ fontSize: '12px', color: C.textMuted }}>
                      {employee.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36,
                borderRadius: C.radiusSm,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                color: C.textSec,
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.40)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.background = 'rgba(239,68,68,0.10)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textSec;
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          padding: '20px 28px',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <StatBox icon="📸" label="TOTAL" value={stats.total} color={C.accentLight} />
          <StatBox icon="◈" label="WORK" value={stats.work} color="#34d399" />
          <StatBox icon="⚠" label="DISTRACTION" value={stats.distraction} color="#f87171" />
          <StatBox icon="☕" label="BREAK" value={stats.break} color="#fbbf24" />
          <StatBox
            icon="📊"
            label="DISTRACTION %"
            value={`${distractionRate}%`}
            color={distractionRate > 30 ? '#f87171' : '#34d399'}
          />
        </div>

        {/* Last Seen & Date Filter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 28px',
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: C.textMuted }}>🕐</span>
            {lastSeen ? (
              <span style={{ fontSize: '12px', color: C.textSec }}>
                Last capture: {lastSeen.toLocaleDateString()} at {lastSeen.toLocaleTimeString()}
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: C.textMuted }}>No captures</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: C.textMuted, fontWeight: '600' }}>📅 Filter:</span>
            <input
              type="date"
              value={empStartDate}
              onChange={e => setEmpStartDate(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
                colorScheme: 'dark',
                borderRadius: C.radiusSm,
                fontSize: '12px',
              }}
            />
            <span style={{ color: C.textMuted }}>—</span>
            <input
              type="date"
              value={empEndDate}
              onChange={e => setEmpEndDate(e.target.value)}
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
                colorScheme: 'dark',
                borderRadius: C.radiusSm,
                fontSize: '12px',
              }}
            />
            {(empStartDate || empEndDate) && (
              <button
                onClick={() => { setEmpStartDate(''); setEmpEndDate(''); }}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  color: C.accentLight,
                  border: `1px solid rgba(99,102,241,0.25)`,
                  borderRadius: C.radiusSm,
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '14px 28px',
          borderBottom: `1px solid ${C.border}`,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <button
            onClick={() => setActiveTab('captures')}
            style={{
              padding: '8px 18px',
              background: activeTab === 'captures' ? C.accentDim : 'transparent',
              border: `1px solid ${activeTab === 'captures' ? C.accent : C.border}`,
              borderRadius: C.radiusSm,
              color: activeTab === 'captures' ? C.accentLight : C.textSec,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            📷 Captures
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 18px',
              background: activeTab === 'analytics' ? C.accentDim : 'transparent',
              border: `1px solid ${activeTab === 'analytics' ? C.accent : C.border}`,
              borderRadius: C.radiusSm,
              color: activeTab === 'analytics' ? C.accentLight : C.textSec,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
          >
            📊 Analytics
          </button>
        </div>

        {activeTab === 'analytics' ? (
          /* Advanced Analytics Tab */
          <div style={{ padding: '24px 28px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              <BentoCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  HOURLY ACTIVITY
                </div>
                <HourlyActivityChart logs={logs} />
              </BentoCard>
              <BentoCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  DAILY BREAKDOWN
                </div>
                <WorkDistractionChart logs={logs} />
              </BentoCard>
              <BentoCard style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  WEEKLY TREND
                </div>
                <WeeklyTrend logs={logs} />
              </BentoCard>
              <BentoCard style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <ProductivityScore logs={logs} />
                </div>
              </BentoCard>
              <BentoCard style={{ padding: '20px', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  STATISTICS
                </div>
                <StatsMini logs={logs} />
              </BentoCard>
            </div>
          </div>
        ) : (
        <div style={{ padding: '24px 28px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{ color: C.textPrimary, fontSize: '14px', fontWeight: '600' }}>
              Capture History ({logs.length} total)
            </h3>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '64px',
              color: C.textMuted,
            }}>
              Loading...
            </div>
          ) : paginatedLogs.length > 0 ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '14px',
              }}>
                {paginatedLogs.map(log => (
                  <CaptureCard key={log.id} log={log} baseUrl={baseUrl} />
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '28px',
                }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding: '10px 18px',
                      background: page === 0 ? 'transparent' : C.bgCard,
                      color: page === 0 ? C.textMuted : C.textSec,
                      border: `1px solid ${C.border}`,
                      borderRadius: C.radiusSm,
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ← Prev
                  </button>
                  <span style={{ fontSize: '12px', color: C.textSec, padding: '0 16px' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: '10px 18px',
                      background: page >= totalPages - 1 ? 'transparent' : C.bgCard,
                      color: page >= totalPages - 1 ? C.textMuted : C.textSec,
                      border: `1px solid ${C.border}`,
                      borderRadius: C.radiusSm,
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '64px',
              color: C.textMuted,
              border: `1px dashed ${C.border}`,
              borderRadius: C.radiusMd,
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📷</div>
              <p style={{ fontSize: '13px', color: C.textSec }}>No screenshots found for this employee</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistory;
