import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

// Component Imports
import Sidebar, { StaffPanel } from './components/Sidebar';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeHistory from './components/EmployeeHistory';
import CaptureCard from './components/CaptureCard';
import ActivityAnalysis from './components/ActivityAnalysis';
import AnalystChat from './components/AnalystChart';
import { WorkDistractionChart, HourlyActivityChart, ProductivityScore, StatsMini, WeeklyTrend } from './components/AdvancedAnalytics';

// ── Design Tokens (Modern Dark Zinc Theme) ─────────────────────────────────
const C = {
  // Backgrounds
  bgBase: '#09090B',           // zinc-950 - very dark
  bgCard: 'rgba(39,39,42,0.70)',  // zinc-800/70
  bgCardHover: 'rgba(55,55,59,0.80)',

  // Sidebar
  railBg: '#09090B',
  railHover: 'rgba(39,39,42,0.80)',
  railActive: 'rgba(99,102,241,0.15)',
  railActiveBg: 'rgba(99,102,241,0.20)',
  railBorder: 'rgba(255,255,255,0.06)',
  railIcon: 'rgba(255,255,255,0.40)',
  railIconActive: '#a5b4fc',

  // Canvas / Main area
  canvas: '#09090B',
  bgWhite: 'rgba(39,39,42,0.60)',

  // Borders
  border: 'rgba(255,255,255,0.08)',

  // Accent colors
  accent: '#6366f1',         // indigo-500
  accentLight: '#818cf8',     // indigo-400
  accentDim: 'rgba(99,102,241,0.12)',
  success: '#10b981',         // emerald-500
  successDim: 'rgba(16,185,129,0.12)',
  danger: '#ef4444',          // red-500
  dangerDim: 'rgba(239,68,68,0.12)',
  warning: '#f59e0b',         // amber-500
  warningDim: 'rgba(245,158,11,0.12)',

  // Typography
  textPrimary: '#fafafa',     // zinc-50
  textSec: '#a1a1aa',         // zinc-400
  textMuted: '#71717a',       // zinc-500

  // Shadows
  shadow: '0 0 0 1px rgba(255,255,255,0.05)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.40)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.50)',

  // Border radius
  radiusSm: '10px',
  radiusMd: '12px',
  radiusLg: '14px',
};

const inputStyle = {
  width: '100%', marginBottom: '12px', padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
  borderRadius: C.radiusSm, color: C.textPrimary, outline: 'none',
  fontSize: '14px', transition: 'border-color 0.2s, box-shadow 0.2s',
};

// Bento Card component
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

