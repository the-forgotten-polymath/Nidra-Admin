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
  const legSensations = Boolean(data.uncomfortable_leg_sensations);
  const urgeToMove = Boolean(data.urge_to_move_legs);
  const worseAtRest = Boolean(data.rest_worsens_legs);
  const relievedByMovement = Boolean(data.movement_relieves_legs);

  const isRLS = legSensations && urgeToMove && worseAtRest && relievedByMovement;

  return {
    isPositive: isRLS,
    status: isRLS ? 'Possible' : '—',
    label: isRLS ? 'Possible RLS' : 'None'
  };
}

export function evaluateInsomnia(data = {}) {
  const fallAsleepMin = Number(data.time_to_fall_asleep_minutes) || 0;
  const awakenings = Number(data.nocturnal_awakenings_count) || 0;
  const nightsPerWeek = Number(data.trouble_sleeping_nights_per_week) || 0;

  const isInsomnia = fallAsleepMin >= 30 && awakenings >= 2 && nightsPerWeek > 3;

  return {
    isPositive: isInsomnia,
    status: isInsomnia ? 'Possible' : '—',
    label: isInsomnia ? 'Possible Insomnia' : 'None'
  };
}

export function evaluateOSA(data = {}) {
  const snores = Boolean(data.snores_when_sleeping);
  const fatigue = Boolean(data.drowsy_during_day);
  const apnea = Boolean(data.stop_breathing_noticed);
  const htOrNeck = Boolean(data.bp_systolic > 140 || data.neck_circumference_cm > 40);

  const totalPositive = (snores ? 1 : 0) + (fatigue ? 1 : 0) + (apnea ? 1 : 0) + (htOrNeck ? 1 : 0);
  const nonSnoringPositive = (fatigue ? 1 : 0) + (apnea ? 1 : 0) + (htOrNeck ? 1 : 0);

  let category = 'Unlikely';
  if (totalPositive === 4 && snores) {
    category = 'Highly +ve to OSA';
  } else if (nonSnoringPositive >= 3) {
    category = 'Likely OSA';
  } else if (nonSnoringPositive >= 2) {
    category = 'Probable OSA';
  }

  return {
    scoreRatio: totalPositive > 0 ? `${totalPositive}/4` : '—',
    totalPositive,
    nonSnoringPositive,
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

  return {
    rlsEval,
    insomniaEval,
    osaEval,
    testPath,
    clinicalSummary,
    safetyAlert,
    safetyMessage,
    accidentHistory,
    comorbidityLabel
  };
}
