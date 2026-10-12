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
  const q1 = Boolean(data.legs_uncomfortable_resting ?? data.legsUncomfortableResting ?? data.uncomfortable_leg_sensations);
  const q2 = Boolean(data.legs_worse_evening ?? data.legsWorseEvening ?? data.urge_to_move_legs);
  const q3 = Boolean(data.legs_moving_helps ?? data.legsMovingHelps ?? data.movement_relieves_legs);
  const q4 = Boolean(data.legs_no_other_reason ?? data.legsNoOtherReason ?? data.rest_worsens_legs);

  const isRLS = q1 && q2 && q3 && q4;

  return {
    isPositive: isRLS,
    status: isRLS ? 'Likely' : '—',
    label: isRLS ? 'Likely RLS' : 'None'
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
  const snores = Boolean(data.snores_when_sleeping ?? data.snoresWhenSleeping);
  const fatigue = Boolean(data.drowsy_during_day ?? data.drowsyDuringDay);
  const apnea = Boolean(data.stop_breathing_noticed ?? data.stopBreathingNoticed);
  const bmiVal = calculatePatientBMI(data) || 0;
  const htOrNeckOrBmi = Boolean(
    (Number(data.bp_systolic ?? data.bpSystolic) || 0) > 140 || 
    (Number(data.neck_circumference_cm ?? data.neckCircumferenceCm) || 0) > 40 ||
    bmiVal > 35
  );

  const totalPositive = (snores ? 1 : 0) + (fatigue ? 1 : 0) + (apnea ? 1 : 0) + (htOrNeckOrBmi ? 1 : 0);

  let category = 'Unlikely';
  if (totalPositive >= 4) {
    category = 'Highly +ve to OSA';
  } else if (totalPositive === 3) {
    category = 'Likely OSA';
  } else if (totalPositive === 2) {
    category = 'Probable OSA';
  }

  return {
    scoreRatio: totalPositive > 0 ? `${totalPositive}/4` : '—',
    totalPositive,
    category,
    isPositive: totalPositive >= 2
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
  const accidentHistory = Boolean(data.had_driving_accident_or_near_miss || data.drowsy_driving_accident);

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
