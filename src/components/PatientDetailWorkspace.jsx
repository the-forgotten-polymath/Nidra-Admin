import React from 'react';
import { 
  User, Bed, Wind, Activity, Sparkles, Car, HeartPulse,
  Pencil, X, Save, CheckCircle, Phone, Calendar, Hash,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

function formatIntakeDate(timestamp) {
  if (!timestamp) return 'Today';
  try {
    const d = new Date(timestamp);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return String(timestamp);
  }
}

function getInitials(name) {
  if (!name) return 'PT';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PatientDetailWorkspace({
  editData,
  updateEditField,
  editingSection,
  setEditingSection,
  toggleDiagnosedCondition,
  toggleIncidentType,
  livePatientEval,
  isLiveAccidentRisk,
  handleSaveAssessment,
  saveStatus,
  onClose
}) {
  if (!editData) return null;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
      borderTop: '2px solid #0F766E',
      padding: '24px 28px',
      boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.03)'
    }}>

      {/* MOTOR VEHICLE SAFETY ALERT BANNER (Chequered flag safety alert) */}
      {isLiveAccidentRisk && (
        <div style={{
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
          border: '1.5px solid #F87171',
          borderRadius: 14,
          padding: '16px 20px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '0 4px 14px rgba(220, 38, 38, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>🏁</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                CRITICAL MOTOR VEHICLE SAFETY ALERT (NEAR-MISS / ACCIDENT REPORTED)
              </div>
              <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 4, fontWeight: 600 }}>
                Patient reported: <strong>{editData.sleepiness_incident_types?.length ? editData.sleepiness_incident_types.join(', ') : 'Near-miss or collision while driving'}</strong> due to daytime drowsiness/fatigue.
                Immediate clinical action: <strong>HSAT + Urgently Meet Sleep Specialist</strong>.
              </div>
            </div>
          </div>
          <span style={{ 
            background: '#DC2626', 
            color: '#FFFFFF', 
            fontSize: 11, 
            fontWeight: 900, 
            padding: '7px 12px', 
            borderRadius: 8,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
          }}>
            🏁 Urgent Clinical Action
          </span>
        </div>
      )}

      {/* PROFILE ROW: Name, Contact, Date of Filling Form, Demographics & Action Controls */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Left: Avatar + Full Profile Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0F766E 0%, #043CA0 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: 0.5,
            boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
            flexShrink: 0
          }}>
            {getInitials(editData.patient_name)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                {editData.patient_name || 'Anonymous Patient'}
              </h2>
              {isLiveAccidentRisk && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  background: '#DC2626', 
                  color: '#FFF', 
                  fontSize: 11, 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: 6 
                }}>
                  🏁 Crash Alert
                </span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>
                ID: {editData.id ? String(editData.id).slice(0, 8) : 'NEW'}
              </span>
            </div>

            {/* Profile Row Metadata: Contact, Date of filling form, Age & Sex, Centre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap', fontSize: 12, color: '#475569', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Phone size={13} color="#0F766E" />
                <strong>Contact:</strong> {editData.mobile_number || 'Not provided'}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} color="#0F766E" />
                <strong>Date of filling form:</strong> {formatIntakeDate(editData.created_at)}
              </span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <User size={13} color="#0F766E" />
                <strong>Demographics:</strong> {editData.age || '--'} yrs • {editData.sex || '--'}
              </span>
              {editData.centre_code && (
                <>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Hash size={13} color="#0F766E" />
                    <strong>Centre:</strong> {editData.centre_code}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions + Prominent Collapse (X) Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveStatus === 'saved' && (
            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle size={15} /> Saved!
            </span>
          )}
          {saveStatus === 'error' && (
            <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 800 }}>
              Error saving
            </span>
          )}

          <button 
            type="button"
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
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(4, 60, 160, 0.2)'
            }}
          >
            <Save size={14} />
            <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Assessment'}</span>
          </button>

          {/* Prominent Collapse (X) Button */}
          <button 
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              padding: '8px 14px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: 12,
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
            title="Collapse profile details (X)"
          >
            <X size={15} color="#475569" />
            <span>Close (X)</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Triage Overview Bar */}
      <div style={{ 
        background: '#FFFFFF', 
        borderRadius: 14, 
        padding: '14px 18px', 
        border: '1px solid #E2E8F0', 
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
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

      {/* 8 COMPREHENSIVE CARDS (All Sections of Form Filled by Patient) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 16 }}>

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

        {/* CARD 2: Sleep Schedule & Insomnia Indicators */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: 16, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 12, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bed size={18} color="#043CA0" />
              <span style={{ fontSize: 14, fontWeight: 800, color: '#021744' }}>Sleep Schedule & Insomnia</span>
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
                    value={editData.time_to_fall_asleep_minutes || ''} 
                    onChange={e => updateEditField('time_to_fall_asleep_minutes', parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Night Awakenings</label>
                  <input 
                    type="number" 
                    value={editData.nocturnal_awakenings_count || ''} 
                    onChange={e => updateEditField('nocturnal_awakenings_count', parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Sleep Duration (hrs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={editData.sleep_duration_hours || ''} 
                    onChange={e => updateEditField('sleep_duration_hours', parseFloat(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Complaint Nights/wk</label>
                  <input 
                    type="number" 
                    max={7}
                    min={0}
                    value={editData.sleep_complaint_nights_per_week ?? ''} 
                    onChange={e => updateEditField('sleep_complaint_nights_per_week', parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Problem Years</label>
                  <input 
                    type="number" 
                    value={editData.problem_duration_years ?? ''} 
                    onChange={e => updateEditField('problem_duration_years', parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>Problem Months</label>
                  <input 
                    type="number" 
                    value={editData.problem_duration_months ?? ''} 
                    onChange={e => updateEditField('problem_duration_months', parseInt(e.target.value) || 0)} 
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700, marginTop: 3 }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Latency (Fall asleep)</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: editData.time_to_fall_asleep_minutes >= 30 ? '#B91C1C' : '#0F172A' }}>
                  {editData.time_to_fall_asleep_minutes || 0} mins
                </span>
              </div>
              <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Awakenings</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: editData.nocturnal_awakenings_count >= 2 ? '#B91C1C' : '#0F172A' }}>
                  {editData.nocturnal_awakenings_count || 0} times/night
                </span>
              </div>
              <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Sleep Duration</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{editData.sleep_duration_hours || 0} hrs</span>
              </div>
              <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Frequency & Duration</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                  {editData.sleep_complaint_nights_per_week || 0} nights/wk • {editData.problem_duration_years || 0}y {editData.problem_duration_months || 0}m
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
  );
}
