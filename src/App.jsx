import React, { useEffect, useState, useMemo } from 'react';
import { 
  Moon, Search, RefreshCw, ChevronRight, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { fetchAllAssessments } from './supabaseClient';
import { evaluateTestPathAndSafety } from './utils/clinicalRules';
import PatientDetailScreen from './components/PatientDetailScreen';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtered patients for search
  const filteredPatients = useMemo(() => {
    return processedPatients.filter(item => {
      const p = item.raw;
      const term = searchTerm.toLowerCase();
      return (p.patient_name || '').toLowerCase().includes(term) ||
             (p.mobile_number || '').includes(term) ||
             (p.centre_code || '').toLowerCase().includes(term) ||
             (item.bmiCategory?.label || '').toLowerCase().includes(term);
    });
  }, [processedPatients, searchTerm]);

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
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F172A', paddingBottom: 60 }}>
      {/* Header Bar */}
      <header style={{ 
        height: 70, 
        background: '#FFFFFF', 
        borderBottom: '1px solid #E2E8F0', 
        padding: '0 32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', 
        top: 0, 
        zIndex: 30, 
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)' 
          }}>
            <Moon size={22} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: '#0F172A', letterSpacing: '-0.3px' }}>
              SleepWell
            </h1>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Doctor</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 340 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: 11, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Patient or centre number"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', 
                height: 38, 
                paddingLeft: 38, 
                paddingRight: 14, 
                borderRadius: 10, 
                border: '1px solid #E2E8F0', 
                fontSize: 13, 
                background: '#F8FAFC', 
                outline: 'none', 
                transition: 'border-color 0.15s ease' 
              }}
            />
          </div>

          <button 
            type="button"
            onClick={loadData}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              background: '#FFFFFF', 
              border: '1px solid #CBD5E1', 
              color: '#334155', 
              padding: '8px 16px', 
              borderRadius: 10, 
              fontSize: 13, 
              fontWeight: 700, 
              cursor: 'pointer', 
              transition: 'all 0.15s ease', 
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)' 
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px' }}>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 26 }}>
          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>New assessments</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.total}</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>OSA possible</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.osaPossible}</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '20px 24px', borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>Likely RLS</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.rlsPossible}</div>
          </div>

          <div style={{ 
            background: stats.safetyAlerts > 0 ? '#FEF2F2' : '#FFF5F5', 
            padding: '20px 24px', 
            borderRadius: 16, 
            border: stats.safetyAlerts > 0 ? '1.5px solid #FCA5A5' : '1.5px solid #FECACA', 
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.05)' 
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>Safety alerts</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#DC2626', marginTop: 4 }}>{stats.safetyAlerts}</div>
          </div>
        </div>

        {/* Clinical Patient Table */}
        <div style={{ 
          background: '#FFFFFF', 
          borderRadius: 18, 
          border: '1px solid #E2E8F0', 
          overflow: 'hidden', 
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', 
          marginBottom: 28 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, fontSize: 12, background: '#FFFFFF' }}>
                <th style={{ padding: '16px 22px' }}>Patient</th>
                <th style={{ padding: '16px 16px' }}>BMI</th>
                <th style={{ padding: '16px 16px' }}>Comorbidities</th>
                <th style={{ padding: '16px 16px' }}>OSA</th>
                <th style={{ padding: '16px 16px' }}>INSOMNIA</th>
                <th style={{ padding: '16px 16px' }}>RLS</th>
                <th style={{ padding: '16px 16px' }}>Test path</th>
                <th style={{ padding: '16px 16px' }}>Safety</th>
                <th style={{ padding: '16px 22px' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(item => {
                  const p = item.raw;
                  const isAccident = item.accidentHistory;
                  const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString('en-GB') : '12/10/2026';

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        borderLeft: isAccident ? '4px solid #DC2626' : '4px solid transparent',
                        cursor: 'pointer',
                        background: isAccident ? '#FFF1F2' : '#FFFFFF',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = isAccident ? '#FEE2E2' : '#F8FAFC';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isAccident ? '#FFF1F2' : '#FFFFFF';
                      }}
                    >
                      {/* Patient Name & Age/Sex + Chevron arrow */}
                      <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                              <span>{p.patient_name || 'Anonymous'}</span>
                              {isAccident && (
                                <span 
                                  title="SAFETY ALERT: Driving Near-Miss or Accident reported" 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: 3, 
                                    fontSize: 10, 
                                    fontWeight: 800, 
                                    background: '#DC2626', 
                                    color: '#FFF', 
                                    padding: '1px 6px', 
                                    borderRadius: 6 
                                  }}
                                >
                                  🏁 Crash Risk
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
                              {p.age || '--'} {p.sex ? (p.sex.toLowerCase().startsWith('m') ? 'M' : p.sex.toLowerCase().startsWith('f') ? 'F' : p.sex) : '--'}
                            </div>
                          </div>
                          <ChevronRight 
                            size={16} 
                            style={{ 
                              color: '#94A3B8',
                              flexShrink: 0
                            }} 
                          />
                        </div>
                      </td>

                      {/* BMI */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.bmi ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontWeight: 800, color: '#0F172A', fontSize: 13 }}>
                              {item.bmi}
                            </span>
                            <span style={{ 
                              fontSize: 10, 
                              fontWeight: 800, 
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
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#334155' }}>
                        {item.comorbidityLabel}
                      </td>

                      {/* OSA Score Ratio & Probability */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.osaEval.totalPositive > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ 
                              fontSize: 11, 
                              fontWeight: 800, 
                              background: item.osaEval.totalPositive >= 3 ? '#FEE2E2' : (item.osaEval.totalPositive === 2 ? '#FEF3C7' : '#FEF3C7'), 
                              color: item.osaEval.totalPositive >= 3 ? '#991B1B' : (item.osaEval.totalPositive === 2 ? '#92400E' : '#92400E'), 
                              padding: '3px 8px', 
                              borderRadius: 12,
                              width: 'fit-content'
                            }}>
                              {item.osaEval.scoreRatio} {item.osaEval.probabilityPercent ? `(${item.osaEval.probabilityPercent}%)` : ''}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* INSOMNIA Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.insomniaEval.isPositive ? (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 12 }}>
                            Possible
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* RLS Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.rlsEval.isPositive ? (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 12 }}>
                            Likely
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
                          background: item.testPath.includes('Specialist') ? '#FEF2F2' : '#CCFBF1', 
                          color: item.testPath.includes('Specialist') ? '#991B1B' : '#0F766E', 
                          padding: '4px 10px', 
                          borderRadius: 12,
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
                            fontWeight: 900, 
                            background: '#FEE2E2', 
                            color: '#991B1B', 
                            padding: '4px 8px', 
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            🏁 Alert
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td style={{ padding: '14px 22px', color: '#64748B', fontWeight: 500 }}>
                        {dateStr}
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
  );
}
