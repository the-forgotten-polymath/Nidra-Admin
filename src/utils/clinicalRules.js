/**
 * Nidra Clinical Decision & Diagnostic Rules Engine
 * 
 * Defined Diagnostic & Triage Rules:
 * 1. Restless Legs Syndrome (RLS):
 *    - All leg sensation questions positive => RLS Positive ("Possible" status)
 * 
 * 2. Insomnia:
 *    - Time to fall asleep >= 30 min AND frequent nocturnal awakenings >= 2 AND frequency > 3 nights/week => INSOMNIA ("Possible" status)
 * 
 * 3. Obstructive Sleep Apnea (OSA):
 *    - 2 positive symptoms (excluding snoring) => "Probable OSA" (2/4)
 *    - 3 positive symptoms (excluding snoring) => "Likely OSA" (3/4)
 *    - All 4 positive symptoms (including snoring) => "Highly +ve to OSA" (4/4)
 * 
 * 4. Normal / No Sleep Abnormalities:
 *    - If no OSA, Insomnia, or RLS => "Sleep Hygiene Recommendations"
 *    - Message: "Right now you don't have any sleep abnormalities, but we encourage you to maintain healthy sleep hygiene routines."
 * 
 * 5. Test Path Decision Rules:
 *    - Only RLS => "Blood Investigation"
 *    - Only Insomnia => "CBT-i"
 *    - Insomnia + RLS => "Blood Investigation & Sleep Instructions"
 *    - COMISA (Insomnia + OSA) => "Level 1 PSG + Sleep Specialist"
 *    - Only OSA (without heart disease/COPD/asthma/stroke) => "HSAT" (Home Sleep Testing)
 *    - OSA + Comorbidities (Heart Disease / Asthma / COPD / Stroke) => "Level 1 PSG in hospital" (No HSAT)
 * 
 * 6. Safety & Driving Risk:
 *    - Driving near-miss or accident history => Safety Alert with Checkered Flag (🏁) / Crash icon
 */

export function evaluateRLS(data = {}) {
  // 1) Do you feel an urge to move your legs or an uncomfortable sensation in them?
  const q1 = Boolean(data.legs_uncomfortable_resting ?? data.legsUncomfortableResting ?? data.uncomfortable_leg_sensations);
  // 2) Does this sensation increase on lying down or resting?
  const q2 = Boolean(data.legs_no_other_reason ?? data.legsNoOtherReason ?? data.rest_worsens_legs ?? data.legs_rest_worsens ?? data.legsRestWorsens);
  // 3) Does it get better till the time you stretch or walk?
  const q3 = Boolean(data.legs_moving_helps ?? data.legsMovingHelps ?? data.movement_relieves_legs);
  // 4) Does this sensation get worse in evening or night?
  const q4 = Boolean(data.legs_worse_evening ?? data.legsWorseEvening ?? data.worse_evening_or_night);

  // If all 4 positive -> RLS High likely (Modified Indian criteria)
  const isRLS = q1 && q2 && q3 && q4;

  return {
    isPositive: isRLS,
    status: isRLS ? 'High likely' : '—',
    label: isRLS ? 'High likely RLS' : 'None'
  };
}

export function evaluateInsomnia(data = {}) {
  const fallAsleepMin = Number(data.time_to_fall_asleep_minutes ?? data.timeToFallAsleepMinutes) || 0;
  const awakenings = Number(data.nocturnal_awakenings_count ?? data.nocturnalAwakeningsCount) || 0;
  const nightsPerWeek = Number(
    data.sleep_complaint_nights_per_week ?? 
    data.trouble_sleeping_nights_per_week ?? 
    data.sleepComplaintNightsPerWeek
  ) || 0;

  // Criteria: Sleep onset latency >= 30 min OR Nocturnal awakenings >= 2 times/night AND Frequency >= 3 nights/week
  const isInsomnia = (fallAsleepMin >= 30 || awakenings >= 2) && nightsPerWeek >= 3;

  return {
    isPositive: isInsomnia,
    status: isInsomnia ? 'Possible' : '—',
    label: isInsomnia ? 'Possible Insomnia' : 'None'
  };
}

export function calculatePatientBMI(data = {}) {
  if (data.calculated_bmi !== undefined && data.calculated_bmi !== null && Number(data.calculated_bmi) > 0) {
    return Number(Number(data.calculated_bmi).toFixed(1));
  }
  if (data.bmi !== undefined && data.bmi !== null && Number(data.bmi) > 0) {
    return Number(Number(data.bmi).toFixed(1));
  }
  const heightCm = Number(data.height_cm ?? data.heightCm) || 0;
  const weightKg = (Number(data.weight_kg ?? data.weightKg) || 0) + ((Number(data.weight_gm ?? data.weightGm) || 0) / 1000);
  if (heightCm > 0 && weightKg > 0) {
    const heightM = heightCm / 100.0;
    return Number((weightKg / (heightM * heightM)).toFixed(1));
  }
  return null;
}

