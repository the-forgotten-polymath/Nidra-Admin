import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, Activity, AlertTriangle, Search, RefreshCw, 
  Moon, Wind, Flag, Stethoscope, Car, ChevronRight, CheckCircle2
} from 'lucide-react';
import { fetchAllAssessments } from './supabaseClient';
import { evaluateTestPathAndSafety } from './utils/clinicalRules';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const { data } = await fetchAllAssessments();
    setPatients(data || []);
    if (data && data.length > 0 && !selectedPatient) {
      setSelectedPatient(data[0]);
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

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return processedPatients.filter(item => {
      const p = item.raw;
      const term = searchTerm.toLowerCase();
      return (p.patient_name || '').toLowerCase().includes(term) ||
             (p.mobile_number || '').includes(term) ||
             (p.centre_code || '').toLowerCase().includes(term);
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
      if (item.safetyAlert) safetyAlerts++;
    });

    return { total, osaPossible, rlsPossible, safetyAlerts };
  }, [processedPatients]);

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F172A' }}>
      {/* Header Bar */}
      <header style={{ height: 64, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Moon size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              SleepWell <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Doctor</span>
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Patient or centre number"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', height: 36, paddingLeft: 36, paddingRight: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, background: '#F8FAFC', outline: 'none' }}
            />
          </div>

          <button 
            onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <RefreshCw size={13} className={loading ? 'spin-animation' : ''} />
            Refresh
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px' }}>
        {/* Top Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>New assessments</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.total}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>OSA possible</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.osaPossible}</div>
          </div>

          <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Possible RLS</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.rlsPossible}</div>
          </div>

          <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 14, border: '1px solid #FCA5A5' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B' }}>Safety alerts</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#DC2626', marginTop: 4 }}>{stats.safetyAlerts}</div>
          </div>
        </div>

        {/* Clinical Patient Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: 12 }}>
                <th style={{ padding: '14px 20px' }}>Patient</th>
                <th style={{ padding: '14px 16px' }}>OSA</th>
                <th style={{ padding: '14px 16px' }}>Comorbidity</th>
                <th style={{ padding: '14px 16px' }}>RLS</th>
                <th style={{ padding: '14px 16px' }}>Insomnia</th>
                <th style={{ padding: '14px 16px' }}>Test path</th>
                <th style={{ padding: '14px 16px' }}>Safety</th>
                <th style={{ padding: '14px 20px' }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(item => {
                  const p = item.raw;
                  const isSelected = selectedPatient?.id === p.id;
                  const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Today';

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        background: isSelected ? '#F0FDFA' : 'transparent',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Patient Name & Age/Sex */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.patient_name || 'Anonymous'}</div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
                          {p.age || '--'} {p.sex ? p.sex.charAt(0) : ''}
                        </div>
                      </td>

                      {/* OSA Score Ratio */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.osaEval.totalPositive > 0 ? (
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 800, 
                            background: '#FEF3C7', 
                            color: '#92400E', 
                            padding: '3px 8px', 
                            borderRadius: 12 
                          }}>
                            {item.osaEval.scoreRatio}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Comorbidity */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#334155' }}>
                        {item.comorbidityLabel}
                      </td>

                      {/* RLS Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.rlsEval.isPositive ? (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 12 }}>
                            Possible
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Insomnia Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.insomniaEval.isPositive ? (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: 12 }}>
                            Possible
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Test Path Pill */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 700, 
                          background: '#CCFBF1', 
                          color: '#0F766E', 
                          padding: '4px 10px', 
                          borderRadius: 12 
                        }}>
                          {item.testPath}
                        </span>
                      </td>

                      {/* Safety Alert Flag / Icon */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.safetyAlert ? (
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 800, 
                            background: '#FEE2E2', 
                            color: '#991B1B', 
                            padding: '3px 8px', 
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            {item.accidentHistory ? '🏁 Crash Risk' : 'Alert'}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Updated Date */}
                      <td style={{ padding: '14px 20px', color: '#64748B', fontWeight: 500 }}>
                        {dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Patient Detail Modal/Drawer if selected */}
        {selectedPatient && (
          <div style={{ marginTop: 24, background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {selectedPatient.patient_name || 'Anonymous Patient'}
                </h2>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                  Age: {selectedPatient.age || '--'} • Sex: {selectedPatient.sex || '--'} • Mobile: {selectedPatient.mobile_number || 'N/A'}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)}
                style={{ background: '#F1F5F9', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#475569' }}
              >
                Close Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>🫁 OSA Symptoms</div>
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                  <div>Snoring: {selectedPatient.snores_when_sleeping ? 'Yes' : 'No'}</div>
                  <div>Daytime Fatigue: {selectedPatient.drowsy_during_day ? 'Yes' : 'No'}</div>
                  <div>Observed Apnea: {selectedPatient.stop_breathing_noticed ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>📏 Vitals & Anthropometrics</div>
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>
                  <div>BP: {selectedPatient.bp_systolic ? `${selectedPatient.bp_systolic}/${selectedPatient.bp_diastolic}` : 'N/A'}</div>
                  <div>Height / Weight: {selectedPatient.height_cm || 150} cm / {selectedPatient.weight_kg || 60} kg</div>
                  <div>Neck: {selectedPatient.neck_circumference_cm ? `${selectedPatient.neck_circumference_cm} cm` : 'N/A'}</div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>🚗 Driving & Safety</div>
                <div style={{ fontSize: 13, marginTop: 8, fontWeight: 600, color: selectedPatient.had_driving_accident_or_near_miss ? '#DC2626' : '#0F172A' }}>
                  {selectedPatient.had_driving_accident_or_near_miss ? '🏁 Reported Driving Accident / Near-Miss' : 'No driving accidents reported'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
