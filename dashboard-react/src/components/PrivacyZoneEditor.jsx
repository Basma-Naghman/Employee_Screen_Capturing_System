import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const C = {
  bgCard: 'rgba(39,39,42,0.70)',
  border: 'rgba(255,255,255,0.08)',
  accent: '#6366f1',
  accentLight: '#818cf8',
  accentDim: 'rgba(99,102,241,0.12)',
  success: '#10b981',
  danger: '#ef4444',
  dangerDim: 'rgba(239,68,68,0.12)',
  textPrimary: '#fafafa',
  textSec: '#a1a1aa',
  textMuted: '#71717a',
  radiusSm: '8px',
  radiusMd: '10px',
};

const PrivacyZoneEditor = ({ employee, baseUrl }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchZones();
  }, [employee]);

  useEffect(() => {
    drawCanvas();
  }, [zones, currentRect]);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/employee/${employee.employee_id}/privacy-zones`);
      setZones(res.data.zones || []);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const saveZones = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await axios.put(`${baseUrl}/employee/${employee.employee_id}/privacy-zones`, { zones });
      setMessage({ type: 'success', text: 'Privacy zones saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save zones' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const generateId = () => `zone_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const addZone = (x, y, width, height) => {
    const newZone = {
      id: generateId(),
      label: `Zone ${zones.length + 1}`,
      x: Math.round(Math.min(x, x + width) * 100) / 100,
      y: Math.round(Math.min(y, y + height) * 100) / 100,
      width: Math.round(Math.abs(width) * 100) / 100,
      height: Math.round(Math.abs(height) * 100) / 100,
    };
    // Only add if meaningful size
    if (newZone.width > 1 && newZone.height > 1) {
      setZones([...zones, newZone]);
    }
  };

  const updateZone = (id, field, value) => {
    setZones(zones.map(z => z.id === id ? { ...z, [field]: value } : z));
  };

  const deleteZone = (id) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.fillStyle = 'rgba(20,20,24,0.95)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * W;
      const y = (i / 10) * H;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Percentage labels
    ctx.fillStyle = 'rgba(113,113,122,0.5)';
    ctx.font = '9px monospace';
    for (let i = 0; i <= 10; i++) {
      ctx.fillText(`${i * 10}%`, (i / 10) * W + 2, 10);
      ctx.fillText(`${i * 10}%`, 2, (i / 10) * H + 12);
    }

    // Draw saved zones
    zones.forEach((zone, idx) => {
      const x = (zone.x / 100) * W;
      const y = (zone.y / 100) * H;
      const w = (zone.width / 100) * W;
      const h = (zone.height / 100) * H;
      const colors = ['rgba(99,102,241,0.3)', 'rgba(16,185,129,0.3)', 'rgba(245,158,11,0.3)', 'rgba(239,68,68,0.3)'];
      ctx.fillStyle = colors[idx % colors.length];
      ctx.strokeStyle = colors[idx % colors.length].replace('0.3', '0.9');
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = 'rgba(250,250,250,0.85)';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(zone.label, x + 4, y + 14);
    });

    // Draw current selection rect
    if (currentRect) {
      const x = (currentRect.x / 100) * W;
      const y = (currentRect.y / 100) * H;
      const w = (currentRect.width / 100) * W;
      const h = (currentRect.height / 100) * H;
      ctx.fillStyle = 'rgba(99,102,241,0.2)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
  };

  const getCanvasPercent = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasPercent(e.clientX, e.clientY);
    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !drawStart) return;
    const { x, y } = getCanvasPercent(e.clientX, e.clientY);
    setCurrentRect({
      x: drawStart.x,
      y: drawStart.y,
      width: x - drawStart.x,
      height: y - drawStart.y,
    });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !drawStart) return;
    const { x, y } = getCanvasPercent(e.clientX, e.clientY);
    const width = x - drawStart.x;
    const height = y - drawStart.y;
    if (Math.abs(width) > 1 && Math.abs(height) > 1) {
      addZone(drawStart.x, drawStart.y, width, height);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentRect(null);
  };

  return (
    <div>
      {message && (
        <div style={{
          padding: '10px 14px',
          background: message.type === 'success' ? C.success + '20' : C.danger + '20',
          border: `1px solid ${message.type === 'success' ? C.success : C.danger}40`,
          borderRadius: C.radiusSm,
          color: message.type === 'success' ? C.success : C.danger,
          fontSize: '12px',
          marginBottom: '16px',
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>
        {/* Canvas Area */}
        <div>
          <div style={{
            fontSize: '11px',
            color: C.textMuted,
            fontWeight: '600',
            letterSpacing: '0.05em',
            marginBottom: '10px',
          }}>
            CLICK & DRAG TO DEFINE PRIVACY ZONES — ALL VALUES ARE PERCENTAGES (0–100)
          </div>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              borderRadius: C.radiusMd,
              overflow: 'hidden',
              border: `1px solid ${C.border}`,
              cursor: 'crosshair',
            }}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={360}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false);
                  setDrawStart(null);
                  setCurrentRect(null);
                }
              }}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '10px',
            color: C.textMuted,
            textAlign: 'center',
          }}>
            💡 Click and drag on the canvas to draw a privacy zone
          </div>
        </div>

        {/* Zone List */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: C.radiusMd,
          padding: '16px',
          maxHeight: '420px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: '11px',
            color: C.textMuted,
            fontWeight: '600',
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            CONFIGURED ZONES ({zones.length})
          </div>

          {loading ? (
            <div style={{ color: C.textMuted, fontSize: '12px', textAlign: 'center', padding: '20px' }}>
              Loading...
            </div>
          ) : zones.length === 0 ? (
            <div style={{
              color: C.textMuted,
              fontSize: '12px',
              textAlign: 'center',
              padding: '20px',
              border: `1px dashed ${C.border}`,
              borderRadius: C.radiusSm,
            }}>
              No zones defined yet.<br />Click and drag on the canvas to add one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {zones.map((zone, idx) => (
                <div key={zone.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${C.border}`,
                  borderRadius: C.radiusSm,
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{
                      width: 16, height: 16,
                      borderRadius: 4,
                      background: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4] + '50',
                      border: `1px solid ${['#6366f1', '#10b981', '#f59e0b', '#ef4444'][idx % 4]}`,
                    }} />
                    <button
                      onClick={() => deleteZone(zone.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: C.danger,
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0 4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={zone.label}
                    onChange={e => updateZone(zone.id, 'label', e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${C.border}`,
                      borderRadius: 6,
                      color: C.textPrimary,
                      padding: '5px 8px',
                      fontSize: '11px',
                      marginBottom: '8px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[
                      { key: 'x', label: 'X' },
                      { key: 'y', label: 'Y' },
                      { key: 'width', label: 'W' },
                      { key: 'height', label: 'H' },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: C.textMuted, width: 12 }}>{label}</span>
                        <input
                          type="number"
                          value={zone[key]}
                          onChange={e => updateZone(zone.id, key, parseFloat(e.target.value) || 0)}
                          style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${C.border}`,
                            borderRadius: 4,
                            color: C.textPrimary,
                            padding: '4px 6px',
                            fontSize: '10px',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                        <span style={{ fontSize: '9px', color: C.textMuted }}>%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {zones.length > 0 && (
            <button
              onClick={saveZones}
              disabled={saving}
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '10px',
                background: saving ? C.accentDim : C.accent,
                border: `1px solid ${C.accent}`,
                borderRadius: C.radiusSm,
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {saving ? 'Saving...' : 'Save Zones'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyZoneEditor;
