// CareMind AI Mock Hospital Database - Deployment Build
const hospitalData = {
  patients: [
    {
      id: "P001",
      name: "Marcus Vance",
      age: 45,
      gender: "Male",
      bed: "Bed-01A",
      ward: "Medical Ward A",
      admissionDate: "2026-06-12",
      diagnosis: "Mild Acute Bronchitis",
      priority: 3, // Normal/Stable
      riskScore: 24,
      deteriorationTime: 0,
      vitals: { hr: 72, bpSys: 115, bpDia: 76, temp: 36.8, spo2: 98, rr: 16 },
      vitalsHistory: {
        hr: [70, 72, 74, 71, 72],
        bpSys: [112, 115, 118, 114, 115],
        bpDia: [74, 76, 78, 75, 76],
        spo2: [97, 98, 98, 97, 98],
        temp: [36.7, 36.8, 36.9, 36.8, 36.8]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 12,
        contributingFactors: [
          { factor: "Normal Temperature (36.8°C)", active: false },
          { factor: "Normal Blood Pressure (115/76)", active: false },
          { factor: "Normal Heart Rate (72 bpm)", active: false }
        ],
        action: "Continue standard recovery. Scheduled for outpatient discharge."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Patient presented with a dry cough and mild congestion. History of mild seasonal asthma. Lungs are clear on auscultation. Responding well to humidified air and standard expectorants.",
      medications: "Albuterol inhaler PRN, Guaifenesin 600mg PO daily.",
      allergies: "None",
      notes: "Vitals stable. Patient resting comfortably.",
      assignedNurse: "Dr. Sarah Mercer (N01)"
    },
    {
      id: "P002",
      name: "Sophia Chen",
      age: 52,
      gender: "Female",
      bed: "Bed-01B",
      ward: "Medical Ward A",
      admissionDate: "2026-06-14",
      diagnosis: "Post-Operative Elective Knee Arthroplasty",
      priority: 3, // Normal/Stable
      riskScore: 18,
      deteriorationTime: 0,
      vitals: { hr: 68, bpSys: 120, bpDia: 80, temp: 37.0, spo2: 99, rr: 14 },
      vitalsHistory: {
        hr: [66, 68, 70, 67, 68],
        bpSys: [118, 120, 122, 119, 120],
        bpDia: [78, 80, 82, 79, 80],
        spo2: [98, 99, 99, 98, 99],
        temp: [36.9, 37.0, 37.1, 37.0, 37.0]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 8,
        contributingFactors: [
          { factor: "Stable Post-Operative Vitals", active: false }
        ],
        action: "Post-op physical therapy protocol. Monitor surgical incision sites."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Uncomplicated total knee replacement. Surgical incision is clean, intact, and dry with minimal serous drainage.",
      medications: "Enoxaparin 40mg SC daily, Acetaminophen 1000mg PO q8h.",
      allergies: "Sulfa drugs (hives)",
      notes: "Ambulating with walker. Pain well controlled.",
      assignedNurse: "Dr. Sarah Mercer (N01)"
    },
    {
      id: "P003",
      name: "David Kowalski",
      age: 39,
      gender: "Male",
      bed: "Bed-02A",
      ward: "Medical Ward A",
      admissionDate: "2026-06-13",
      diagnosis: "Gastroesophageal Reflux Disease / Chest Pain Rule-out",
      priority: 3, // Normal/Stable
      riskScore: 22,
      deteriorationTime: 0,
      vitals: { hr: 75, bpSys: 118, bpDia: 76, temp: 36.6, spo2: 97, rr: 18 },
      vitalsHistory: {
        hr: [72, 75, 77, 74, 75],
        bpSys: [115, 118, 120, 116, 118],
        bpDia: [72, 76, 78, 74, 76],
        spo2: [96, 97, 98, 97, 97],
        temp: [36.5, 36.6, 36.7, 36.6, 36.6]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 10,
        contributingFactors: [
          { factor: "Normal Physiology Metrics", active: false }
        ],
        action: "Completed cardiac biomarkers check (Troponins negative x2). Discharge pending."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Admitted via ER presenting with substernal chest discomfort. Electrocardiogram (ECG) showed normal sinus rhythm with no ST elevations. Diagnosed with acute acid reflux.",
      medications: "Omeprazole 40mg PO daily, Famotidine 20mg PO PRN.",
      allergies: "None",
      notes: "Symptoms fully resolved after GI cocktail administration.",
      assignedNurse: "Dr. Sarah Mercer (N01)"
    },
    {
      id: "P004",
      name: "Elena Rostova",
      age: 28,
      gender: "Female",
      bed: "Bed-03A",
      ward: "Medical Ward B",
      admissionDate: "2026-06-15",
      diagnosis: "Dehydration / Acute Gastroenteritis",
      priority: 3, // Normal/Stable
      riskScore: 25,
      deteriorationTime: 0,
      vitals: { hr: 80, bpSys: 110, bpDia: 70, temp: 36.9, spo2: 98, rr: 16 },
      vitalsHistory: {
        hr: [85, 82, 80, 81, 80],
        bpSys: [102, 108, 110, 107, 110],
        bpDia: [64, 68, 70, 69, 70],
        spo2: [97, 98, 98, 98, 98],
        temp: [37.1, 37.0, 36.9, 36.9, 36.9]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 15,
        contributingFactors: [
          { factor: "Vitals stabilized after fluid resuscitation", active: false }
        ],
        action: "Maintain oral hydration. Re-introduce soft bland diet."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Presented with severe nausea and vomiting. Received 2L Normal Saline boluses. Electrolytes checked and within normal limits.",
      medications: "Ondansetron 4mg IV PRN, D5NS infusion at 75mL/hr (completed).",
      allergies: "Metoclopramide (dystonia)",
      notes: "Nausea resolved. Tolerating clear liquids well.",
      assignedNurse: "Dr. Tasha Lopez (N02)"
    },
    {
      id: "P005",
      name: "Arthur Pendelton",
      age: 61,
      gender: "Male",
      bed: "Bed-03B",
      ward: "Medical Ward B",
      admissionDate: "2026-06-14",
      diagnosis: "Post-operative Laparoscopic Cholecystectomy",
      priority: 3, // Normal/Stable
      riskScore: 20,
      deteriorationTime: 0,
      vitals: { hr: 78, bpSys: 122, bpDia: 82, temp: 37.2, spo2: 98, rr: 15 },
      vitalsHistory: {
        hr: [75, 78, 79, 77, 78],
        bpSys: [118, 122, 124, 120, 122],
        bpDia: [78, 82, 84, 80, 82],
        spo2: [97, 98, 99, 98, 98],
        temp: [37.0, 37.1, 37.2, 37.2, 37.2]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 5,
        contributingFactors: [
          { factor: "Normal surgical healing", active: false }
        ],
        action: "Manage incision pain. Encourage early ambulation."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Gallbladder removal completed. Small surgical laparoscopic incisions are clean with no signs of erythema or swelling.",
      medications: "Ibuprofen 400mg PO q6h, Oxycodone 5mg PO PRN severe pain.",
      allergies: "Codeine (nausea)",
      notes: "Voiding well. Ready for discharge review.",
      assignedNurse: "Dr. Tasha Lopez (N02)"
    },
    {
      id: "P006",
      name: "Emma Watson",
      age: 33,
      gender: "Female",
      bed: "Bed-04A",
      ward: "Medical Ward B",
      admissionDate: "2026-06-15",
      diagnosis: "Urinary Tract Infection",
      priority: 3, // Normal/Stable
      riskScore: 28,
      deteriorationTime: 0,
      vitals: { hr: 82, bpSys: 115, bpDia: 75, temp: 36.7, spo2: 99, rr: 16 },
      vitalsHistory: {
        hr: [88, 85, 83, 82, 82],
        bpSys: [110, 112, 115, 114, 115],
        bpDia: [70, 72, 75, 74, 75],
        spo2: [98, 99, 99, 98, 99],
        temp: [37.8, 37.3, 36.9, 36.8, 36.7]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 14,
        contributingFactors: [
          { factor: "Fever resolved after antibiotic administration", active: false }
        ],
        action: "Complete 3-day course of IV antibiotics, then transition to oral."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Presented with dysuria and low-grade fever. Urinalysis positive for leukocytes and nitrites. Urine culture positive for E. coli.",
      medications: "Ceftriaxone 1g IV daily, Phenazopyridine 200mg PO q8h.",
      allergies: "None",
      notes: "Dysuria significantly improved. Fever free.",
      assignedNurse: "Dr. Tasha Lopez (N02)"
    },
    {
      id: "P007",
      name: "William Hayes",
      age: 58,
      gender: "Male",
      bed: "Bed-04B",
      ward: "Medical Ward B",
      admissionDate: "2026-06-13",
      diagnosis: "Cellulitis of the Left Foot",
      priority: 3, // Normal/Stable
      riskScore: 30,
      deteriorationTime: 0,
      vitals: { hr: 70, bpSys: 125, bpDia: 80, temp: 37.1, spo2: 97, rr: 18 },
      vitalsHistory: {
        hr: [75, 72, 70, 71, 70],
        bpSys: [120, 122, 125, 124, 125],
        bpDia: [78, 80, 80, 81, 80],
        spo2: [96, 97, 97, 96, 97],
        temp: [37.4, 37.2, 37.1, 37.1, 37.1]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 18,
        contributingFactors: [
          { factor: "Local cellulitis infection bounds", active: true }
        ],
        action: "Mark borders of erythema. Elevate left lower extremity."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Presented with localized redness, warmth, and swelling of the left dorsal foot. Responding well to IV Cefazolin.",
      medications: "Cefazolin 1g IV q8h, Acetaminophen 650mg PO PRN.",
      allergies: "Penicillin (rash)",
      notes: "Area of redness decreasing. Swelling reduced.",
      assignedNurse: "Dr. Tasha Lopez (N02)"
    },
    {
      id: "P008",
      name: "Marcus Vance Sr.",
      age: 78,
      gender: "Male",
      bed: "ICU-Bed-01",
      ward: "Intensive Care Unit",
      admissionDate: "2026-06-12",
      diagnosis: "Severe Urosepsis / Respiratory Distress",
      priority: 1, // Serious/Critical Condition (Red)
      riskScore: 92,
      deteriorationTime: 18, // minutes
      vitals: { hr: 122, bpSys: 85, bpDia: 50, temp: 39.2, spo2: 86, rr: 28 },
      vitalsHistory: {
        hr: [102, 108, 114, 118, 122],
        bpSys: [105, 98, 92, 88, 85],
        bpDia: [64, 60, 56, 52, 50],
        spo2: [93, 91, 89, 88, 86],
        temp: [38.2, 38.6, 38.9, 39.1, 39.2]
      },
      sepsisRisk: {
        level: "CRITICAL",
        confidence: 96,
        contributingFactors: [
          { factor: "Elevated Temperature (39.2°C)", active: true },
          { factor: "Hypotension / Low Blood Pressure (85/50)", active: true },
          { factor: "Tachycardia / High Heart Rate (122 bpm)", active: true },
          { factor: "Severe Hypoxemia / Oxygen Saturation 86%", active: true }
        ],
        action: "Immediate physician review. Initiate high flow oxygen, broad-spectrum antibiotics, fluid bolus (30mL/kg), and page registrar."
      },
      predictedRisks: { sepsis: "High", cardiac: "Medium", respiratory: "High", shock: "High" },
      history: "History of moderate COPD. Admitted via ER presenting with high fever and respiratory distress. Suspected severe urosepsis pathway progression.",
      medications: "Meropenem 1g IV q8h, Norepinephrine infusion titrated (MAP > 65), Albuterol nebs.",
      allergies: "Sulfa drugs (anaphylaxis)",
      notes: "Severe accessory muscle use. Prepared for potential mechanical ventilation.",
      assignedNurse: "Dr. Jonathan Choi (N03)"
    },
    {
      id: "P009",
      name: "Arthur Pendelton Jr.",
      age: 35,
      gender: "Male",
      bed: "Bed-05A",
      ward: "Medical Ward B",
      admissionDate: "2026-06-15",
      diagnosis: "Food Poisoning / Gastroenteritis",
      priority: 3, // Normal/Stable
      riskScore: 15,
      deteriorationTime: 0,
      vitals: { hr: 74, bpSys: 116, bpDia: 74, temp: 36.8, spo2: 98, rr: 16 },
      vitalsHistory: {
        hr: [78, 76, 75, 74, 74],
        bpSys: [110, 114, 116, 115, 116],
        bpDia: [70, 72, 74, 74, 74],
        spo2: [98, 98, 98, 98, 98],
        temp: [36.9, 36.8, 36.8, 36.8, 36.8]
      },
      sepsisRisk: {
        level: "LOW",
        confidence: 5,
        contributingFactors: [
          { factor: "Normal Vitals parameters", active: false }
        ],
        action: "Hydration completed. Oral diet tolerated."
      },
      predictedRisks: { sepsis: "Low", cardiac: "Low", respiratory: "Low", shock: "Low" },
      history: "Admitted presenting with abdominal cramps, vomiting, and diarrhea. Responded quickly to IV antiemetics and fluid hydration.",
      medications: "Ondansetron 4mg PO PRN.",
      allergies: "None",
      notes: "Discharging later today.",
      assignedNurse: "Dr. Jonathan Choi (N03)"
    },
    {
      id: "P010",
      name: "Sophia Chen Sr.",
      age: 72,
      gender: "Female",
      bed: "Bed-05B",
      ward: "Medical Ward B",
      admissionDate: "2026-06-14",
      diagnosis: "Post-Operative Colectomy Sepsis Pathway",
      priority: 2, // Medium Condition (Orange)
      riskScore: 72,
      deteriorationTime: 45, // minutes
      vitals: { hr: 106, bpSys: 96, bpDia: 60, temp: 38.3, spo2: 91, rr: 22 },
      vitalsHistory: {
        hr: [88, 92, 98, 102, 106],
        bpSys: [112, 108, 102, 98, 96],
        bpDia: [72, 70, 66, 62, 60],
        spo2: [95, 94, 93, 92, 91],
        temp: [37.2, 37.6, 37.9, 38.1, 38.3]
      },
      sepsisRisk: {
        level: "HIGH",
        confidence: 84,
        contributingFactors: [
          { factor: "Elevated Temperature (38.3°C)", active: true },
          { factor: "Hypotension warning (96/60)", active: true },
          { factor: "Tachycardia (106 bpm)", active: true }
        ],
        action: "Draw blood cultures, measure serum lactate STAT, increase supplemental oxygen flow."
      },
      predictedRisks: { sepsis: "High", cardiac: "Low", respiratory: "Medium", shock: "Medium" },
      history: "Post-operative colectomy day 2. Developed low-grade fever and creeping tachycardia over the past 6 hours. Sepsis warning protocol triggered.",
      medications: "Piperacillin/Tazobactam 3.375g IV q6h.",
      allergies: "Penicillin (rash)",
      notes: "Surgical site checked; slight tenderness but no purulent drainage. Attendant is monitoring.",
      assignedNurse: "Dr. Jonathan Choi (N03)"
    }
  ],
  resources: {
    icuBeds: { current: 18, total: 22, label: "ICU Beds", trend: "High Demand", predictedShortageTime: "4 Hours" },
    ventilators: { current: 8, total: 15, label: "Ventilators", trend: "Stable", predictedShortageTime: "None" },
    oxygenSupply: { current: 88, total: 100, label: "Oxygen Supply (%)", trend: "Normal", predictedShortageTime: "None" },
    doctors: { current: 14, total: 18, label: "Available Doctors", trend: "Sufficient", predictedShortageTime: "None" },
    nurses: { current: 36, total: 45, label: "Available Nurses", trend: "Near Limit", predictedShortageTime: "1 Hour" }
  },
  alerts: [
    {
      id: "A-501",
      patientName: "Marcus Vance Sr.",
      patientId: "P008",
      risk: "Critical",
      reason: "SpO2 dropped below 88% combined with temperature spike to 39.2°C.",
      recommendation: "Immediate oxygen titration (High Flow Nasal Cannula) and physician dispatch.",
      timestamp: "02:18 PM",
      status: "Active"
    },
    {
      id: "A-502",
      patientName: "Sophia Chen Sr.",
      patientId: "P010",
      risk: "High",
      reason: "Heart rate exceeded 100 bpm for 4 hours, temp climbing steadily (38.3°C).",
      recommendation: "Draw lactate level and update blood cultures. Monitor blood pressure closely.",
      timestamp: "02:05 PM",
      status: "Active"
    }
  ],
  departments: [
    { name: "Emergency Department", healthScore: 92, patients: 28, doctors: 6, nurses: 14 },
    { name: "Intensive Care Unit", healthScore: 78, patients: 18, doctors: 4, nurses: 12 },
    { name: "General Medical Ward", healthScore: 85, patients: 54, doctors: 3, nurses: 10 },
    { name: "Surgical Recovery", healthScore: 89, patients: 22, doctors: 3, nurses: 8 },
    { name: "Cardiac Care Center", healthScore: 81, patients: 15, doctors: 2, nurses: 6 }
  ],
  
  // Demographics Auth Users Matrix (Compatible with both N01/N02/N03 and N1/N2/N3)
  authUsers: {
    // Patient Accounts
    "P001": { role: "patient", password: "demo123", patientId: "P001" },
    "P002": { role: "patient", password: "demo123", patientId: "P002" },
    "P003": { role: "patient", password: "demo123", patientId: "P003" },
    "P004": { role: "patient", password: "demo123", patientId: "P004" },
    "P005": { role: "patient", password: "demo123", patientId: "P005" },
    "P006": { role: "patient", password: "demo123", patientId: "P006" },
    "P007": { role: "patient", password: "demo123", patientId: "P007" },
    "P008": { role: "patient", password: "demo123", patientId: "P008" },
    "P009": { role: "patient", password: "demo123", patientId: "P009" },
    "P010": { role: "patient", password: "demo123", patientId: "P010" },
    
    // Nurse Accounts
    "N01": { role: "nurse", password: "nurse123", nurseName: "Dr. Sarah Mercer" },
    "N02": { role: "nurse", password: "nurse123", nurseName: "Dr. Tasha Lopez" },
    "N03": { role: "nurse", password: "nurse123", nurseName: "Dr. Jonathan Choi" },
    
    // Nurse Aliases for N1, N2, N3 and N001, N002, N003 compatibility
    "N1": { role: "nurse", password: "nurse123", nurseName: "Dr. Sarah Mercer" },
    "N2": { role: "nurse", password: "nurse123", nurseName: "Dr. Tasha Lopez" },
    "N3": { role: "nurse", password: "nurse123", nurseName: "Dr. Jonathan Choi" },
    "N001": { role: "nurse", password: "nurse123", nurseName: "Dr. Sarah Mercer" },
    "N002": { role: "nurse", password: "nurse123", nurseName: "Dr. Tasha Lopez" },
    "N003": { role: "nurse", password: "nurse123", nurseName: "Dr. Jonathan Choi" }
  }
};
