import React, { useState } from 'react';

const C = {
  bgBase: '#09090B',
  bgCard: 'rgba(39,39,42,0.70)',
  bgCardHover: 'rgba(55,55,59,0.80)',
  railBg: '#09090B',
  railHover: 'rgba(39,39,42,0.80)',
  railActive: 'rgba(99,102,241,0.15)',
  railActiveBg: 'rgba(99,102,241,0.20)',
  railBorder: 'rgba(255,255,255,0.06)',
  railIcon: 'rgba(255,255,255,0.40)',
  railIconActive: '#a5b4fc',
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

const Sidebar = ({
  employees, filterId, setFilterId,
  setShowAddModal, setShowRemoveModal, setShowHistoryConfirm, setPendingEmployee,
}) => {
  const [hoveredNav, setHoveredNav] = useState(null);

  const navItems = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  ];

  const actionItems = [
    { id: 'add', icon: '＋', label: 'Add Employee', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    { id: 'remove', icon: '✕', label: 'Remove Employee', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
  ];

  const handleNavClick = (id) => {
    if (id === 'add') setShowAddModal(true);
    if (id === 'remove') setShowRemoveModal && setShowRemoveModal(true);
  };

  return (
    <div style={{
      width: '56px',
      background: C.railBg,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
      zIndex: 200,
      boxShadow: '2px 0 20px rgba(0,0,0,0.4)',
      borderRight: `1px solid ${C.border}`,
    }}>
      {/* Logo */}
      <div style={{
        width: 40, height: 40,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.30) 0%, rgba(129,140,248,0.20) 100%)',
        border: '1px solid rgba(99,102,241,0.35)',
        borderRadius: C.radiusSm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px',
        marginBottom: '24px',
        flexShrink: 0,
        boxShadow: '0 0 20px rgba(99,102,241,0.25)',
      }}>🛡️</div>

      {/* Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', padding: '0 8px' }}>
        {navItems.map(({ id, icon, label }) => {
          const isHovered = hoveredNav === id;
          return (
            <div
              key={id}
              title={label}
              onMouseEnter={() => setHoveredNav(id)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                width: '44px',
                height: '44px',
                margin: '0 auto',
                borderRadius: C.radiusSm,
                background: isHovered ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? 'rgba(99,102,241,0.40)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
                boxShadow: isHovered ? '0 0 15px rgba(99,102,241,0.20)' : 'none',
              }}
            >
              <span style={{
                fontSize: '20px',
                color: isHovered ? C.railIconActive : C.railIcon,
                transition: 'color 0.15s',
                lineHeight: 1,
              }}>
                {icon}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        width: '100%', padding: '0 8px', marginTop: '16px'
      }}>
        {actionItems.map(({ id, icon, label, color, bg }) => {
          const isHovered = hoveredNav === id;
          return (
            <div
              key={id}
              title={label}
              onClick={() => handleNavClick(id)}
              onMouseEnter={() => setHoveredNav(id)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                width: '44px',
                height: '44px',
                margin: '0 auto',
                borderRadius: C.radiusSm,
                background: isHovered ? bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHovered ? color : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                flexShrink: 0,
                boxShadow: isHovered ? `0 0 15px ${color}30` : 'none',
              }}
            >
              <span style={{
                fontSize: '20px',
                color: isHovered ? color : C.railIcon,
                transition: 'all 0.15s',
                lineHeight: 1,
              }}>
                {icon}
              </span>
            </div>
          );
        })}
      </div>

      {/* Staff count */}
      <div style={{ marginTop: 'auto', padding: '0 8px', width: '100%' }}>
        <div
          title={`${employees.length} Staff`}
          style={{
            width: '40px', height: '40px', margin: '0 auto',
            borderRadius: C.radiusSm,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '12px', fontWeight: '700',
            color: C.railIcon,
            transition: 'all 0.15s',
          }}
        >
          {employees.length}
        </div>
      </div>
    </div>
  );
};

