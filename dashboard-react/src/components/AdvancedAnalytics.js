import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const C = {
  bgCard: 'rgba(39,39,42,0.70)',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#fafafa',
  textSec: '#a1a1aa',
  textMuted: '#71717a',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  shadow: '0 0 0 1px rgba(255,255,255,0.05)',
  radiusSm: '10px',
  radiusMd: '12px',
};

// Work vs Distraction Chart
export const WorkDistractionChart = ({ logs }) => {
  const data = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, work: 0, distraction: 0 };
      }
      const status = (log.status || log.category || '').toLowerCase();
      if (status === 'work') grouped[date].work++;
      else if (status === 'distraction') grouped[date].distraction++;
    });

    return Object.values(grouped).slice(-7);
  }, [logs]);

  if (!data.length) {
    return (
      <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '12px' }}>
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(30,30,32,0.95)',
          border: `1px solid ${C.border}`,
          borderRadius: C.radiusSm,
          padding: '10px 14px',
          fontSize: '11px',
          color: C.textPrimary,
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ fontWeight: '700', marginBottom: '6px' }}>{label}</div>
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color, marginBottom: '2px' }}>
              {p.name}: {p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '140px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <XAxis
            dataKey="date"
            tick={{ fill: C.textMuted, fontSize: 10 }}
            axisLine={{ stroke: C.border }}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="work" name="Work" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`work-${index}`} fill={C.success} style={{ filter: `drop-shadow(0 0 4px ${C.success}60)` }} />
            ))}
          </Bar>
          <Bar dataKey="distraction" name="Distraction" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`dist-${index}`} fill={C.danger} style={{ filter: `drop-shadow(0 0 4px ${C.danger}60)` }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Hourly Activity Pattern
export const HourlyActivityChart = ({ logs }) => {
  const data = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`,
      count: 0,
    }));

    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hours[hour].count++;
    });

    const maxCount = Math.max(...hours.map(h => h.count), 1);
    return hours.map(h => ({ ...h, height: (h.count / maxCount) * 100 }));
  }, [logs]);

  if (!data.some(h => h.count > 0)) {
    return (
      <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '12px' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ height: '100px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={6}>
          <XAxis
            dataKey="label"
            tick={{ fill: C.textMuted, fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{
                    background: 'rgba(30,30,32,0.95)',
                    border: `1px solid ${C.border}`,
                    borderRadius: C.radiusSm,
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: C.textPrimary,
                    backdropFilter: 'blur(16px)',
                  }}>
                    <div style={{ fontWeight: '700' }}>{payload[0].payload.label}</div>
                    <div style={{ color: C.textMuted }}>{payload[0].value} captures</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => {
              const intensity = entry.count > 0 ? 0.3 + (entry.count / Math.max(...data.map(d => d.count), 1)) * 0.7 : 0.2;
              return (
                <Cell
                  key={`hour-${index}`}
                  fill={`rgba(99,102,241,${intensity})`}
                  style={{ filter: entry.count > 0 ? `drop-shadow(0 0 4px rgba(99,102,241,0.5))` : 'none' }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Productivity Score
export const ProductivityScore = ({ logs }) => {
  const score = useMemo(() => {
    if (!logs || logs.length === 0) return 0;
    const work = logs.filter(l => (l.status || l.category || '').toLowerCase() === 'work').length;
    const total = logs.length;
    return total > 0 ? Math.round((work / total) * 100) : 0;
  }, [logs]);

  const getScoreColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const color = getScoreColor(score);

  return (
    <div style={{ textAlign: 'center', padding: '12px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto',
        position: 'relative',
      }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${score * 2.51} 251`}
            style={{
              filter: `drop-shadow(0 0 8px ${color}60)`,
              transition: 'stroke-dasharray 0.5s ease',
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: C.textPrimary }}>{score}</div>
          <div style={{ fontSize: '8px', color: C.textMuted, fontWeight: '600' }}>SCORE</div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: C.textMuted, marginTop: '8px' }}>Productivity</div>
    </div>
  );
};

// Stats Mini Cards
export const StatsMini = ({ logs }) => {
  const CAPTURE_INTERVAL_MINUTES = 1; // captures every 1 minute

  const stats = useMemo(() => {
    if (!logs || logs.length === 0) return { work: 0, distraction: 0, break: 0, hours: 0 };

    const work = logs.filter(l => (l.status || l.category || '').toLowerCase() === 'work').length;
    const distraction = logs.filter(l => (l.status || l.category || '').toLowerCase() === 'distraction').length;
    const breaker = logs.filter(l => (l.status || l.category || '').toLowerCase() === 'break').length;

    // Calculate actual work hours: (work screenshots * interval) / 60
    const hours = Math.round((work * CAPTURE_INTERVAL_MINUTES / 60) * 10) / 10;

    return { work, distraction, break: breaker, hours };
  }, [logs]);

  const items = [
    { label: 'Work', value: stats.work, color: C.success, icon: '◈' },
    { label: 'Distract', value: stats.distraction, color: C.danger, icon: '⚠' },
    { label: 'Break', value: stats.break, color: C.warning, icon: '☕' },
    { label: 'Hours', value: stats.hours, color: '#818cf8', icon: '⏱' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: `${item.color}10`,
          border: `1px solid ${item.color}20`,
          borderRadius: C.radiusSm,
          padding: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '16px', marginBottom: '4px', filter: `drop-shadow(0 0 4px ${item.color}50)` }}>{item.icon}</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: item.color }}>{item.value}</div>
          <div style={{ fontSize: '9px', color: C.textMuted, fontWeight: '600', letterSpacing: '0.04em' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

// Weekly Trend
export const WeeklyTrend = ({ logs }) => {
  const data = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = days.map(day => ({ day, score: 0, total: 0 }));

    logs.forEach(log => {
      const dayIndex = new Date(log.timestamp).getDay();
      weekData[dayIndex].total++;
      if ((log.status || log.category || '').toLowerCase() === 'work') {
        weekData[dayIndex].score++;
      }
    });

    return weekData.map(d => ({
      ...d,
      score: d.total > 0 ? Math.round((d.score / d.total) * 100) : 0,
    }));
  }, [logs]);

  const maxScore = Math.max(...data.map(d => d.score), 1);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '60px', gap: '4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            width: '100%',
            height: `${d.score > 0 ? (d.score / maxScore) * 40 : 4}px`,
            background: d.score >= 80 ? C.success : d.score >= 60 ? C.warning : d.score > 0 ? C.danger : 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            marginBottom: '4px',
            boxShadow: d.score > 0 ? `0 0 8px ${d.score >= 80 ? C.success : d.score >= 60 ? C.warning : C.danger}50` : 'none',
            transition: 'all 0.3s',
          }} />
          <div style={{ fontSize: '9px', color: C.textMuted, fontWeight: '600' }}>{d.day}</div>
        </div>
      ))}
    </div>
  );
};