export function getBMICategory(bmi) {
  if (bmi === null || bmi === undefined || Number(bmi) <= 0) {
    return {
      label: '—',
      category: 'Unknown',
      color: '#64748B',
      bg: '#F1F5F9'
    };
  }
  const val = Number(bmi);
  if (val < 18.5) {
    return {
      label: 'Underweight',
      category: 'Underweight',
      color: '#1D4ED8',
      bg: '#EFF6FF'
    };
  }
  if (val <= 22.9) {
    return {
      label: 'Normal',
      category: 'Normal',
      color: '#047857',
      bg: '#ECFDF5'
    };
  }
  if (val <= 24.9) {
    return {
      label: 'Overweight',
      category: 'Overweight',
      color: '#B45309',
      bg: '#FFFBEB'
    };
  }
  return {
    label: 'Obese',
    category: 'Obese',
    color: '#B91C1C',
    bg: '#FEF2F2'
  };
}

export function evaluateOSA(data = {}) {
  // 1. Snoring: yes / no
  const snores = Boolean(data.snores_when_sleeping ?? data.snoresWhenSleeping);

  // Biological sex check for gender-stratified cutoffs
  const sex = String(data.sex ?? '').trim().toLowerCase();
  const isFemale = sex === 'female' || sex === 'f';

  // 2. Waist circumference: >= 85 cm for females, >= 93 cm for males
  const waist = Number(data.waist_circumference_cm ?? data.waistCircumferenceCm) || 0;
  const waistThreshold = isFemale ? 85 : 93;
  const waistPositive = waist > 0 && waist >= waistThreshold;

  // 3. Neck circumference: >= 32 cm for females, >= 37 cm for males
  const neck = Number(data.neck_circumference_cm ?? data.neckCircumferenceCm) || 0;
  const neckThreshold = isFemale ? 32 : 37;
  const neckPositive = neck > 0 && neck >= neckThreshold;

  // 4. Age: >= 45 for females, >= 35 for males
  const age = Number(data.age) || 0;
  const ageThreshold = isFemale ? 45 : 35;
  const agePositive = age > 0 && age >= ageThreshold;

  const totalPositive = (snores ? 1 : 0) + 
                        (waistPositive ? 1 : 0) + 
                        (neckPositive ? 1 : 0) + 
                        (agePositive ? 1 : 0);

  let category = 'Very low possibility';
  let patientMessage = 'You have very low possibility of having OSA';
  let dashboardMessage = 'Very low possibility (~0%)';
  let probabilityPercent = 0;
  let probabilityLabel = '—';

  if (totalPositive === 4) {
    category = 'Very high chances of OSA';
    patientMessage = 'You have very high chances of having OSA';
    dashboardMessage = 'Probablity of approx 80%';
    probabilityPercent = 80;
    probabilityLabel = 'Approx 80%';
  } else if (totalPositive === 3) {
    category = 'High chances of OSA';
    patientMessage = 'You have high chances of having OSA';
    dashboardMessage = 'Probablity of approx 55%';
    probabilityPercent = 55;
    probabilityLabel = 'Approx 55%';
  } else if (totalPositive === 2) {
    category = 'Possible OSA';
    patientMessage = 'You have possible OSA';
    dashboardMessage = 'Probablity of approx 37%';
    probabilityPercent = 37;
    probabilityLabel = 'Approx 37%';
  } else if (totalPositive === 1) {
    category = 'Low possibility';
    patientMessage = 'You have low possibility of having OSA';
    dashboardMessage = 'Low possibility';
    probabilityPercent = null;
    probabilityLabel = 'Low';
  }

  const studyFootnote = 'Probability is on the basis of a study of data of >2500 individuals from India.';

  return {
    scoreRatio: `${totalPositive}/4`,
    totalPositive,
    category,
    patientMessage,
    dashboardMessage,
    probabilityPercent,
    probabilityLabel,
    studyFootnote,
    isPositive: totalPositive >= 2,
    criteria: {
      snoring: { positive: snores, label: 'Snoring' },
      waist: { positive: waistPositive, value: waist, threshold: waistThreshold, label: `Waist (≥${waistThreshold}cm)` },
      neck: { positive: neckPositive, value: neck, threshold: neckThreshold, label: `Neck (≥${neckThreshold}cm)` },
      age: { positive: agePositive, value: age, threshold: ageThreshold, label: `Age (≥${ageThreshold}y)` }
    }
  };
}

