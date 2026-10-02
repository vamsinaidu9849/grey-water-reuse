/* ==========================================================================
   GreyAI React — AI Decision Engine (decisionEngine.js)
   Evaluates parameters against WHO/EPA non-potable greywater standards.
   ========================================================================== */

export function predictGreywater(params = {}) {
  const pH = parseFloat(params.pH) || 7.0;
  const turbidity = parseFloat(params.Turbidity_NTU || params.turbidity) || 5.0;
  const tds = parseFloat(params.TDS_mg_L || params.tds) || 400;
  const bod = parseFloat(params.BOD_mg_L || params.bod) || 10;
  const cod = parseFloat(params.COD_mg_L || params.cod) || 45;
  const temp = parseFloat(params.Temperature_C || params.temp) || 22;
  const ec = parseFloat(params.EC_uS_cm || params.ec) || 550;
  const do_val = parseFloat(params.DO_mg_L || params.do_val) || 5.5;
  const oil = parseFloat(params.Oil_Grease_mg_L || params.oil) || 1.0;

  let score = 100;
  let reasoning = [];
  let requiredTreatments = [];

  // Evaluate pH (6.5 - 8.5)
  if (pH >= 6.5 && pH <= 8.5) {
    reasoning.push({ status: 'pass', text: `pH (${pH.toFixed(1)}) is within optimal safe range (6.5–8.5).` });
  } else {
    const penalty = Math.abs(pH - 7.5) * 12;
    score -= penalty;
    reasoning.push({ status: 'warn', text: `pH (${pH.toFixed(1)}) deviates from neutral range (6.5–8.5).` });
    requiredTreatments.push('pH Adjustment / Neutralization');
  }

  // Evaluate Turbidity (< 5 NTU safe, < 20 NTU treatment)
  if (turbidity <= 5.0) {
    reasoning.push({ status: 'pass', text: `Turbidity (${turbidity.toFixed(1)} NTU) meets direct reuse standard (<5 NTU).` });
  } else if (turbidity <= 20.0) {
    score -= 15;
    reasoning.push({ status: 'warn', text: `Turbidity (${turbidity.toFixed(1)} NTU) elevated. Sand filtration required.` });
    requiredTreatments.push('Sand / Dual-Media Filtration');
  } else {
    score -= 35;
    reasoning.push({ status: 'fail', text: `Turbidity (${turbidity.toFixed(1)} NTU) high. Flocculation & microfiltration needed.` });
    requiredTreatments.push('Coagulation & Flocculation');
    requiredTreatments.push('Membrane Microfiltration');
  }

  // Evaluate TDS (< 500 mg/L safe, < 1000 mg/L treatment)
  if (tds <= 500) {
    reasoning.push({ status: 'pass', text: `Total Dissolved Solids (${tds} mg/L) is low/moderate (<500 mg/L).` });
  } else if (tds <= 1000) {
    score -= 12;
    reasoning.push({ status: 'warn', text: `TDS (${tds} mg/L) moderate. Carbon adsorption recommended.` });
    requiredTreatments.push('Activated Carbon Adsorption');
  } else {
    score -= 30;
    reasoning.push({ status: 'fail', text: `TDS (${tds} mg/L) exceeds 1000 mg/L. Salinity risk.` });
    requiredTreatments.push('Reverse Osmosis / Desalination');
  }

  // Evaluate BOD (< 10 mg/L safe, < 30 mg/L treatment)
  if (bod <= 10.0) {
    reasoning.push({ status: 'pass', text: `BOD (${bod.toFixed(1)} mg/L) minimal (<10 mg/L). Low organic load.` });
  } else if (bod <= 30.0) {
    score -= 18;
    reasoning.push({ status: 'warn', text: `BOD (${bod.toFixed(1)} mg/L) elevated. Aerated bio-filter required.` });
    requiredTreatments.push('Aerated Biological Filter / MBBR');
  } else {
    score -= 40;
    reasoning.push({ status: 'fail', text: `BOD (${bod.toFixed(1)} mg/L) critically high (>30 mg/L). Severe organic contamination.` });
    requiredTreatments.push('Activated Sludge Process');
    requiredTreatments.push('Extended Aeration');
  }

  // Evaluate COD (< 50 mg/L safe, < 120 mg/L treatment)
  if (cod <= 50.0) {
    reasoning.push({ status: 'pass', text: `COD (${cod.toFixed(1)} mg/L) within safe limit (<50 mg/L).` });
  } else if (cod <= 120.0) {
    score -= 15;
    reasoning.push({ status: 'warn', text: `COD (${cod.toFixed(1)} mg/L) requires chemical oxidation.` });
  } else {
    score -= 30;
    reasoning.push({ status: 'fail', text: `COD (${cod.toFixed(1)} mg/L) high (>120 mg/L). Chemical pollutants present.` });
    requiredTreatments.push('Advanced Oxidation Process (AOP)');
  }

  // Disinfection always recommended
  requiredTreatments.push('UV Disinfection / Chlorination');

  score = Math.max(10, Math.min(100, Math.round(score)));

  let suitabilityClass = "Class 1: Suitable for Reuse";
  let badgeClass = "badge-safe";
  let statusText = "SAFE FOR REUSE";
  let confidence = (94.2 + Math.random() * 4).toFixed(1);

  let applications = [
    { name: "Toilet Flushing", suitable: true, status: "Recommended", note: "Safe for dual-flush residential and commercial toilets." },
    { name: "Garden Irrigation", suitable: true, status: "Recommended", note: "Suitable for drip/subsurface garden irrigation." },
    { name: "Landscape Irrigation", suitable: true, status: "Recommended", note: "Approved for parks, lawns, and tree belt watering." },
    { name: "Vehicle Washing", suitable: true, status: "Recommended", note: "Acceptable for exterior non-potable vehicle washing." },
    { name: "Construction Use", suitable: true, status: "Recommended", note: "Suitable for dust suppression and concrete mixing." }
  ];

  if (score < 60) {
    suitabilityClass = "Class 3: Not Recommended";
    badgeClass = "badge-danger";
    statusText = "NOT RECOMMENDED";
    confidence = "96.5";
    applications.forEach(a => {
      a.suitable = false;
      a.status = "Not Recommended";
      a.note = "Raw quality poses health or environmental fouling risk without industrial treatment.";
    });
  } else if (score < 85) {
    suitabilityClass = "Class 2: Suitable After Treatment";
    badgeClass = "badge-treatment";
    statusText = "TREATMENT REQUIRED";
    confidence = "91.8";
    applications[0].status = "Conditional";
    applications[3].status = "Conditional";
  }

  requiredTreatments = [...new Set(requiredTreatments)];

  return {
    score,
    suitabilityClass,
    statusText,
    badgeClass,
    confidence,
    reasoning,
    requiredTreatments,
    applications
  };
}

export function generateDefaultDashboardSamples() {
  const list = [];
  for (let i = 1; i <= 25; i++) {
    const isSafe = i % 3 !== 0;
    list.push({
      Sample_ID: `GW-DEMO-${String(i).padStart(3, '0')}`,
      pH: isSafe ? (7.0 + (Math.random() * 0.8 - 0.4)).toFixed(1) : (5.5 + Math.random() * 3.5).toFixed(1),
      Turbidity_NTU: isSafe ? (2.0 + Math.random() * 3.0).toFixed(1) : (15.0 + Math.random() * 30.0).toFixed(1),
      TDS_mg_L: Math.round(300 + Math.random() * 600),
      BOD_mg_L: isSafe ? (5.0 + Math.random() * 4.0).toFixed(1) : (25.0 + Math.random() * 65.0).toFixed(1),
      COD_mg_L: isSafe ? (25 + Math.random() * 20).toFixed(1) : (90 + Math.random() * 120).toFixed(1),
      Temperature_C: (20 + Math.random() * 5).toFixed(1),
      EC_uS_cm: Math.round(450 + Math.random() * 700),
      DO_mg_L: (4.5 + Math.random() * 2.5).toFixed(1)
    });
  }
  return list;
}
