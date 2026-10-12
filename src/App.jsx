import React, { useEffect, useState, useMemo } from 'react';
import { 
  Users, Activity, AlertTriangle, Search, RefreshCw, 
  Moon, Wind, Flag, Stethoscope, Car, ChevronRight, CheckCircle2,
  User, Bed, Cigarette, Coffee, Pencil, X, Save, Clock, HeartPulse,
  Sparkles, Plus, Minus, Check, ShieldAlert, CheckCircle
} from 'lucide-react';
import { fetchAllAssessments, updateAssessment } from './supabaseClient';
import { 
  evaluateTestPathAndSafety, 
  calculatePatientBMI, 
  getBMICategory,
  evaluateRLS,
  evaluateInsomnia,
  evaluateOSA
} from './utils/clinicalRules';

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editData, setEditData] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  const loadData = async () => {
    setLoading(true);
    const { data } = await fetchAllAssessments();
    const list = data || [];
    setPatients(list);
    if (list.length > 0 && !selectedPatient) {
      setSelectedPatient(list[0]);
      setEditData({ ...list[0] });
    } else if (selectedPatient) {
      const updated = list.find(p => p.id === selectedPatient.id);
      if (updated) {
        setSelectedPatient(updated);
        setEditData({ ...updated });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync editData whenever selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      setEditData({ ...selectedPatient });
      setEditingSection(null);
      setSaveStatus(null);
    }
  }, [selectedPatient?.id]);

  const updateEditField = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleDiagnosedCondition = (condition) => {
    const current = Array.isArray(editData.diagnosed_conditions) ? [...editData.diagnosed_conditions] : [];
    const exists = current.includes(condition);
    const updated = exists ? current.filter(c => c !== condition) : [...current, condition];
    updateEditField('diagnosed_conditions', updated);
  };

  const toggleIncidentType = (incident) => {
    const current = Array.isArray(editData.sleepiness_incident_types) ? [...editData.sleepiness_incident_types] : [];
    if (incident === 'Neither of these') {
      updateEditField('sleepiness_incident_types', ['Neither of these']);
      return;
    }
    const filtered = current.filter(i => i !== 'Neither of these');
    if (filtered.includes(incident)) {
      updateEditField('sleepiness_incident_types', filtered.filter(i => i !== incident));
    } else {
      updateEditField('sleepiness_incident_types', [...filtered, incident]);
    }
  };

  const handleSaveAssessment = async () => {
    if (!editData || !editData.id) return;
    setSaveStatus('saving');

    // Clean data payload for Supabase update (omit generated or system columns)
    const payload = {
      patient_name: editData.patient_name || '',
      age: Number(editData.age) || 0,
      sex: editData.sex || '',
      mobile_number: editData.mobile_number || '',
      centre_code: editData.centre_code || '',

      // Sleep
      time_to_fall_asleep_minutes: Number(editData.time_to_fall_asleep_minutes) || 0,
      nocturnal_awakenings_count: Number(editData.nocturnal_awakenings_count) || 0,
      sleep_duration_hours: Number(editData.sleep_duration_hours) || 0,
      sleep_complaint_nights_per_week: Number(editData.sleep_complaint_nights_per_week) ?? 0,
      problem_duration_years: Number(editData.problem_duration_years) || 0,
      problem_duration_months: Number(editData.problem_duration_months) || 0,

      // Snoring / Breathing
      snores_when_sleeping: Boolean(editData.snores_when_sleeping),
      snoring_loud_other_room: Boolean(editData.snoring_loud_other_room),
      wakes_choking_gasping: Boolean(editData.wakes_choking_gasping),
      stop_breathing_noticed: Boolean(editData.stop_breathing_noticed),
      dry_mouth: Boolean(editData.dry_mouth),
      morning_headache: Boolean(editData.morning_headache),

      // Vitals & Body
      height_cm: Number(editData.height_cm) || 150,
      weight_kg: Number(editData.weight_kg) || 60,
      bp_systolic: editData.bp_systolic ? Number(editData.bp_systolic) : null,
      bp_diastolic: editData.bp_diastolic ? Number(editData.bp_diastolic) : null,
      neck_circumference_cm: editData.neck_circumference_cm ? Number(editData.neck_circumference_cm) : null,
      waist_circumference_cm: editData.waist_circumference_cm ? Number(editData.waist_circumference_cm) : null,

      // Daytime & Driving
      drowsy_during_day: Boolean(editData.drowsy_during_day),
      tired_low_energy: Boolean(editData.tired_low_energy),
      affects_work_or_daily: Boolean(editData.affects_work_or_daily),
      takes_naps: Boolean(editData.takes_naps),
      nap_duration_minutes: Number(editData.nap_duration_minutes) || 0,
      drives_vehicle: Boolean(editData.drives_vehicle),
      sleepy_while_driving: Boolean(editData.sleepy_while_driving),
      sleepiness_incident_types: Array.isArray(editData.sleepiness_incident_types) ? editData.sleepiness_incident_types : [],

      // RLS (4 criteria)
      legs_uncomfortable_resting: Boolean(editData.legs_uncomfortable_resting),
      legs_no_other_reason: Boolean(editData.legs_no_other_reason),
      legs_moving_helps: Boolean(editData.legs_moving_helps),
      legs_worse_evening: Boolean(editData.legs_worse_evening),

      // Lifestyle
      diagnosed_conditions: Array.isArray(editData.diagnosed_conditions) ? editData.diagnosed_conditions : [],
      other_condition_text: editData.other_condition_text || null,
      cigarettes_per_day: Number(editData.cigarettes_per_day) || 0,
      alcohol_frequency: editData.alcohol_frequency || '',
      caffeinated_drinks_per_day: Number(editData.caffeinated_drinks_per_day) || 0,
      screen_time_before_bed: editData.screen_time_before_bed || ''
    };

    const { data: updated, error } = await updateAssessment(editData.id, payload);

    if (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3500);
      return;
    }

    const merged = { ...editData, ...(updated || payload) };
    setPatients(prev => prev.map(p => p.id === merged.id ? merged : p));
    setSelectedPatient(merged);
    setEditData(merged);
    setEditingSection(null);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

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
      if (item.safetyAlert || item.accidentHistory) safetyAlerts++;
    });

    return { total, osaPossible, rlsPossible, safetyAlerts };
  }, [processedPatients]);

  // Live evaluation of currently selected / editing patient
  const livePatientEval = useMemo(() => {
    if (!editData) return null;
    return evaluateTestPathAndSafety(editData);
  }, [editData]);

  const isLiveAccidentRisk = livePatientEval?.accidentHistory;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F172A', paddingBottom: 60 }}>
      {/* Header Bar */}
      <header style={{ height: 64, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Moon size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              SleepWell <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Doctor Portal</span>
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search patient, phone, clinic code..."
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
          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Total Assessments</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{stats.total}</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>OSA Possible (≥2/4)</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#D97706', marginTop: 4 }}>{stats.osaPossible}</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: 20, borderRadius: 14, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Likely RLS (4/4)</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#2563EB', marginTop: 4 }}>{stats.rlsPossible}</div>
          </div>

          <div style={{ background: '#FEF2F2', padding: 20, borderRadius: 14, border: '1.5px solid #FCA5A5', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏁 Safety & Crash Alerts</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#DC2626', marginTop: 4 }}>{stats.safetyAlerts}</div>
          </div>
        </div>

        {/* Clinical Patient Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 28 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#334155' }}>
              Patient Intake Assessments ({filteredPatients.length})
            </span>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Click any patient to inspect & adjust complete clinical intake data
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: 12, background: '#FAFAFA' }}>
                <th style={{ padding: '14px 20px' }}>Patient</th>
                <th style={{ padding: '14px 16px' }}>BMI</th>
                <th style={{ padding: '14px 16px' }}>Comorbidities</th>
                <th style={{ padding: '14px 16px' }}>OSA</th>
                <th style={{ padding: '14px 16px' }}>INSOMNIA</th>
                <th style={{ padding: '14px 16px' }}>RLS</th>
                <th style={{ padding: '14px 16px' }}>Test path</th>
                <th style={{ padding: '14px 16px' }}>Safety</th>
                <th style={{ padding: '14px 20px' }}>Updated</th>
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
                  const isSelected = selectedPatient?.id === p.id;
                  const isAccident = item.accidentHistory;
                  const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Today';

                  return (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        borderLeft: isAccident ? '5px solid #DC2626' : (isSelected ? '5px solid #0F766E' : '5px solid transparent'),
                        cursor: 'pointer',
                        background: isSelected 
                          ? (isAccident ? '#FEE2E2' : '#F0FDFA') 
                          : (isAccident ? '#FFF1F2' : 'transparent'),
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Patient Name & Age/Sex */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{p.patient_name || 'Anonymous'}</span>
                          {isAccident && (
                            <span 
                              title="SAFETY ALERT: Driving Near-Miss or Accident reported" 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 3, 
                                fontSize: 11, 
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
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>
                          {p.age || '--'} yrs • {p.sex || '--'} • {p.mobile_number || 'No phone'}
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
                              fontWeight: 700, 
                              color: item.bmiCategory.color, 
                              background: item.bmiCategory.bg, 
                              padding: '1px 6px', 
                              borderRadius: 8,
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 800, 
                            background: item.osaEval.totalPositive >= 3 ? '#FEE2E2' : (item.osaEval.totalPositive === 2 ? '#FEF3C7' : '#F1F5F9'), 
                            color: item.osaEval.totalPositive >= 3 ? '#991B1B' : (item.osaEval.totalPositive === 2 ? '#92400E' : '#475569'), 
                            padding: '3px 8px', 
                            borderRadius: 12,
                            width: 'fit-content'
                          }}>
                            {item.osaEval.scoreRatio} {item.osaEval.probabilityPercent ? `(${item.osaEval.probabilityPercent}%)` : ''}
                          </span>
                          <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                            {item.osaEval.dashboardMessage}
                          </span>
                        </div>
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
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#DBEAFE', color: '#1E40AF', padding: '3px 8px', borderRadius: 12 }}>
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
                          borderRadius: 12 
                        }}>
                          {item.testPath}
                        </span>
                      </td>

                      {/* Safety Alert Flag / Icon */}
                      <td style={{ padding: '14px 16px' }}>
                        {item.safetyAlert || isAccident ? (
                          <span style={{ 
                            fontSize: 11, 
                            fontWeight: 800, 
                            background: isAccident ? '#DC2626' : '#FEE2E2', 
                            color: isAccident ? '#FFFFFF' : '#991B1B', 
                            padding: '3px 8px', 
                            borderRadius: 12, 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            boxShadow: isAccident ? '0 2px 6px rgba(220, 38, 38, 0.25)' : 'none'
                          }}>
                            {isAccident ? '🏁 Accident Risk' : 'Alert'}
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

        {/* =========================================================================
            DETAILED CLINICAL INTAKE SUMMARY & ADJUSTMENT WORKSPACE
            ========================================================================= */}
        {selectedPatient && editData && (
          <div 
            style={{ 
              background: '#FFFFFF', 
              borderRadius: 20, 
              border: isLiveAccidentRisk ? '2px solid #EF4444' : '1.5px solid #CBD5E1', 
              padding: 24,
              boxShadow: isLiveAccidentRisk ? '0 10px 30px rgba(239, 68, 68, 0.14)' : '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            {/* MOTOR VEHICLE SAFETY ALERT BANNER (Chequered flag safety alert) */}
            {isLiveAccidentRisk && (
              <div style={{
                background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                border: '1.5px solid #F87171',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 34, lineHeight: 1 }}>🏁</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                      CRITICAL MOTOR VEHICLE SAFETY ALERT (NEAR-MISS / ACCIDENT REPORTED)
                    </div>
                    <div style={{ fontSize: 13, color: '#B91C1C', marginTop: 4, fontWeight: 600 }}>
                      Patient reported: <strong>{editData.sleepiness_incident_types?.length ? editData.sleepiness_incident_types.join(', ') : 'Near-miss or collision while driving'}</strong> due to daytime drowsiness/fatigue.
                      Immediate clinical action: <strong>HSAT + Urgently Meet Sleep Specialist</strong>.
                    </div>
                  </div>
                </div>
                <span style={{ 
                  background: '#DC2626', 
                  color: '#FFFFFF', 
                  fontSize: 12, 
                  fontWeight: 900, 
                  padding: '8px 14px', 
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
                }}>
                  🏁 Urgent Clinical Action
                </span>
              </div>
            )}

            {/* Profile Header & Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F1F5F9', paddingBottom: 20, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    {editData.patient_name || 'Anonymous Patient'}
                  </h2>
                  {isLiveAccidentRisk && (
                    <span style={{ fontSize: 18 }} title="Safety Alert: Near-miss or accident reported">🏁</span>
                  )}
                  <span style={{ fontSize: 12, background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                    ID: {editData.id ? String(editData.id).slice(0, 8) : 'NEW'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748B', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span><strong>Age:</strong> {editData.age || '--'} yrs</span>
                  <span><strong>Sex:</strong> {editData.sex || '--'}</span>
                  <span><strong>Mobile:</strong> {editData.mobile_number || 'N/A'}</span>
                  <span><strong>Clinic Code:</strong> {editData.centre_code || 'None'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {saveStatus === 'saved' && (
                  <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle size={15} /> Changes Saved!
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 800 }}>
                    Error saving to server
                  </span>
                )}

                <button 
                  onClick={handleSaveAssessment}
                  disabled={saveStatus === 'saving'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#043CA0',
                    color: '#FFF',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(4, 60, 160, 0.2)'
                  }}
                >
                  <Save size={15} />
                  <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Assessment'}</span>
                </button>

                <button 
                  onClick={() => setSelectedPatient(null)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#475569' }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Diagnostic Triage Overview Bar */}
            <div style={{ 
              background: '#F8FAFC', 
              borderRadius: 14, 
              padding: '14px 18px', 
              border: '1px solid #E2E8F0', 
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>OSA Evaluation</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: livePatientEval?.osaEval.isPositive ? '#92400E' : '#0F172A' }}>
                    {livePatientEval?.osaEval.scoreRatio} • {livePatientEval?.osaEval.dashboardMessage}
                  </span>
                </div>
                <div style={{ width: 1, height: 26, background: '#CBD5E1' }} />
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>Insomnia</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: livePatientEval?.insomniaEval.isPositive ? '#92400E' : '#0F172A' }}>
                    {livePatientEval?.insomniaEval.isPositive ? 'Possible Insomnia' : 'No Insomnia'}
                  </span>
                </div>
                <div style={{ width: 1, height: 26, background: '#CBD5E1' }} />
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>Restless Legs (RLS)</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: livePatientEval?.rlsEval.isPositive ? '#1E40AF' : '#0F172A' }}>
                    {livePatientEval?.rlsEval.isPositive ? 'Likely RLS (4/4)' : 'No RLS'}
                  </span>
                </div>
                <div style={{ width: 1, height: 26, background: '#CBD5E1' }} />
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>BMI (Indian Standard)</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: livePatientEval?.bmiCategory.color }}>
                    {livePatientEval?.bmi || '--'} kg/m² ({livePatientEval?.bmiCategory.label})
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block' }}>Recommended Test Path</span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 800, 
                  background: livePatientEval?.testPath.includes('Specialist') ? '#FEE2E2' : '#CCFBF1', 
                  color: livePatientEval?.testPath.includes('Specialist') ? '#991B1B' : '#0F766E', 
                  padding: '4px 10px', 
                  borderRadius: 10,
                  display: 'inline-block',
                  marginTop: 2
                }}>
                  {livePatientEval?.testPath}
                </span>
              </div>
            </div>

            {/* 8 COMPREHENSIVE CARDS (Identical to Patient Review in Screen 26) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

              {/* CARD 1: Personal & Contact Profile */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Personal & Contact Profile</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'personal' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'personal' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'personal' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'personal' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'personal' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'personal' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={editData.patient_name || ''} 
                        onChange={e => updateEditField('patient_name', e.target.value)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Age (Years)</label>
                        <input 
                          type="number" 
                          value={editData.age || ''} 
                          onChange={e => updateEditField('age', Math.max(0, parseInt(e.target.value) || 0))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Sex</label>
                        <select 
                          value={editData.sex || ''} 
                          onChange={e => updateEditField('sex', e.target.value)} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3, background: '#FFF' }}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Mobile Number</label>
                      <input 
                        type="text" 
                        value={editData.mobile_number || ''} 
                        onChange={e => updateEditField('mobile_number', e.target.value)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Clinic / Centre Code</label>
                      <input 
                        type="text" 
                        value={editData.centre_code || ''} 
                        onChange={e => updateEditField('centre_code', e.target.value)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Name</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.patient_name || 'Anonymous'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Age & Sex</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.age ? `${editData.age} yrs` : '--'} • {editData.sex || '--'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Mobile</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.mobile_number || 'N/A'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Clinic Code</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.centre_code || 'None'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 2: Sleep Habits & Duration */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bed size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Sleep Habits & Duration</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'sleep' ? null : 'sleep')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'sleep' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'sleep' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'sleep' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'sleep' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'sleep' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'sleep' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Time to Fall Asleep (min)</label>
                        <input 
                          type="number" 
                          value={editData.time_to_fall_asleep_minutes ?? 0} 
                          onChange={e => updateEditField('time_to_fall_asleep_minutes', Math.max(0, parseInt(e.target.value) || 0))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Awakenings / Night</label>
                        <input 
                          type="number" 
                          value={editData.nocturnal_awakenings_count ?? 0} 
                          onChange={e => updateEditField('nocturnal_awakenings_count', Math.max(0, parseInt(e.target.value) || 0))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Trouble Nights / Wk</label>
                        <input 
                          type="number" 
                          min={0} max={7}
                          value={editData.sleep_complaint_nights_per_week ?? 0} 
                          onChange={e => updateEditField('sleep_complaint_nights_per_week', Math.max(0, Math.min(7, parseInt(e.target.value) || 0)))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Sleep Hours (hrs)</label>
                        <input 
                          type="number" 
                          step="0.5"
                          value={editData.sleep_duration_hours ?? 7} 
                          onChange={e => updateEditField('sleep_duration_hours', parseFloat(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Latency (Fall Asleep)</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: (editData.time_to_fall_asleep_minutes || 0) >= 30 ? '#B45309' : '#0F172A' }}>
                        {editData.time_to_fall_asleep_minutes || 0} mins
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Night Awakenings</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: (editData.nocturnal_awakenings_count || 0) >= 2 ? '#B45309' : '#0F172A' }}>
                        {editData.nocturnal_awakenings_count || 0} times/night
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Trouble Frequency</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: (editData.sleep_complaint_nights_per_week || 0) >= 3 ? '#B45309' : '#0F172A' }}>
                        {editData.sleep_complaint_nights_per_week || 0} nights/week
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Sleep Duration</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.sleep_duration_hours || 0} hrs/night
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 3: Snoring & Breathing Symptoms (OSA) */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wind size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Snoring & Breathing (OSA)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'breathing' ? null : 'breathing')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'breathing' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'breathing' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'breathing' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'breathing' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'breathing' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'breathing' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'snores_when_sleeping', label: 'Snore when sleeping?' },
                      { key: 'snoring_loud_other_room', label: 'Loud other-room snoring?' },
                      { key: 'stop_breathing_noticed', label: 'Observed breathing pauses / apnea?' },
                      { key: 'wakes_choking_gasping', label: 'Wake up choking or gasping?' }
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, true)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: editData[item.key] ? '#043CA0' : '#E2E8F0', color: editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, false)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: !editData[item.key] ? '#043CA0' : '#E2E8F0', color: !editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Snores</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.snores_when_sleeping ? '#92400E' : '#0F172A' }}>
                        {editData.snores_when_sleeping ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Loud Snoring</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.snoring_loud_other_room ? '#92400E' : '#0F172A' }}>
                        {editData.snoring_loud_other_room ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Observed Apnea</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.stop_breathing_noticed ? '#B91C1C' : '#0F172A' }}>
                        {editData.stop_breathing_noticed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Choking / Gasping</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.wakes_choking_gasping ? '#B91C1C' : '#0F172A' }}>
                        {editData.wakes_choking_gasping ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                )}

                {/* OSA 4-Criteria Diagnostic Assessment Box (Indian Population Study) */}
                {livePatientEval?.osaEval && (
                  <div style={{
                    marginTop: 14,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: livePatientEval.osaEval.totalPositive >= 3 ? '#FEF2F2' : (livePatientEval.osaEval.totalPositive === 2 ? '#FFFBEB' : '#F8FAFC'),
                    border: `1.5px solid ${livePatientEval.osaEval.totalPositive >= 3 ? '#FCA5A5' : (livePatientEval.osaEval.totalPositive === 2 ? '#FDE68A' : '#E2E8F0')}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
                        OSA Clinical Criteria ({livePatientEval.osaEval.scoreRatio} Positive)
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        background: livePatientEval.osaEval.totalPositive >= 3 ? '#FEE2E2' : (livePatientEval.osaEval.totalPositive === 2 ? '#FEF3C7' : '#E2E8F0'),
                        color: livePatientEval.osaEval.totalPositive >= 3 ? '#991B1B' : (livePatientEval.osaEval.totalPositive === 2 ? '#92400E' : '#475569'),
                        padding: '2px 8px',
                        borderRadius: 8
                      }}>
                        {livePatientEval.osaEval.dashboardMessage}
                      </span>
                    </div>

                    {/* 4 Indicators Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: livePatientEval.osaEval.criteria?.snoring?.positive ? '#FEE2E2' : '#F1F5F9', color: livePatientEval.osaEval.criteria?.snoring?.positive ? '#991B1B' : '#475569' }}>
                        1. Snoring: {livePatientEval.osaEval.criteria?.snoring?.positive ? 'Yes (Positive)' : 'No'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: livePatientEval.osaEval.criteria?.waist?.positive ? '#FEE2E2' : '#F1F5F9', color: livePatientEval.osaEval.criteria?.waist?.positive ? '#991B1B' : '#475569' }}>
                        2. {livePatientEval.osaEval.criteria?.waist?.label}: {livePatientEval.osaEval.criteria?.waist?.value ? `${livePatientEval.osaEval.criteria.waist.value}cm` : '--'} ({livePatientEval.osaEval.criteria?.waist?.positive ? 'Positive' : 'Normal'})
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: livePatientEval.osaEval.criteria?.neck?.positive ? '#FEE2E2' : '#F1F5F9', color: livePatientEval.osaEval.criteria?.neck?.positive ? '#991B1B' : '#475569' }}>
                        3. {livePatientEval.osaEval.criteria?.neck?.label}: {livePatientEval.osaEval.criteria?.neck?.value ? `${livePatientEval.osaEval.criteria.neck.value}cm` : '--'} ({livePatientEval.osaEval.criteria?.neck?.positive ? 'Positive' : 'Normal'})
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 6, background: livePatientEval.osaEval.criteria?.age?.positive ? '#FEE2E2' : '#F1F5F9', color: livePatientEval.osaEval.criteria?.age?.positive ? '#991B1B' : '#475569' }}>
                        4. {livePatientEval.osaEval.criteria?.age?.label}: {livePatientEval.osaEval.criteria?.age?.value ? `${livePatientEval.osaEval.criteria.age.value}y` : '--'} ({livePatientEval.osaEval.criteria?.age?.positive ? 'Positive' : 'Normal'})
                      </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                      Patient Display: <span style={{ color: livePatientEval.osaEval.isPositive ? '#92400E' : '#059669' }}>"{livePatientEval.osaEval.patientMessage}"</span>
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', fontStyle: 'italic' }}>
                      ℹ️ {livePatientEval.osaEval.studyFootnote}
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 4: Body Measurements & Vitals */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Body Measurements & Vitals</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'body' ? null : 'body')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'body' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'body' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'body' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'body' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'body' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'body' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Height (cm)</label>
                      <input 
                        type="number" 
                        value={editData.height_cm || ''} 
                        onChange={e => updateEditField('height_cm', parseFloat(e.target.value) || 0)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Weight (kg)</label>
                      <input 
                        type="number" 
                        value={editData.weight_kg || ''} 
                        onChange={e => updateEditField('weight_kg', parseFloat(e.target.value) || 0)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>BP Systolic (mmHg)</label>
                      <input 
                        type="number" 
                        value={editData.bp_systolic || ''} 
                        onChange={e => updateEditField('bp_systolic', parseInt(e.target.value) || null)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>BP Diastolic (mmHg)</label>
                      <input 
                        type="number" 
                        value={editData.bp_diastolic || ''} 
                        onChange={e => updateEditField('bp_diastolic', parseInt(e.target.value) || null)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Neck Circumference (cm)</label>
                      <input 
                        type="number" 
                        value={editData.neck_circumference_cm || ''} 
                        onChange={e => updateEditField('neck_circumference_cm', parseFloat(e.target.value) || null)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Waist Circumference (cm)</label>
                      <input 
                        type="number" 
                        value={editData.waist_circumference_cm || ''} 
                        onChange={e => updateEditField('waist_circumference_cm', parseFloat(e.target.value) || null)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>BMI (Indian Standard)</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: livePatientEval?.bmiCategory.color }}>
                        {livePatientEval?.bmi || '--'} kg/m² ({livePatientEval?.bmiCategory.label})
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Height & Weight</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.height_cm || 150} cm / {editData.weight_kg || 60} kg
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Blood Pressure</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: (editData.bp_systolic > 140 || editData.bp_diastolic > 90) ? '#B91C1C' : '#0F172A' }}>
                        {editData.bp_systolic ? `${editData.bp_systolic}/${editData.bp_diastolic} mmHg` : 'Not recorded'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Neck & Waist</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        Neck: {editData.neck_circumference_cm ? `${editData.neck_circumference_cm}cm` : '--'} • Waist: {editData.waist_circumference_cm ? `${editData.waist_circumference_cm}cm` : '--'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 5: Daytime Symptoms & Naps */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Daytime Symptoms & Naps</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'daytime' ? null : 'daytime')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'daytime' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'daytime' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'daytime' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'daytime' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'daytime' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'daytime' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'drowsy_during_day', label: 'Daytime sleepiness / drowsiness?' },
                      { key: 'tired_low_energy', label: 'Tiredness or low energy?' },
                      { key: 'affects_work_or_daily', label: 'Affects daily work / life?' },
                      { key: 'takes_naps', label: 'Takes daytime naps?' }
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, true)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: editData[item.key] ? '#043CA0' : '#E2E8F0', color: editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, false)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: !editData[item.key] ? '#043CA0' : '#E2E8F0', color: !editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                    {editData.takes_naps && (
                      <div style={{ marginTop: 4 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Nap Duration (minutes)</label>
                        <input 
                          type="number" 
                          value={editData.nap_duration_minutes ?? 0} 
                          onChange={e => updateEditField('nap_duration_minutes', parseInt(e.target.value) || 0)} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Daytime Drowsy</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.drowsy_during_day ? '#92400E' : '#0F172A' }}>
                        {editData.drowsy_during_day ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Tired / Low Energy</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.tired_low_energy ? '#92400E' : '#0F172A' }}>
                        {editData.tired_low_energy ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Work / Daily Impact</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.affects_work_or_daily ? '#92400E' : '#0F172A' }}>
                        {editData.affects_work_or_daily ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Naps</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.takes_naps ? `Yes (${editData.nap_duration_minutes || 0} mins)` : 'No'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 6: Driving & Safety (HIGHLIGHTED IN RED IF NEAR ACCIDENT OR ACCIDENT) */}
              <div 
                style={{ 
                  background: isLiveAccidentRisk ? '#FFF5F5' : '#FFFFFF', 
                  borderRadius: 16, 
                  padding: 16, 
                  border: isLiveAccidentRisk ? '2px solid #EF4444' : '1.5px solid #E2E8F0', 
                  boxShadow: isLiveAccidentRisk ? '0 4px 16px rgba(220, 38, 38, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: isLiveAccidentRisk ? '1px solid #FECACA' : '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Car size={18} color={isLiveAccidentRisk ? '#DC2626' : '#043CA0'} />
                    <span style={{ fontSize: 14, fontWeight: 800, color: isLiveAccidentRisk ? '#991B1B' : '#021744' }}>
                      Driving & Safety {isLiveAccidentRisk && '🏁 (CRASH RISK ALERT)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'driving' ? null : 'driving')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'driving' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'driving' ? '#FEF3C7' : (isLiveAccidentRisk ? '#FEE2E2' : 'rgba(4, 60, 160, 0.08)'),
                      color: editingSection === 'driving' ? '#92400E' : (isLiveAccidentRisk ? '#991B1B' : '#043CA0'), 
                      cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'driving' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'driving' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'driving' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Drives a motor vehicle?</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => updateEditField('drives_vehicle', true)} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: editData.drives_vehicle ? '#043CA0' : '#E2E8F0', color: editData.drives_vehicle ? '#FFF' : '#475569', cursor: 'pointer' }}>Yes</button>
                        <button type="button" onClick={() => updateEditField('drives_vehicle', false)} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: !editData.drives_vehicle ? '#043CA0' : '#E2E8F0', color: !editData.drives_vehicle ? '#FFF' : '#475569', cursor: 'pointer' }}>No</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Ever drowsy / sleepy while driving?</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={() => updateEditField('sleepy_while_driving', true)} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: editData.sleepy_while_driving ? '#043CA0' : '#E2E8F0', color: editData.sleepy_while_driving ? '#FFF' : '#475569', cursor: 'pointer' }}>Yes</button>
                        <button type="button" onClick={() => updateEditField('sleepy_while_driving', false)} style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: !editData.sleepy_while_driving ? '#043CA0' : '#E2E8F0', color: !editData.sleepy_while_driving ? '#FFF' : '#475569', cursor: 'pointer' }}>No</button>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Reported Incidents:</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['A near-accident', 'An accident', 'Neither of these'].map(inc => {
                          const isSel = (editData.sleepiness_incident_types || []).includes(inc);
                          return (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => toggleIncidentType(inc)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 800,
                                border: isSel ? '1px solid #DC2626' : '1px solid #CBD5E1',
                                background: isSel ? '#FEE2E2' : '#FFF',
                                color: isSel ? '#991B1B' : '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              {inc === 'An accident' || inc === 'A near-accident' ? `🏁 ${inc}` : inc}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: isLiveAccidentRisk ? '#FEF2F2' : '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Drives Vehicle</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.drives_vehicle ? 'Yes' : 'No'}</span>
                    </div>
                    <div style={{ background: isLiveAccidentRisk ? '#FEF2F2' : '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Sleepy While Driving</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: editData.sleepy_while_driving ? '#DC2626' : '#0F172A' }}>
                        {editData.sleepy_while_driving ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div style={{ gridColumn: 'span 2', background: isLiveAccidentRisk ? '#FEE2E2' : '#F8FAFC', padding: 10, borderRadius: 10, border: isLiveAccidentRisk ? '1px solid #FCA5A5' : 'none' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isLiveAccidentRisk ? '#991B1B' : '#64748B', display: 'block' }}>
                        Safety Incidents Reported
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isLiveAccidentRisk ? '#DC2626' : '#0F172A', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {isLiveAccidentRisk && '🏁'}
                        {editData.sleepiness_incident_types?.length ? editData.sleepiness_incident_types.join(', ') : 'No incidents reported'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 7: Leg Sensations / RLS (4 IRLSSG Criteria) */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🦵</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>
                      Restless Legs Syndrome (RLS)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'legs' ? null : 'legs')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'legs' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'legs' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'legs' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'legs' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'legs' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'legs' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { key: 'legs_uncomfortable_resting', label: '1. Urge to move legs or uncomfortable sensation?' },
                      { key: 'legs_no_other_reason', label: '2. Sensation increases on lying down or resting?' },
                      { key: 'legs_moving_helps', label: '3. Better till the time you stretch or walk?' },
                      { key: 'legs_worse_evening', label: '4. Sensation gets worse in evening or night?' }
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '6px 10px', borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, true)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: editData[item.key] ? '#043CA0' : '#E2E8F0', color: editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEditField(item.key, false)}
                            style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800, border: 'none', background: !editData[item.key] ? '#043CA0' : '#E2E8F0', color: !editData[item.key] ? '#FFF' : '#475569', cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>1. Uncomfortable Urge</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.legs_uncomfortable_resting ? 'Yes' : 'No'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>2. Increases on Rest</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.legs_no_other_reason ? 'Yes' : 'No'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>3. Stretch/Walk Helps</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.legs_moving_helps ? 'Yes' : 'No'}</span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>4. Worse Evening/Night</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.legs_worse_evening ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD 8: Medical Conditions & Lifestyle */}
              <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <HeartPulse size={18} color="#043CA0" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Medical Conditions & Lifestyle</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingSection(editingSection === 'lifestyle' ? null : 'lifestyle')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                      border: editingSection === 'lifestyle' ? '1px solid #F59E0B' : 'none',
                      background: editingSection === 'lifestyle' ? '#FEF3C7' : 'rgba(4, 60, 160, 0.08)',
                      color: editingSection === 'lifestyle' ? '#92400E' : '#043CA0', cursor: 'pointer'
                    }}
                  >
                    {editingSection === 'lifestyle' ? <X size={13} /> : <Pencil size={13} />}
                    <span>{editingSection === 'lifestyle' ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                {editingSection === 'lifestyle' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', display: 'block', marginBottom: 4 }}>Diagnosed Conditions</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['Heart disease', 'Hypertension', 'Diabetes', 'Asthma or COPD', 'Stroke', 'Thyroid disorder', 'Depression or anxiety'].map(cond => {
                          const isSel = (editData.diagnosed_conditions || []).includes(cond);
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => toggleDiagnosedCondition(cond)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                border: isSel ? '1px solid #043CA0' : '1px solid #CBD5E1',
                                background: isSel ? '#EFF6FF' : '#FFF',
                                color: isSel ? '#043CA0' : '#475569',
                                cursor: 'pointer'
                              }}
                            >
                              {cond}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Cigarettes / Beedis Per Day</label>
                        <input 
                          type="number" 
                          min={0}
                          value={editData.cigarettes_per_day ?? 0} 
                          onChange={e => updateEditField('cigarettes_per_day', Math.max(0, parseInt(e.target.value) || 0))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Caffeine Drinks / Day</label>
                        <input 
                          type="number" 
                          min={0}
                          value={editData.caffeinated_drinks_per_day ?? 0} 
                          onChange={e => updateEditField('caffeinated_drinks_per_day', Math.max(0, parseInt(e.target.value) || 0))} 
                          style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Alcohol Intake Frequency</label>
                      <select 
                        value={editData.alcohol_frequency || ''} 
                        onChange={e => updateEditField('alcohol_frequency', e.target.value)} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3, background: '#FFF' }}
                      >
                        <option value="">None / Not specified</option>
                        <option value="Never / Do not drink">Never / Do not drink</option>
                        <option value="Occasionally (1-2 drinks/month)">Occasionally (1-2 drinks/month)</option>
                        <option value="1-2 drinks per week">1-2 drinks per week</option>
                        <option value="3-5 drinks per week">3-5 drinks per week</option>
                        <option value="Daily / 6+ drinks per week">Daily / 6+ drinks per week</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Conditions</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.diagnosed_conditions?.length ? editData.diagnosed_conditions.join(', ') : 'None'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Smoking</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.cigarettes_per_day ?? 0} cigarettes/day
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Alcohol</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.alcohol_frequency || 'None'}
                      </span>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Caffeine</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {editData.caffeinated_drinks_per_day ?? 0} drinks/day
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