export function evaluateTestPathAndSafety(data = {}) {
  const rlsEval = evaluateRLS(data);
  const insomniaEval = evaluateInsomnia(data);
  const osaEval = evaluateOSA(data);

  const diagConds = Array.isArray(data.diagnosed_conditions) ? data.diagnosed_conditions : [];
  
  const hasHeartDisease = diagConds.some(c => /heart|cardiac|coronary|chf|arrhythmia/i.test(c));
  const hasCOPDOrAsthma = diagConds.some(c => /copd|asthma|lung|respiratory/i.test(c));
  const hasStroke = diagConds.some(c => /stroke|tia|cerebrovascular/i.test(c));
  const hasHTN = diagConds.some(c => /hypertension|high blood pressure/i.test(c)) || 
                 ((Number(data.bp_systolic) || 0) > 140 && (Number(data.bp_diastolic) || 0) > 90);

  const hasSevereComorbidity = hasHeartDisease || hasCOPDOrAsthma || hasStroke;

  const incidents = Array.isArray(data.sleepiness_incident_types) 
    ? data.sleepiness_incident_types 
    : (Array.isArray(data.sleepinessIncidentTypes) ? data.sleepinessIncidentTypes : []);

  const hasAccidentIncident = incidents.some(i => {
    const s = String(i).toLowerCase();
    return (s.includes('accident') || s.includes('near') || s.includes('crash') || s.includes('drifted')) && !s.includes('neither');
  });

  const accidentHistory = Boolean(
    data.had_driving_accident_or_near_miss || 
    data.drowsy_driving_accident ||
    hasAccidentIncident
  );

  let testPath = 'Sleep Hygiene Recommendations';
  let clinicalSummary = "Right now you don't have any sleep abnormalities, but we encourage you to maintain healthy sleep hygiene routines.";
  let safetyAlert = false;
  let safetyMessage = '';

  const hasRLS = rlsEval.isPositive;
  const hasInsomnia = insomniaEval.isPositive;
  const hasOSA = osaEval.isPositive;

  // Test Path Triage logic
  if (hasInsomnia && hasOSA) {
    // COMISA => Level 1 PSG + Sleep Specialist
    testPath = 'Level 1 PSG + Sleep Specialist';
    clinicalSummary = 'Co-morbid Insomnia and Sleep Apnea (COMISA) suspected. Recommended Level 1 PSG in hospital and Sleep Specialist consultation.';
  } else if (hasInsomnia && hasRLS) {
    testPath = 'Blood Investigation & Sleep Instructions';
    clinicalSummary = 'Features of both Insomnia and Restless Legs Syndrome detected. Recommended serum iron/ferritin blood investigation and sleep hygiene coaching.';
  } else if (hasInsomnia && !hasOSA && !hasRLS) {
    testPath = 'CBT-i';
    clinicalSummary = 'Primary Insomnia symptoms detected. Cognitive Behavioral Therapy for Insomnia (CBT-i) is recommended.';
  } else if (hasRLS && !hasOSA && !hasInsomnia) {
    testPath = 'Blood Investigation';
    clinicalSummary = 'Restless Legs Syndrome features detected. Blood investigation (Ferritin & Iron profile) recommended.';
  } else if (hasOSA) {
    if (hasSevereComorbidity) {
      testPath = 'Level 1 PSG in hospital';
      safetyAlert = true;
      safetyMessage = 'Home sleep testing contraindicated due to cardiac/respiratory comorbidity or stroke history. In-lab Level 1 PSG in hospital required.';
      clinicalSummary = 'OSA suspected with high-risk comorbidities. Home sleep testing is contraindicated; Level 1 PSG in hospital required.';
    } else {
      testPath = 'HSAT';
      clinicalSummary = 'OSA suspected. Home Sleep Apnea Testing (HSAT) recommended.';
    }
  } else if (hasRLS) {
    testPath = 'Blood Investigation';
    clinicalSummary = 'Restless Legs Syndrome features detected. Blood investigation recommended.';
  }

  if (accidentHistory) {
    safetyAlert = true;
    safetyMessage = (safetyMessage ? `${safetyMessage} | ` : '') + '🏁 Driving accident / near-miss reported due to sleepiness!';
    if (testPath === 'HSAT' || testPath === 'Sleep Hygiene Recommendations' || !testPath || testPath === '—') {
      testPath = 'HSAT + Urgently Meet Sleep Specialist';
    } else if (!testPath.includes('Sleep Specialist')) {
      testPath = `${testPath} + Urgently Meet Sleep Specialist`;
    }
  }

  let comorbidityLabel = 'None';
  if (hasSevereComorbidity) {
    comorbidityLabel = [
      hasHeartDisease && 'CVD',
      hasCOPDOrAsthma && 'COPD/Asthma',
      hasStroke && 'Stroke'
    ].filter(Boolean).join(', ');
  } else if (hasHTN) {
    comorbidityLabel = 'HTN';
  } else if (diagConds.length > 0) {
    comorbidityLabel = diagConds.join(', ');
  }

  const bmi = calculatePatientBMI(data);
  const bmiCategory = getBMICategory(bmi);

  return {
    rlsEval,
    insomniaEval,
    osaEval,
    bmi,
    bmiCategory,
    testPath,
    clinicalSummary,
    safetyAlert,
    safetyMessage,
    accidentHistory,
    comorbidityLabel
  };
}
