import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const C = {
  bgCard: 'rgba(39,39,42,0.70)',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#fafafa',
  textSec: '#a1a1aa',
  textMuted: '#71717a',
  shadow: '0 0 0 1px rgba(255,255,255,0.05)',
  radiusSm: '10px',
  radiusMd: '12px',
};

const ActivityAnalysis = ({ logs }) => {
  const data = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const counts = logs.reduce((acc, log) => {
      const status = (log.status || log.category || 'active').trim().toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Work', value: counts.work || 0, color: '#10b981' },
      { name: 'Distraction', value: counts.distraction || 0, color: '#ef4444' },
      { name: 'Break', value: counts.break || 0, color: '#f59e0b' },
      { name: 'Idle', value: counts.idle || 0, color: '#71717a' },
    ].filter(item => item.value > 0);
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: C.textMuted,
        border: `1px dashed ${C.border}`,
        borderRadius: C.radiusMd,
        fontSize: '12px',
      }}>
        <div style={{ fontSize: '24px', marginBottom: '6px', opacity: 0.5 }}>📊</div>
        <p>No data</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const pct = ((value / logs.length) * 100).toFixed(1);
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
          <div style={{ fontWeight: '700', color: payload[0].payload.color }}>{name}</div>
          <div style={{ color: C.textMuted }}>{value} · {pct}%</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '180px', width: '100%', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            animationBegin={0}
            animationDuration={600}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                style={{ filter: `drop-shadow(0 0 8px ${entry.color}50)` }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: C.textPrimary }}>
          {logs.length}
        </div>
        <div style={{ fontSize: '9px', color: C.textMuted, fontWeight: '600', letterSpacing: '0.04em' }}>TOTAL</div>
      </div>
    </div>
  );
};

export default ActivityAnalysis;
