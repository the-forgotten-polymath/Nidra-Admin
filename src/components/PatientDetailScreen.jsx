import React from 'react';
import { 
  ArrowLeft, User, Phone, Calendar, Hash, ChevronRight,
  Moon, Sparkles, HeartPulse, ShieldAlert, CheckCircle2,
  Clock, Activity, AlertCircle, FileText
} from 'lucide-react';
import { evaluateTestPathAndSafety } from '../utils/clinicalRules';

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

export default function PatientDetailScreen({ patient, onBack }) {
  if (!patient) return null;

  // Evaluate clinical rules dynamically for this patient
  const evaluation = evaluateTestPathAndSafety(patient);
  const isAccidentRisk = evaluation.accidentHistory;

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', paddingBottom: 80 }}>
      {/* =========================================================================
          TOP STICKY HEADER & BREADCRUMBS
          ========================================================================= */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div style={{
          maxWidth: 1360,
          margin: '0 auto',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* Back button and breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '7px 14px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >
              <ArrowLeft size={15} />
              <span>Back to Patients List</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', fontWeight: 500 }}>
              <span>Dashboard</span>
              <ChevronRight size={13} color="#94A3B8" />
              <span>Patients</span>
              <ChevronRight size={13} color="#94A3B8" />
              <span style={{ color: '#0F172A', fontWeight: 700 }}>{patient.patient_name || 'Patient Dossier'}</span>
            </div>
          </div>

          {/* Clinical Status Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Diagnostic Recommendation:</span>
            <span style={{ 
              fontSize: 12, 
              fontWeight: 800, 
              background: evaluation.testPath.includes('Specialist') ? '#FEF2F2' : '#F0FDFA', 
              color: evaluation.testPath.includes('Specialist') ? '#991B1B' : '#0F766E', 
              border: `1px solid ${evaluation.testPath.includes('Specialist') ? '#FECACA' : '#CCFBF1'}`,
              padding: '4px 12px', 
              borderRadius: 8 
            }}>
              {evaluation.testPath}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: '0 auto', padding: '24px 32px' }}>

        {/* =========================================================================
            HIERARCHY LEVEL 1: PATIENT IDENTITY HERO PROFILE CARD
            ========================================================================= */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          padding: '24px 28px',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            {/* Avatar & Patient Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #0F766E 0%, #043CA0 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 0.5,
                boxShadow: '0 2px 8px rgba(15, 118, 110, 0.2)',
                flexShrink: 0
              }}>
                {getInitials(patient.patient_name)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                    {patient.patient_name || 'Anonymous Patient'}
                  </h1>

                  {isAccidentRisk && (
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4, 
                      background: '#FEF2F2', 
                      color: '#DC2626', 
                      border: '1px solid #FECACA',
                      fontSize: 11, 
                      fontWeight: 800, 
                      padding: '2px 8px', 
                      borderRadius: 6 
                    }}>
                      🏁 CRASH RISK ALERT
                    </span>
                  )}

                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>
                    ID: {patient.id ? String(patient.id).slice(0, 8) : 'NEW'}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500, marginTop: 4 }}>
                  {patient.age || '--'} Years Old • {patient.sex ? (patient.sex.toLowerCase().startsWith('m') ? 'Male' : patient.sex.toLowerCase().startsWith('f') ? 'Female' : patient.sex) : 'Gender Unspecified'} • Centre {patient.centre_code || '010101'}
                </div>
              </div>
            </div>

            {/* Indian BMI & Quick Vitals Summary Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Indian BMI
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: evaluation.bmiCategory.color }}>
                  {evaluation.bmi ? `${evaluation.bmi} kg/m²` : '--'} ({evaluation.bmiCategory.label})
                </span>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: 10, textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Comorbidities
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {evaluation.comorbidityLabel || 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Row: Contact, Date of filling form, Clinic code */}
          <div style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid #F1F5F9',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            fontSize: 13,
            color: '#334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={15} color="#0F766E" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>Contact / Mobile</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{patient.mobile_number || 'Not provided'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={15} color="#0F766E" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>Date of Assessment</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{formatIntakeDate(patient.created_at)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hash size={15} color="#0F766E" />
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'block' }}>Centre Code</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{patient.centre_code || '010101'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            HIERARCHY LEVEL 2: MOTOR VEHICLE CRASH RISK ALERT (IF APPLICABLE)
            ========================================================================= */}
        {isAccidentRisk && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 14,
            padding: '16px 20px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28, lineHeight: 1 }}>🏁</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#991B1B' }}>
                  CRITICAL MOTOR VEHICLE SAFETY RISK (NEAR-MISS / COLLISION REPORTED)
                </div>
                <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2, fontWeight: 500 }}>
                  Patient reported: <strong>{patient.sleepiness_incident_types?.length ? patient.sleepiness_incident_types.join(', ') : 'Near-miss or collision while driving'}</strong> due to daytime drowsiness.
                  Clinical mandate: <strong>Level 3 HSAT + Urgently Refer to Sleep Specialist</strong>.
                </div>
              </div>
            </div>
            <span style={{ 
              background: '#DC2626', 
              color: '#FFFFFF', 
              fontSize: 11, 
              fontWeight: 800, 
              padding: '6px 12px', 
              borderRadius: 6,
              whiteSpace: 'nowrap'
            }}>
              Urgent Referral
            </span>
          </div>
        )}

        {/* =========================================================================
            HIERARCHY LEVEL 3: PRIMARY CLINICAL TRIAGE & RISK MATRIX
            ========================================================================= */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Primary Diagnostic Evaluation
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>

            {/* OSA Card */}
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${evaluation.osaEval.totalPositive >= 3 ? '#FECACA' : (evaluation.osaEval.totalPositive === 2 ? '#FDE68A' : '#E2E8F0')}`,
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sleep Apnea (OSA)
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: evaluation.osaEval.totalPositive >= 3 ? '#FEE2E2' : (evaluation.osaEval.totalPositive === 2 ? '#FEF3C7' : '#F1F5F9'),
                  color: evaluation.osaEval.totalPositive >= 3 ? '#991B1B' : (evaluation.osaEval.totalPositive === 2 ? '#92400E' : '#475569'),
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {evaluation.osaEval.scoreRatio} ({evaluation.osaEval.probabilityPercent ? `${evaluation.osaEval.probabilityPercent}%` : 'Low'})
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: evaluation.osaEval.totalPositive >= 3 ? '#991B1B' : (evaluation.osaEval.totalPositive === 2 ? '#92400E' : '#0F172A'), marginBottom: 4 }}>
                {evaluation.osaEval.dashboardMessage}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Patient: "{evaluation.osaEval.patientMessage}"
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>
                {evaluation.osaEval.studyFootnote}
              </div>
            </div>

            {/* RLS Card */}
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${evaluation.rlsEval.isPositive ? '#BFDBFE' : '#E2E8F0'}`,
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Restless Legs (RLS)
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: evaluation.rlsEval.isPositive ? '#EFF6FF' : '#F1F5F9',
                  color: evaluation.rlsEval.isPositive ? '#1E40AF' : '#475569',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {evaluation.rlsEval.isPositive ? 'High likely (4/4)' : 'Unlikely'}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: evaluation.rlsEval.isPositive ? '#1E40AF' : '#0F172A', marginBottom: 4 }}>
                {evaluation.rlsEval.isPositive ? 'High likely' : 'No RLS Symptoms'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>
                Modified Indian criteria evaluated
              </div>
            </div>

            {/* Insomnia Card */}
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${evaluation.insomniaEval.isPositive ? '#FDE68A' : '#E2E8F0'}`,
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Insomnia Screener
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: evaluation.insomniaEval.isPositive ? '#FEF3C7' : '#F1F5F9',
                  color: evaluation.insomniaEval.isPositive ? '#92400E' : '#475569',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {evaluation.insomniaEval.isPositive ? 'Possible' : 'Normal'}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: evaluation.insomniaEval.isPositive ? '#92400E' : '#0F172A', marginBottom: 4 }}>
                {evaluation.insomniaEval.isPositive ? 'Possible Chronic Insomnia' : 'Normal Sleep Initiation'}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>
                Onset latency: {patient.time_to_fall_asleep_minutes || 0}m • Awakenings: {patient.nocturnal_awakenings_count || 0}/night
              </div>
            </div>

            {/* Test Path Card */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommended Protocol
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: evaluation.testPath.includes('Specialist') ? '#FEF2F2' : '#F0FDFA',
                  color: evaluation.testPath.includes('Specialist') ? '#991B1B' : '#0F766E',
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {evaluation.testPath.includes('Specialist') ? 'Urgent' : 'Standard'}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                {evaluation.testPath}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>
                {evaluation.clinicalSummary}
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            HIERARCHY LEVEL 4: STRUCTURED INTAKE DATA GROUPS (STRICTLY READ-ONLY)
            ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* SECTION I: SLEEP PATTERNS & BREATHING (OSA) */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Moon size={16} color="#0F766E" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Sleep Patterns & Breathing Symptoms (OSA)
                </h3>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                  Nocturnal latency, awakenings, sleep complaints, and airway obstruction symptoms
                </span>
              </div>
            </div>

            {/* Metrics Sub-grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Time to Fall Asleep</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: patient.time_to_fall_asleep_minutes >= 30 ? '#DC2626' : '#0F172A' }}>
                  {patient.time_to_fall_asleep_minutes || 0} minutes {patient.time_to_fall_asleep_minutes >= 30 ? '(≥30m Criteria)' : ''}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Night Awakenings</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: patient.nocturnal_awakenings_count >= 2 ? '#DC2626' : '#0F172A' }}>
                  {patient.nocturnal_awakenings_count || 0} times / night {patient.nocturnal_awakenings_count >= 2 ? '(≥2 Criteria)' : ''}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Total Sleep Duration</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.sleep_duration_hours || 0} hours / night
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Trouble Frequency & Duration</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.sleep_complaint_nights_per_week || 0} nights/wk • {patient.problem_duration_years || 0}y {patient.problem_duration_months || 0}m
                </span>
              </div>
            </div>

            {/* Snoring & Apnea Checklist Grid */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Snores when sleeping</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.snores_when_sleeping ? '#FEE2E2' : '#F1F5F9', color: patient.snores_when_sleeping ? '#991B1B' : '#64748B' }}>
                  {patient.snores_when_sleeping ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Loud other-room snoring</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.snoring_loud_other_room ? '#FEE2E2' : '#F1F5F9', color: patient.snoring_loud_other_room ? '#991B1B' : '#64748B' }}>
                  {patient.snoring_loud_other_room ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Observed pauses in breathing</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.stop_breathing_noticed ? '#FEE2E2' : '#F1F5F9', color: patient.stop_breathing_noticed ? '#991B1B' : '#64748B' }}>
                  {patient.stop_breathing_noticed ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Wakes up choking or gasping</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.wakes_choking_gasping ? '#FEE2E2' : '#F1F5F9', color: patient.wakes_choking_gasping ? '#991B1B' : '#64748B' }}>
                  {patient.wakes_choking_gasping ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* OSA 4-Criteria Breakdown Box */}
            <div style={{
              marginTop: 14,
              padding: '14px 18px',
              borderRadius: 12,
              background: '#F8FAFC',
              border: `1px solid ${evaluation.osaEval.totalPositive >= 3 ? '#FECACA' : (evaluation.osaEval.totalPositive === 2 ? '#FDE68A' : '#E2E8F0')}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                  OSA 4-Criteria Diagnostic Breakdown ({evaluation.osaEval.scoreRatio} Positive)
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  background: evaluation.osaEval.totalPositive >= 3 ? '#FEE2E2' : (evaluation.osaEval.totalPositive === 2 ? '#FEF3C7' : '#F1F5F9'),
                  color: evaluation.osaEval.totalPositive >= 3 ? '#991B1B' : (evaluation.osaEval.totalPositive === 2 ? '#92400E' : '#475569'),
                  padding: '2px 8px',
                  borderRadius: 6
                }}>
                  {evaluation.osaEval.dashboardMessage}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7, background: evaluation.osaEval.criteria?.snoring?.positive ? '#FEE2E2' : '#FFFFFF', border: '1px solid #E2E8F0', color: evaluation.osaEval.criteria?.snoring?.positive ? '#991B1B' : '#475569' }}>
                  1. Snoring: {evaluation.osaEval.criteria?.snoring?.positive ? 'Yes (Positive)' : 'No'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7, background: evaluation.osaEval.criteria?.waist?.positive ? '#FEE2E2' : '#FFFFFF', border: '1px solid #E2E8F0', color: evaluation.osaEval.criteria?.waist?.positive ? '#991B1B' : '#475569' }}>
                  2. {evaluation.osaEval.criteria?.waist?.label}: {evaluation.osaEval.criteria?.waist?.value ? `${evaluation.osaEval.criteria.waist.value}cm` : '--'} ({evaluation.osaEval.criteria?.waist?.positive ? 'Positive' : 'Normal'})
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7, background: evaluation.osaEval.criteria?.neck?.positive ? '#FEE2E2' : '#FFFFFF', border: '1px solid #E2E8F0', color: evaluation.osaEval.criteria?.neck?.positive ? '#991B1B' : '#475569' }}>
                  3. {evaluation.osaEval.criteria?.neck?.label}: {evaluation.osaEval.criteria?.neck?.value ? `${evaluation.osaEval.criteria.neck.value}cm` : '--'} ({evaluation.osaEval.criteria?.neck?.positive ? 'Positive' : 'Normal'})
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 7, background: evaluation.osaEval.criteria?.age?.positive ? '#FEE2E2' : '#FFFFFF', border: '1px solid #E2E8F0', color: evaluation.osaEval.criteria?.age?.positive ? '#991B1B' : '#475569' }}>
                  4. {evaluation.osaEval.criteria?.age?.label}: {evaluation.osaEval.criteria?.age?.value ? `${evaluation.osaEval.criteria.age.value}y` : '--'} ({evaluation.osaEval.criteria?.age?.positive ? 'Positive' : 'Normal'})
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 500, color: '#64748B', marginTop: 10 }}>
                {evaluation.osaEval.studyFootnote}
              </div>
            </div>
          </div>

          {/* SECTION II: DAYTIME FUNCTION & MOTOR SAFETY */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#0F766E" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Daytime Symptoms & Driving Safety
                </h3>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                  Drowsiness, fatigue, daytime naps, work impairment, and motor vehicle driving history
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Drowsy during the day</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.drowsy_during_day ? '#FEF3C7' : '#F1F5F9', color: patient.drowsy_during_day ? '#92400E' : '#64748B' }}>
                  {patient.drowsy_during_day ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Tiredness or low energy</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.tired_low_energy ? '#FEF3C7' : '#F1F5F9', color: patient.tired_low_energy ? '#92400E' : '#64748B' }}>
                  {patient.tired_low_energy ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Affects daily work / life</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.affects_work_or_daily ? '#FEF3C7' : '#F1F5F9', color: patient.affects_work_or_daily ? '#92400E' : '#64748B' }}>
                  {patient.affects_work_or_daily ? 'Yes' : 'No'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>Takes daytime naps</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: patient.takes_naps ? '#EFF6FF' : '#F1F5F9', color: patient.takes_naps ? '#1E40AF' : '#64748B' }}>
                  {patient.takes_naps ? `Yes (${patient.nap_duration_minutes || 0} mins)` : 'No'}
                </span>
              </div>
            </div>

            {/* Driving Safety Block */}
            <div style={{
              marginTop: 14,
              padding: '14px 18px',
              borderRadius: 12,
              background: isAccidentRisk ? '#FFF5F5' : '#F8FAFC',
              border: `1px solid ${isAccidentRisk ? '#FECACA' : '#E2E8F0'}`
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Drives Motor Vehicle</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                    {patient.drives_vehicle ? 'Yes' : 'No'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Sleepy While Driving</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: patient.sleepy_while_driving ? '#DC2626' : '#0F172A' }}>
                    {patient.sleepy_while_driving ? 'Yes (Reported Drowsy Driving)' : 'No'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: isAccidentRisk ? '#991B1B' : '#64748B', display: 'block' }}>
                    Reported Incidents
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: isAccidentRisk ? '#DC2626' : '#0F172A', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                    {isAccidentRisk && '🏁'}
                    {patient.sleepiness_incident_types?.length ? patient.sleepiness_incident_types.join(', ') : 'None reported'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION III: RESTLESS LEGS SYNDROME (MODIFIED INDIAN CRITERIA) */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                🦵
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Restless Legs Syndrome (Modified Indian Diagnostic Criteria)
                </h3>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                  All 4 positive indicates high likely RLS (Modified Indian criteria)
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                  1. Do you feel an urge to move your legs or an uncomfortable sensation in them?
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: patient.legs_uncomfortable_resting ? '#EFF6FF' : '#F1F5F9', color: patient.legs_uncomfortable_resting ? '#1E40AF' : '#64748B' }}>
                  {patient.legs_uncomfortable_resting ? '✓ Positive (Yes)' : '✗ Negative (No)'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                  2. Does this sensation increase on lying down or resting?
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: patient.legs_no_other_reason ? '#EFF6FF' : '#F1F5F9', color: patient.legs_no_other_reason ? '#1E40AF' : '#64748B' }}>
                  {patient.legs_no_other_reason ? '✓ Positive (Yes)' : '✗ Negative (No)'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                  3. Does it get better till the time you stretch or walk?
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: patient.legs_moving_helps ? '#EFF6FF' : '#F1F5F9', color: patient.legs_moving_helps ? '#1E40AF' : '#64748B' }}>
                  {patient.legs_moving_helps ? '✓ Positive (Yes)' : '✗ Negative (No)'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                  4. Does this sensation get worse in evening or night?
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: patient.legs_worse_evening ? '#EFF6FF' : '#F1F5F9', color: patient.legs_worse_evening ? '#1E40AF' : '#64748B' }}>
                  {patient.legs_worse_evening ? '✓ Positive (Yes)' : '✗ Negative (No)'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION IV: PHYSICAL VITALS, COMORBIDITIES & LIFESTYLE */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E2E8F0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #F1F5F9', marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={16} color="#0F766E" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Physical Vitals, Medical History & Lifestyle
                </h3>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                  Blood pressure, anthropometric metrics, medical comorbidities, and daily habits
                </span>
              </div>
            </div>

            {/* Vitals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Height & Weight</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.height_cm || 150} cm / {patient.weight_kg || 60} kg
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Blood Pressure</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: (patient.bp_systolic > 140 || patient.bp_diastolic > 90) ? '#DC2626' : '#0F172A' }}>
                  {patient.bp_systolic ? `${patient.bp_systolic}/${patient.bp_diastolic} mmHg` : 'Not recorded'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Neck Circumference</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.neck_circumference_cm ? `${patient.neck_circumference_cm} cm` : 'Not recorded'}
                </span>
              </div>

              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block' }}>Waist Circumference</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {patient.waist_circumference_cm ? `${patient.waist_circumference_cm} cm` : 'Not recorded'}
                </span>
              </div>
            </div>

            {/* Diagnosed Conditions & Lifestyle Habits Grid */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 8 }}>
                  Diagnosed Medical Conditions
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {patient.diagnosed_conditions && patient.diagnosed_conditions.length > 0 ? (
                    patient.diagnosed_conditions.map(c => (
                      <span key={c} style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#0F172A', padding: '2px 8px', borderRadius: 6 }}>
                        {c}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>None reported</span>
                  )}
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 8 }}>
                  Lifestyle & Substance Intake
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#334155' }}>
                  <div>🚬 Cigarettes / Bidis: <strong style={{ color: '#0F172A' }}>{patient.cigarettes_per_day ?? 0} per day</strong></div>
                  <div>🍷 Alcohol Frequency: <strong style={{ color: '#0F172A' }}>{patient.alcohol_frequency || 'None / Not specified'}</strong></div>
                  <div>☕ Caffeinated Drinks: <strong style={{ color: '#0F172A' }}>{patient.caffeinated_drinks_per_day ?? 0} drinks/day</strong></div>
                  <div>📱 Bedtime Screens: <strong style={{ color: '#0F172A' }}>{patient.screen_time_before_bed || 'Not specified'}</strong></div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
