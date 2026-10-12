import React, { useEffect, useState, useMemo } from 'react';
import { 
  Moon, Search, RefreshCw, ChevronRight, X, ShieldAlert, 
  Activity, Users, AlertTriangle, Sparkles, Filter
} from 'lucide-react';
import { fetchAllAssessments } from './supabaseClient';
import { evaluateTestPathAndSafety } from './utils/clinicalRules';
import PatientDetailScreen from './components/PatientDetailScreen';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'osa' | 'rls' | 'safety'
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const { data } = await fetchAllAssessments();
    const list = data || [];
    setPatients(list);
    if (selectedPatient) {
      const updated = list.find(p => p.id === selectedPatient.id);
      if (updated) setSelectedPatient(updated);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Process all patients through clinical rules engine
  const processedPatients = useMemo(() => {
    return patients.map(p => {
      const evaluation = evaluateTestPathAndSafety(p);
      return {
        raw: p,
        ...evaluation
      };
    });
  }, [patients]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = processedPatients.length;
    let osaPossible = 0;
    let rlsPossible = 0;
    let safetyAlerts = 0;

    processedPatients.forEach(item => {
      if (item.osaEval.isPositive) osaPossible++;
      if (item.rlsEval.isPositive) rlsPossible++;
      if (item.accidentHistory) safetyAlerts++;
    });

    return { total, osaPossible, rlsPossible, safetyAlerts };
  }, [processedPatients]);

  // Filtered patients for search and quick status tabs
  const filteredPatients = useMemo(() => {
    return processedPatients.filter(item => {
      const p = item.raw;
      const term = searchTerm.toLowerCase().trim();
      
      const matchesSearch = !term || (
        (p.patient_name || '').toLowerCase().includes(term) ||
        (p.mobile_number || '').includes(term) ||
        (p.centre_code || '').toLowerCase().includes(term) ||
        (item.bmiCategory?.label || '').toLowerCase().includes(term) ||
        (item.testPath || '').toLowerCase().includes(term)
      );

      if (!matchesSearch) return false;

      if (activeFilter === 'osa') return item.osaEval.isPositive;
      if (activeFilter === 'rls') return item.rlsEval.isPositive;
      if (activeFilter === 'safety') return item.accidentHistory;

      return true;
    });
  }, [processedPatients, searchTerm, activeFilter]);

  // If a patient is clicked, navigate to the dedicated full-screen Patient Detail Screen
  if (selectedPatient) {
    return (
      <PatientDetailScreen
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  // Otherwise, render the main Doctor Portal Dashboard
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', paddingBottom: 64 }}>
      {/* Sleek Minimalist Top Navbar */}
      <header style={{ 
        height: 64, 
        background: 'rgba(255, 255, 255, 0.92)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0', 
        padding: '0 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', 
        top: 0, 
        zIndex: 30
      }}>
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 10, 
            background: 'linear-gradient(135deg, #0F766E 0%, #043CA0 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 2px 6px rgba(15, 118, 110, 0.2)' 
          }}>
            <Moon size={18} color="#FFFFFF" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.3px' }}>
                Nidra
              </span>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 700, 
                color: '#0F766E', 
                background: '#F0FDFA', 
                border: '1px solid #CCFBF1',
                padding: '1px 7px', 
                borderRadius: 6 
              }}>
                Clinical Portal
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: -2 }}>
              Doctor Triage & Diagnostic Decision Support
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search patient name, mobile, centre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                height: 36, 
                paddingLeft: 34, 
                paddingRight: searchTerm ? 32 : 12, 
                borderRadius: 9, 
                border: '1px solid #E2E8F0', 
                fontSize: 13, 
                background: '#F8FAFC', 
                outline: 'none', 
                transition: 'all 0.15s ease' 
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: 0
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            type="button"
            onClick={loadData}
            title="Refresh clinical database"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              color: '#334155', 
              height: 36,
              padding: '0 14px', 
              borderRadius: 9, 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: 'pointer', 
              transition: 'all 0.15s ease' 
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 32px' }}>
        
        {/* KPI Summary Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: 16, 
          marginBottom: 24 
        }}>
          {/* Total Assessments */}
          <div 
            onClick={() => setActiveFilter('all')}
            style={{ 
              background: '#FFFFFF', 
              padding: '18px 20px', 
              borderRadius: 14, 
              border: `1px solid ${activeFilter === 'all' ? '#0F766E' : '#E2E8F0'}`, 
              boxShadow: activeFilter === 'all' ? '0 0 0 1px #0F766E' : '0 1px 3px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Total Registered</span>
              <Users size={16} color="#64748B" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginTop: 4 }}>
              Active patient assessments
            </div>
          </div>

          {/* OSA Possible */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'osa' ? 'all' : 'osa')}
            style={{ 
              background: '#FFFFFF', 
              padding: '18px 20px', 
              borderRadius: 14, 
              border: `1px solid ${activeFilter === 'osa' ? '#D97706' : '#E2E8F0'}`, 
              boxShadow: activeFilter === 'osa' ? '0 0 0 1px #D97706' : '0 1px 3px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>OSA Probability</span>
              <Activity size={16} color="#D97706" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              {stats.osaPossible}
            </div>
            <div style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginTop: 4 }}>
              ≥2 Indian study criteria (37% - 80%)
            </div>
          </div>

          {/* Likely RLS */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'rls' ? 'all' : 'rls')}
            style={{ 
              background: '#FFFFFF', 
              padding: '18px 20px', 
              borderRadius: 14, 
              border: `1px solid ${activeFilter === 'rls' ? '#2563EB' : '#E2E8F0'}`, 
              boxShadow: activeFilter === 'rls' ? '0 0 0 1px #2563EB' : '0 1px 3px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Likely RLS</span>
              <Sparkles size={16} color="#2563EB" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              {stats.rlsPossible}
            </div>
            <div style={{ fontSize: 11, color: '#2563EB', fontWeight: 600, marginTop: 4 }}>
              IRLSSG 4/4 criteria confirmed
            </div>
          </div>

          {/* Safety Alerts */}
          <div 
            onClick={() => setActiveFilter(activeFilter === 'safety' ? 'all' : 'safety')}
            style={{ 
              background: stats.safetyAlerts > 0 ? '#FEF2F2' : '#FFFFFF', 
              padding: '18px 20px', 
              borderRadius: 14, 
              border: `1px solid ${activeFilter === 'safety' ? '#DC2626' : (stats.safetyAlerts > 0 ? '#FECACA' : '#E2E8F0')}`, 
              boxShadow: activeFilter === 'safety' ? '0 0 0 1px #DC2626' : '0 1px 3px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: stats.safetyAlerts > 0 ? '#991B1B' : '#64748B' }}>
                Safety Alerts
              </span>
              <span style={{ fontSize: 14 }}>🏁</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stats.safetyAlerts > 0 ? '#DC2626' : '#0F172A', letterSpacing: '-0.5px' }}>
              {stats.safetyAlerts}
            </div>
            <div style={{ fontSize: 11, color: stats.safetyAlerts > 0 ? '#991B1B' : '#94A3B8', fontWeight: 600, marginTop: 4 }}>
              Near-miss or crash reported
            </div>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={13} />
              Filter by:
            </span>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: activeFilter === 'all' ? '#0F766E' : '#E2E8F0',
                background: activeFilter === 'all' ? '#F0FDFA' : '#FFFFFF',
                color: activeFilter === 'all' ? '#0F766E' : '#475569',
                cursor: 'pointer'
              }}
            >
              All ({stats.total})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('osa')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: activeFilter === 'osa' ? '#D97706' : '#E2E8F0',
                background: activeFilter === 'osa' ? '#FEF3C7' : '#FFFFFF',
                color: activeFilter === 'osa' ? '#92400E' : '#475569',
                cursor: 'pointer'
              }}
            >
              OSA Priority ({stats.osaPossible})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('rls')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: activeFilter === 'rls' ? '#2563EB' : '#E2E8F0',
                background: activeFilter === 'rls' ? '#EFF6FF' : '#FFFFFF',
                color: activeFilter === 'rls' ? '#1E40AF' : '#475569',
                cursor: 'pointer'
              }}
            >
              RLS Confirmed ({stats.rlsPossible})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('safety')}
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid',
                borderColor: activeFilter === 'safety' ? '#DC2626' : '#E2E8F0',
                background: activeFilter === 'safety' ? '#FEF2F2' : '#FFFFFF',
                color: activeFilter === 'safety' ? '#991B1B' : '#475569',
                cursor: 'pointer'
              }}
            >
              🏁 Crash Risk ({stats.safetyAlerts})
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            Showing <strong>{filteredPatients.length}</strong> of {stats.total} patients
          </div>
        </div>

        {/* Clinical Patient Table Container */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: 16, 
          border: '1px solid #E2E8F0', 
          overflow: 'hidden', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ 
                  borderBottom: '1px solid #E2E8F0', 
                  color: '#64748B', 
                  fontWeight: 700, 
                  fontSize: 11, 
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  background: '#F8FAFC' 
                }}>
                  <th style={{ padding: '14px 20px' }}>Patient</th>
                  <th style={{ padding: '14px 16px' }}>Indian BMI</th>
                  <th style={{ padding: '14px 16px' }}>Comorbidities</th>
                  <th style={{ padding: '14px 16px' }}>OSA Probability</th>
                  <th style={{ padding: '14px 16px' }}>Insomnia</th>
                  <th style={{ padding: '14px 16px' }}>RLS</th>
                  <th style={{ padding: '14px 16px' }}>Recommended Path</th>
                  <th style={{ padding: '14px 16px' }}>Safety</th>
                  <th style={{ padding: '14px 16px' }}>Intake Date</th>
                  <th style={{ padding: '14px 20px', width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: 48, textAlign: 'center' }}>
                      <div style={{ color: '#94A3B8', fontWeight: 600, fontSize: 14 }}>
                        No patient records match the current filters.
                      </div>
                      {(searchTerm || activeFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
                          style={{
                            marginTop: 10,
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          Reset Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(item => {
                    const p = item.raw;
                    const isAccident = item.accidentHistory;
                    const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Oct 2026';
                    const initials = p.patient_name ? p.patient_name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'PT';

                    return (
                      <tr 
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        style={{ 
                          borderBottom: '1px solid #F1F5F9',
                          borderLeft: isAccident ? '3px solid #EF4444' : '3px solid transparent',
                          cursor: 'pointer',
                          background: isAccident ? '#FFF5F5' : '#FFFFFF',
                          transition: 'all 0.12s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = isAccident ? '#FEE2E2' : '#F8FAFC';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = isAccident ? '#FFF5F5' : '#FFFFFF';
                        }}
                      >
                        {/* Patient Identity */}
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              background: isAccident ? '#FEE2E2' : '#F1F5F9',
                              color: isAccident ? '#DC2626' : '#0F766E',
                              fontWeight: 800,
                              fontSize: 12,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                <span>{p.patient_name || 'Anonymous'}</span>
                                {isAccident && (
                                  <span 
                                    title="CRITICAL SAFETY ALERT: Driving Near-Miss or Accident reported" 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: 3, 
                                      fontSize: 10, 
                                      fontWeight: 800, 
                                      background: '#DC2626', 
                                      color: '#FFF', 
                                      padding: '1px 6px', 
                                      borderRadius: 5 
                                    }}
                                  >
                                    🏁 Crash Risk
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 1 }}>
                                {p.age || '--'}y • {p.sex ? (p.sex.toLowerCase().startsWith('m') ? 'Male' : p.sex.toLowerCase().startsWith('f') ? 'Female' : p.sex) : '--'}
                                {p.mobile_number ? ` • ${p.mobile_number}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* BMI */}
                        <td style={{ padding: '14px 16px' }}>
                          {item.bmi ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>
                                {item.bmi} <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>kg/m²</span>
                              </span>
                              <span style={{ 
                                fontSize: 10, 
                                fontWeight: 700, 
                                color: item.bmiCategory.color, 
                                width: 'fit-content'
                              }}>
                                {item.bmiCategory.label}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>

                        {/* Comorbidities */}
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155', fontSize: 12 }}>
                          {item.comorbidityLabel}
                        </td>

                        {/* OSA Score Ratio & Probability */}
                        <td style={{ padding: '14px 16px' }}>
                          {item.osaEval.totalPositive > 0 ? (
                            <span style={{ 
                              fontSize: 11, 
                              fontWeight: 800, 
                              background: item.osaEval.totalPositive >= 3 ? '#FEE2E2' : (item.osaEval.totalPositive === 2 ? '#FEF3C7' : '#F1F5F9'), 
                              color: item.osaEval.totalPositive >= 3 ? '#991B1B' : (item.osaEval.totalPositive === 2 ? '#92400E' : '#475569'), 
                              padding: '3px 8px', 
                              borderRadius: 6,
                              display: 'inline-block'
                            }}>
                              {item.osaEval.scoreRatio} {item.osaEval.probabilityPercent ? `(${item.osaEval.probabilityPercent}%)` : ''}
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: 12 }}>0/4 (Low)</span>
                          )}
                        </td>

                        {/* INSOMNIA Badge */}
                        <td style={{ padding: '14px 16px' }}>
                          {item.insomniaEval.isPositive ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 6 }}>
                              Possible
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>

                        {/* RLS Badge */}
                        <td style={{ padding: '14px 16px' }}>
                          {item.rlsEval.isPositive ? (
                            <span style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#1E40AF', padding: '3px 8px', borderRadius: 6 }}>
                              Likely (4/4)
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>

                        {/* Test path */}
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            background: item.testPath.includes('Specialist') ? '#FEE2E2' : '#F0FDFA', 
                            color: item.testPath.includes('Specialist') ? '#991B1B' : '#0F766E', 
                            border: `1px solid ${item.testPath.includes('Specialist') ? '#FECACA' : '#CCFBF1'}`,
                            padding: '3px 9px', 
                            borderRadius: 6,
                            display: 'inline-block'
                          }}>
                            {item.testPath}
                          </span>
                        </td>

                        {/* Safety */}
                        <td style={{ padding: '14px 16px' }}>
                          {isAccident ? (
                            <span style={{ 
                              fontSize: 11, 
                              fontWeight: 800, 
                              background: '#FEE2E2', 
                              color: '#991B1B', 
                              padding: '3px 7px', 
                              borderRadius: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }}>
                              🏁 Alert
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>

                        {/* Updated Date */}
                        <td style={{ padding: '14px 16px', color: '#64748B', fontWeight: 500, fontSize: 12 }}>
                          {dateStr}
                        </td>

                        {/* Chevron right */}
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <ChevronRight size={16} color="#94A3B8" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