// ── Staff Panel ────────────────────────────────────────────────────────────
export const StaffPanel = ({
  employees, filterId, setFilterId,
  setShowAddModal, setShowRemoveModal, setShowHistoryConfirm, setPendingEmployee,
}) => {
  const [hoveredEmp, setHoveredEmp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees?.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dept?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEmpClick = (emp) => {
    setFilterId(emp.employee_id);
    setPendingEmployee(emp);
    setShowHistoryConfirm(true);
  };

  return (
    <div style={{
      width: '280px',
      background: C.bgCard,
      height: '100vh',
      position: 'fixed',
      left: '56px',
      top: 0,
      borderRight: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      boxShadow: '2px 0 20px rgba(0,0,0,0.30)',
      backdropFilter: 'blur(16px)',
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(99,102,241,0.03)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: C.textPrimary }}>
            👥 Staff Directory
          </span>
          <span style={{
            background: 'rgba(99,102,241,0.12)',
            color: C.accentLight,
            borderRadius: '20px',
            padding: '2px 10px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            {employees.length}
          </span>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${C.border}`,
          borderRadius: C.radiusSm,
        }}>
          <span style={{ fontSize: '13px', color: C.textMuted }}>🔍</span>
          <input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: C.textPrimary,
              fontSize: '12px',
            }}
          />
          {searchTerm && (
            <span
              onClick={() => setSearchTerm('')}
              style={{ fontSize: '12px', color: C.textMuted, cursor: 'pointer' }}
            >
              ✕
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              flex: 1, padding: '9px',
              background: 'rgba(16,185,129,0.10)',
              color: '#34d399',
              border: '1px solid rgba(16,185,129,0.20)',
              borderRadius: C.radiusSm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            ＋ Add
          </button>
          <button
            onClick={() => setShowRemoveModal && setShowRemoveModal(true)}
            style={{
              flex: 1, padding: '9px',
              background: 'rgba(239,68,68,0.10)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.20)',
              borderRadius: C.radiusSm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s',
            }}
          >
            ✕ Remove
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <div
              key={emp.employee_id}
              onClick={() => handleEmpClick(emp)}
              onMouseEnter={() => setHoveredEmp(emp.employee_id)}
              onMouseLeave={() => setHoveredEmp(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: C.radiusSm,
                cursor: 'pointer',
                marginBottom: '2px',
                background: filterId === emp.employee_id
                  ? C.railActive
                  : hoveredEmp === emp.employee_id
                    ? 'rgba(255,255,255,0.03)'
                    : 'transparent',
                border: filterId === emp.employee_id
                  ? `1px solid rgba(99,102,241,0.30)`
                  : '1px solid transparent',
                transition: 'all 0.12s',
              }}
            >
              <div style={{
                width: 40, height: 40,
                borderRadius: C.radiusSm,
                background: filterId === emp.employee_id
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.30) 0%, rgba(129,140,248,0.20) 100%)'
                  : 'rgba(255,255,255,0.05)',
                color: filterId === emp.employee_id ? C.accentLight : C.textMuted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                flexShrink: 0,
                border: filterId === emp.employee_id
                  ? '1px solid rgba(99,102,241,0.40)'
                  : `1px solid ${C.border}`,
                boxShadow: filterId === emp.employee_id ? '0 0 15px rgba(99,102,241,0.25)' : 'none',
              }}>
                {emp.name ? emp.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: filterId === emp.employee_id ? '600' : '500',
                  color: filterId === emp.employee_id ? C.textPrimary : C.textSec,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {emp.name}
                </div>
                <div style={{ fontSize: '10px', color: C.textMuted }}>
                  {emp.employee_id} · {emp.dept || 'No dept'}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: C.textMuted }}>→</span>
            </div>
          ))
        ) : (
          <div style={{
            padding: '32px 20px',
            textAlign: 'center',
            color: C.textMuted,
            fontSize: '12px',
          }}>
            {searchTerm ? 'No employees found' : 'No staff registered'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