// ── Login Component ───────────────────────────────────────────────────────
const Login = ({ onLogin, BASE_URL }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/login`, { id: id.trim(), password: password.trim() });
      onLogin(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate(res.data.role === 'admin' ? '/admin' : '/employee');
    } catch (err) {
      alert(err.response?.data?.detail || 'Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: `linear-gradient(135deg, #09090B 0%, #18181B 100%)`,
    }}>
      {/* Left panel - branding */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: '45%',
        background: `linear-gradient(135deg, #09090B 0%, #18181B 100%)`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px',
      }}>
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(129,140,248,0.15) 100%)',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', marginBottom: '28px',
          boxShadow: '0 0 30px rgba(99,102,241,0.30)',
        }}>🛡️</div>
        <h1 style={{ color: '#fafafa', fontSize: '32px', fontWeight: '600', marginBottom: '12px', fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
          AdminGuard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', lineHeight: '1.7', maxWidth: '360px' }}>
          Employee screen monitoring system. Track productivity, analyze work patterns, and manage your workforce efficiently.
        </p>
        <div style={{ marginTop: '48px', display: 'flex', gap: '12px' }}>
          {['Screen Capture', 'AI Analytics', 'Real-time Monitor'].map(tag => (
            <span key={tag} style={{
              background: 'rgba(99,102,241,0.12)', color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.20)',
              borderRadius: '20px', padding: '4px 12px',
              fontSize: '12px', fontWeight: '600',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: '55%',
        background: 'rgba(39,39,42,0.40)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '40px',
        backdropFilter: 'blur(20px)',
      }}>
        <BentoCard style={{ padding: '48px', width: '420px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: C.textPrimary, marginBottom: '6px', fontSize: '22px', fontWeight: '600', fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '-0.01em' }}>
              Welcome back
            </h2>
            <p style={{ color: C.textMuted, fontSize: '13px' }}>Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="User ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{ ...inputStyle, marginBottom: '0' }}
              required
            />
            {id.toLowerCase() === 'admin' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            )}
            <button
              type="submit"
              style={{
                width: '100%', padding: '14px', marginTop: '16px',
                background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                color: '#ffffff', border: 'none', borderRadius: C.radiusSm,
                cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                boxShadow: `0 4px 14px rgba(99,102,241,0.30)`,
                transition: 'all 0.2s',
              }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>
        </BentoCard>
      </div>
    </div>
  );
};

// Stats Card - uniform with Bento style
const StatCard = ({ icon, label, value, color }) => (
  <BentoCard style={{ padding: '22px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: 52, height: 52, borderRadius: C.radiusMd,
        background: `linear-gradient(135deg, ${color}25 0%, ${color}15 100%)`,
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', flexShrink: 0,
        boxShadow: `0 0 25px ${color}25`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', color: C.textMuted, fontWeight: '600', letterSpacing: '0.04em', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '30px', fontWeight: '700', color: color, fontFamily: 'Inter, -apple-system, sans-serif' }}>
          {value}
        </div>
      </div>
    </div>
  </BentoCard>
);

// ── Section Header Component ─────────────────────────────────────────────
const SectionHeader = ({ icon, title, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '20px', filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.4))' }}>{icon}</span>
      <h3 style={{ color: C.textPrimary, fontSize: '14px', fontWeight: '600', margin: 0, fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
    {action}
  </div>
);

// ── Main App Component ───────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterId, setFilterId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pendingEmployee, setPendingEmployee] = useState(null);
  const [showHistoryConfirm, setShowHistoryConfirm] = useState(false);
  const [formData, setFormData] = useState({ name: '', id: '', dept: '' });
  const [deleteEmpId, setDeleteEmpId] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const BASE_URL = 'http://192.168.1.6:8000';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchLastEmployee = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get-last-employee`);
        if (res.data.employee_id) {
          setFilterId(res.data.employee_id);
        }
      } catch (err) {
        console.error('Error fetching last employee:', err);
      }
    };
    fetchLastEmployee();
  }, [user, BASE_URL]);

  const refreshAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    try {
      const logRes = await axios.get(`${BASE_URL}/check-db`, {
        params: {
          employee_id: filterId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined
        }
      });
      setLogs(logRes.data.data);
      const empRes = await axios.get(`${BASE_URL}/get-employees`);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Refresh Error:', err);
    }
  }, [user, filterId, startDate, endDate, BASE_URL]);

  useEffect(() => {
    refreshAdminData();
    const interval = setInterval(refreshAdminData, 5000);
    return () => clearInterval(interval);
  }, [filterId, startDate, endDate, refreshAdminData]);

  const handleAddEmployee = async () => {
    try {
      await axios.post(`${BASE_URL}/add-employee`, formData);
      setShowAddModal(false);
      setFormData({ name: '', id: '', dept: '' });
      refreshAdminData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add employee.');
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmpId.trim()) {
      alert("Please enter an Employee ID to remove.");
      return;
    }
    if (window.confirm(`Permanently remove ${deleteEmpId}?`)) {
      try {
        await axios.delete(`${BASE_URL}/delete-employee/${deleteEmpId.trim()}`);
        setDeleteEmpId('');
        refreshAdminData();
      } catch (err) {
        alert(err.response?.data?.detail || "Error deleting employee.");
      }
    }
  };

  const totalEmployees = employees.length;
  const totalCaptures = logs.length;
  const distractionCount = logs.filter(l => l.category === 'Distraction').length;
  const distractionRate = totalCaptures > 0 ? Math.round((distractionCount / totalCaptures) * 100) : 0;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={setUser} BASE_URL={BASE_URL} />} />
        <Route path="/employee" element={user?.role === 'employee' ? <EmployeeDashboard user={user} logout={() => setUser(null)} /> : <Navigate to="/" />} />

        <Route path="/admin" element={
          user?.role === 'admin' ? (
            <div style={{ display: 'flex', minHeight: '100vh', background: C.bgBase }}>
              {/* 56px Icon Rail */}
              <Sidebar
                employees={employees}
                filterId={filterId}
                setFilterId={setFilterId}
                setShowAddModal={setShowAddModal}
                setShowRemoveModal={setShowRemoveModal}
                setShowHistoryConfirm={setShowHistoryConfirm}
                setPendingEmployee={setPendingEmployee}
              />

              {/* 280px Staff Directory Panel */}
              <StaffPanel
                employees={employees}
                filterId={filterId}
                setFilterId={setFilterId}
                setShowAddModal={setShowAddModal}
                setShowRemoveModal={setShowRemoveModal}
                setShowHistoryConfirm={setShowHistoryConfirm}
                setPendingEmployee={setPendingEmployee}
              />

              {/* Main Content - Bento Grid */}
              <div style={{ marginLeft: '336px', flex: 1, padding: '24px 32px' }}>

                {/* Header Bar - Bento style */}
                <BentoCard style={{ padding: '20px 24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h1 style={{ color: C.textPrimary, fontSize: '20px', fontWeight: '600', marginBottom: '2px', fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
                        Activity Monitor
                      </h1>
                      <p style={{ color: C.textMuted, fontSize: '12px', margin: 0 }}>
                        {filterId ? `Filtered by: ${filterId}` : 'Showing all employees'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: C.textMuted, marginBottom: '2px' }}>
                          {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: C.accentLight, fontFamily: 'Inter, -apple-system, sans-serif' }}>
                          {currentTime.toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => { setUser(null); localStorage.removeItem('user'); }}
                        style={{
                          padding: '9px 16px',
                          background: C.dangerDim, color: C.danger,
                          border: `1px solid rgba(239,68,68,0.20)`, borderRadius: C.radiusSm,
                          cursor: 'pointer', fontWeight: '600', fontSize: '12px',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'all 0.2s',
                        }}
                      >
                        ⏻ Logout
                      </button>
                    </div>
                  </div>
                </BentoCard>

                {/* Stats Row - Bento Grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
                  marginBottom: '20px',
                }}>
                  <StatCard icon="👥" label="Total Employees" value={totalEmployees} color={C.accent} />
                  <StatCard icon="📸" label="Total Captures" value={totalCaptures} color={C.success} />
                  <StatCard icon="⚠" label="Distraction Rate" value={`${distractionRate}%`} color={C.danger} />
                  <StatCard icon="📊" label="Active Filter" value={filterId || 'All'} color={C.warning} />
                </div>

                {/* Date Filters - Bento */}
                <BentoCard style={{ padding: '16px 20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: C.textMuted, fontWeight: '600' }}>📅 Date Range</span>
                    {[{ label: 'FROM', value: startDate, setter: setStartDate }, { label: 'TO', value: endDate, setter: setEndDate }].map(({ label, value, setter }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '10px', color: C.textMuted, fontWeight: '700', letterSpacing: '0.05em' }}>{label}</label>
                        <input type="date" value={value} onChange={e => setter(e.target.value)} style={{
                          padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`,
                          color: C.textPrimary, colorScheme: 'dark', borderRadius: '8px', fontSize: '12px',
                        }} />
                      </div>
                    ))}
                    {(startDate || endDate) && (
                      <button onClick={() => { setStartDate(''); setEndDate(''); }} style={{
                        padding: '7px 12px', background: 'transparent', color: C.accentLight,
                        border: `1px solid rgba(99,102,241,0.25)`, borderRadius: '8px', cursor: 'pointer',
                        fontSize: '11px', fontWeight: '600',
                      }}>
                        Clear
                      </button>
                    )}
                  </div>
                </BentoCard>

                {/* AI Analyst - Bento */}
                <BentoCard style={{ padding: '24px', marginBottom: '20px' }}>
                  <SectionHeader icon="🤖" title="AI Productivity Analyst" />
                  <AnalystChat />
                </BentoCard>

                {/* Activity Analysis - Bento */}
                <BentoCard style={{ padding: '24px', marginBottom: '20px' }}>
                  <SectionHeader icon="📊" title="Activity Analysis" />
                  <ActivityAnalysis logs={logs} />
                </BentoCard>


              {/* Add Employee Modal */}
              {showAddModal && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.80)',
                  backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', zIndex: 2000,
                }}>
                  <BentoCard style={{ padding: '32px', width: '420px' }}>
                    <h3 style={{ color: C.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '24px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Add New Employee
                    </h3>
                    <input placeholder="Full Name" style={inputStyle} value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input placeholder="Employee ID (e.g. EMP_50)" style={inputStyle} value={formData.id}
                      onChange={e => setFormData({ ...formData, id: e.target.value })} />
                    <input placeholder="Department" style={inputStyle} value={formData.dept}
                      onChange={e => setFormData({ ...formData, dept: e.target.value })} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button onClick={handleAddEmployee} style={{
                        flex: 1, padding: '12px',
                        background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                        color: '#ffffff', border: 'none', borderRadius: C.radiusSm,
                        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                      }}>
                        Save Employee
                      </button>
                      <button onClick={() => setShowAddModal(false)} style={{
                        flex: 1, padding: '12px', background: 'transparent',
                        color: C.textSec, border: `1px solid ${C.border}`, borderRadius: C.radiusSm,
                        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                      }}>
                        Cancel
                      </button>
                    </div>
                  </BentoCard>
                </div>
              )}

              {/* Remove Employee Modal */}
              {showRemoveModal && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.80)',
                  backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', zIndex: 2000,
                }}>
                  <BentoCard style={{ padding: '32px', width: '420px' }}>
                    <h3 style={{ color: C.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '24px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Remove Employee
                    </h3>
                    <input placeholder="Enter Employee ID (e.g. EMP_50)" style={inputStyle} value={deleteEmpId}
                      onChange={e => setDeleteEmpId(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleDeleteEmployee(); }}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button onClick={handleDeleteEmployee} style={{
                        flex: 1, padding: '12px', background: C.danger, color: '#ffffff',
                        border: 'none', borderRadius: C.radiusSm, cursor: 'pointer', fontWeight: '600',
                        fontSize: '13px',
                      }}>
                        Remove
                      </button>
                      <button onClick={() => { setShowRemoveModal(false); setDeleteEmpId(''); }} style={{
                        flex: 1, padding: '12px', background: 'transparent',
                        color: C.textSec, border: `1px solid ${C.border}`, borderRadius: C.radiusSm,
                        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                      }}>
                        Cancel
                      </button>
                    </div>
                  </BentoCard>
                </div>
              )}

              {/* Watch History Confirm */}
              {showHistoryConfirm && pendingEmployee && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.80)',
                  backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center',
                  alignItems: 'center', zIndex: 2000,
                }}>
                  <BentoCard style={{ padding: '36px', width: '380px', textAlign: 'center' }}>
                    <div style={{ fontSize: '44px', marginBottom: '14px' }}>👁️</div>
                    <h3 style={{ color: C.textPrimary, fontSize: '18px', fontWeight: '600', marginBottom: '8px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
                      Watch Employee History?
                    </h3>
                    <p style={{ color: C.textMuted, fontSize: '13px', marginBottom: '24px' }}>
                      View capture history for <strong style={{ color: C.accentLight }}>{pendingEmployee.name}</strong> ({pendingEmployee.employee_id})?
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => { setSelectedEmployee(pendingEmployee); setShowHistoryConfirm(false); }} style={{
                        flex: 1, padding: '12px',
                        background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentLight} 100%)`,
                        color: '#ffffff', border: 'none', borderRadius: C.radiusSm,
                        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                      }}>
                        Yes, View History
                      </button>
                      <button onClick={() => { setShowHistoryConfirm(false); setPendingEmployee(null); }} style={{
                        flex: 1, padding: '12px', background: 'transparent',
                        color: C.textSec, border: `1px solid ${C.border}`, borderRadius: C.radiusSm,
                        cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                      }}>
                        Cancel
                      </button>
                    </div>
                  </BentoCard>
                </div>
              )}

              {/* Employee History Panel */}
              {selectedEmployee && (
                <EmployeeHistory
                  employee={selectedEmployee}
                  baseUrl={BASE_URL}
                  onClose={() => setSelectedEmployee(null)}
                />
              )}
            </div>
            </div>
          ) : <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
}

export default App;
