// CareMind AI - Hospital Chief Coordinator Engine (Deployment Build)

document.addEventListener('DOMContentLoaded', () => {
  // --- Authentication Guard ---
  const currentRole = localStorage.getItem('caremind_role');
  const currentUser = localStorage.getItem('caremind_user');
  const attenderPhone = localStorage.getItem('caremind_attender_phone') || "+1 (555) 019-9234";

  if (!currentRole || !currentUser) {
    // Redirect to login if session does not exist
    window.location.href = "index.html";
    return;
  }

  // --- App State ---
  let patients = [...hospitalData.patients];
  let alerts = [...hospitalData.alerts];
  let resources = { ...hospitalData.resources };
  let departments = [...hospitalData.departments];
  
  let selectedPatientId = "P008"; // Default focus is P008 (Marcus Vance Sr. - Critical)
  let activeTab = currentRole === "patient" ? "patient-portal" : "dashboard";
  let patientTimelinePeriod = "24h"; 
  let chatType = "doubt"; 
  
  let reminders = [
    { text: "Take Ceftriaxone IV Antibiotic", time: "8:00 PM" },
    { text: "Bedside Saturation check by Nurse", time: "11:00 PM" }
  ];

  // Chart references (for recycling/destroying to prevent memory leaks)
  let charts = {
    sepsisGauge: null,
    deteriorationTimeline: null,
    resourceHistory: null,
    sepsisTrends: null,
    deptHealth: null,
    patientTrend: null,
    sparklines: {}
  };

  // --- Initialize App ---
  const init = () => {
    configureRoleUI();

    // Check URL Parameters for initial tab navigation (Nurses only)
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (currentRole === "nurse" && initialTab && ["dashboard", "patients", "alerts", "resources", "insights", "reports"].includes(initialTab)) {
      switchTab(initialTab);
    } else {
      switchTab(activeTab);
    }

    // Setup Navigation Event Listeners
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const tabName = item.getAttribute('data-tab');
        if (tabName) {
          switchTab(tabName);
        }
      });
    });

    // Log Out button
    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('caremind_role');
      localStorage.removeItem('caremind_user');
      localStorage.removeItem('caremind_attender_phone');
      window.location.href = "index.html";
    });

    setupEventListeners();
    renderAll();
    startLiveSimulator();
  };

  // --- Configure UI Layout per Role ---
  const configureRoleUI = () => {
    const nurseNav = document.getElementById('nav-nurse-menu');
    const patientNav = document.getElementById('nav-patient-menu');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const bellBtn = document.getElementById('notification-bell-btn');

    if (currentRole === "patient") {
      nurseNav.style.display = "none";
      patientNav.style.display = "block";
      bellBtn.style.display = "none"; 
      
      const pat = patients.find(p => p.id === currentUser);
      if (pat) {
        avatarEl.textContent = pat.name.split(' ').map(n=>n[0]).join('');
        nameEl.textContent = pat.name;
        roleEl.textContent = `Patient Portal`;
        selectedPatientId = pat.id;
      }
      
      const attenderEl = document.getElementById('chat-attender-phone');
      if (attenderEl) attenderEl.textContent = attenderPhone;
      
    } else {
      nurseNav.style.display = "block";
      patientNav.style.display = "none";
      bellBtn.style.display = "flex";
      
      const nurseDetails = hospitalData.authUsers[currentUser];
      if (nurseDetails) {
        avatarEl.textContent = "NS";
        nameEl.textContent = nurseDetails.nurseName;
        roleEl.textContent = `Coordinator (${currentUser})`;
      }
    }
  };

  // --- SPA Router / Tab Switcher ---
  const switchTab = (tabName) => {
    if (currentRole === "patient" && tabName !== "patient-portal" && tabName !== "patient-ai") {
      return; 
    }

    activeTab = tabName;
    
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-tab') === tabName) {
        item.classList.add('active');
      }
    });

    document.querySelectorAll('.tab-section').forEach(section => {
      section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`view-${tabName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    const titleEl = document.getElementById('current-page-title');
    const descEl = document.getElementById('current-page-desc');
    
    switch(tabName) {
      case 'dashboard':
        titleEl.textContent = "Hospital Command Center";
        descEl.textContent = "Live Hospital Physiology & Dispatch Center";
        break;
      case 'patient-portal':
        titleEl.textContent = "My Health Portal";
        descEl.textContent = "Real-time AI Health Prognostics & Medical Log";
        break;
      case 'patient-ai':
        titleEl.textContent = "My AI Assistant";
        descEl.textContent = "Clinical Doubts, Mobility Assistance & Reminders";
        break;
      case 'patients':
        titleEl.textContent = "Patient Census Directory";
        descEl.textContent = "Comprehensive Ward Profiles & Risk Status";
        break;
      case 'alerts':
        titleEl.textContent = "Triage Dispatch Console";
        descEl.textContent = "Real-time Physiological Alerts & Response Logs";
        break;
      case 'resources':
        titleEl.textContent = "Resource Forecasting Hub";
        descEl.textContent = "Hospital Stockpiles, Bed Availability & Staff Status";
        break;
      case 'insights':
        titleEl.textContent = "AI Clinical Analytics";
        descEl.textContent = "Emergency Probability Maps & Sepsis Pathway Deep Dives";
        break;
      case 'reports':
        titleEl.textContent = "Clinical Intelligence Reports";
        descEl.textContent = "Exportable Logs, Performance Audits & Census Reports";
        break;
    }

    setTimeout(() => {
      if (tabName === 'dashboard') {
        renderDashboardCharts();
      } else if (tabName === 'resources') {
        renderResourcesCharts();
      } else if (tabName === 'insights') {
        renderInsightsCharts();
      } else if (tabName === 'patient-portal') {
        renderPatientPortalTimelineChart();
      }
    }, 100);
  };

  // --- Core Layout Rendering ---
  const renderAll = () => {
    if (currentRole === "patient") {
      renderPatientPortal();
      renderRemindersList();
    } else {
      renderKPIs();
      renderPriorityQueue();
      renderHealthTwin();
      renderSepsisIntel();
      renderDeteriorationEngine();
      renderCMOPanel();
      renderResourcesSummary();
      renderActiveAlertsTicker();
      
      // Render subpages
      renderPatientsTable();
      renderDetailedAlertsPage();
      renderResourcesPage();
      renderRoster();
      renderHeatmap();
      
      // Notifications counter badge
      const activeCount = alerts.filter(a => a.status === 'Active').length;
      document.getElementById('bell-alert-count').textContent = activeCount;
      document.getElementById('alert-summary-pill').textContent = `${activeCount} Active Alerts`;
    }
  };

  // --- Render Patient Portal (Patient Dashboard) ---
  const renderPatientPortal = () => {
    const p = patients.find(pat => pat.id === currentUser);
    if (!p) return;

    document.getElementById('patient-welcome-title').textContent = `Welcome, ${p.name}`;

    document.getElementById('patient-port-id').textContent = p.id;
    document.getElementById('patient-port-name').textContent = p.name;
    document.getElementById('patient-port-age').textContent = `${p.age} Y/O / ${p.gender}`;
    document.getElementById('patient-port-bed').textContent = `${p.ward} (${p.bed})`;
    document.getElementById('patient-port-nurse').textContent = p.assignedNurse || "Dr. Sarah Mercer (N01)";

    document.getElementById('patient-port-vital-hr').textContent = `${p.vitals.hr} bpm`;
    document.getElementById('patient-port-vital-bp').textContent = `${p.vitals.bpSys}/${p.vitals.bpDia} mmHg`;
    document.getElementById('patient-port-vital-temp').textContent = `${p.vitals.temp} °C`;
    document.getElementById('patient-port-vital-spo2').textContent = `${p.vitals.spo2}%`;

    toggleBoxAlert('patient-port-vital-hr-box', p.vitals.hr > 100 || p.vitals.hr < 60);
    toggleBoxAlert('patient-port-vital-bp-box', p.vitals.bpSys < 90 || p.vitals.bpSys > 140);
    toggleBoxAlert('patient-port-vital-temp-box', p.vitals.temp > 38.3 || p.vitals.temp < 36.0);
    toggleBoxAlert('patient-port-vital-spo2-box', p.vitals.spo2 < 91);

    const sepsisBadge = document.getElementById('patient-port-risk-sepsis');
    sepsisBadge.textContent = p.predictedRisks.sepsis;
    sepsisBadge.className = `twin-risk-badge ${p.predictedRisks.sepsis.toLowerCase()}`;

    const cardiacBadge = document.getElementById('patient-port-risk-cardiac');
    cardiacBadge.textContent = p.predictedRisks.cardiac;
    cardiacBadge.className = `twin-risk-badge ${p.predictedRisks.cardiac.toLowerCase()}`;

    const respBadge = document.getElementById('patient-port-risk-respiratory');
    respBadge.textContent = p.predictedRisks.respiratory;
    respBadge.className = `twin-risk-badge ${p.predictedRisks.respiratory.toLowerCase()}`;

    const shockBadge = document.getElementById('patient-port-risk-shock');
    shockBadge.textContent = p.predictedRisks.shock;
    shockBadge.className = `twin-risk-badge ${p.predictedRisks.shock.toLowerCase()}`;

    const summaryEl = document.getElementById('patient-port-ai-summary');
    if (p.priority === 3) {
      summaryEl.innerHTML = `<span style="color: var(--success-green); font-weight:700;"><i data-lucide="check-circle2" style="display:inline; vertical-align:middle;"></i> Vitals Stable</span><br>
      Your physiological indicators demonstrate complete stability. No anomalies detected. Continue standard therapeutic plan and clinical observations.`;
    } else if (p.priority === 2) {
      summaryEl.innerHTML = `<span style="color: var(--warning-amber); font-weight:700;"><i data-lucide="alert-triangle" style="display:inline; vertical-align:middle;"></i> Elevated Physiological Path</span><br>
      AI Models indicate minor vital deviations. Your heart rate is slightly elevated at ${p.vitals.hr} bpm. Attending coordinator Abby has been alerted for clinical reviews.`;
    } else {
      summaryEl.innerHTML = `<span style="color: var(--alert-red); font-weight:700;"><i data-lucide="shield-alert" style="display:inline; vertical-align:middle;"></i> Urgent: Critical Path Detected</span><br>
      Sepsis probability index is currently critical at ${p.riskScore}%. Clinical action has been dispatched. High-flow oxygen is titrated, and physician is reviewing parameters.`;
    }

    const alertListContainer = document.getElementById('patient-port-alerts-container');
    alertListContainer.innerHTML = '';

    const patientAlerts = alerts.filter(a => a.patientId === currentUser && a.status === 'Active');
    if (patientAlerts.length === 0) {
      alertListContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 15px 0; font-size: 0.8rem;">No active alerts logged for you.</div>`;
    } else {
      patientAlerts.forEach(alt => {
        const div = document.createElement('div');
        div.className = "alert-row-item";
        div.style.padding = "8px 12px";
        div.innerHTML = `
          <div class="alert-row-left" style="gap: 8px;">
            <span class="alert-status-indicator ${alt.risk.toLowerCase()}"></span>
            <div class="alert-row-info">
              <span class="alert-row-patient" style="font-size: 0.75rem;">Alert: ${alt.risk} Severity</span>
              <span class="alert-row-reason" style="font-size: 0.7rem;">${alt.reason}</span>
            </div>
          </div>
          <span style="font-size: 0.65rem; color: var(--text-muted); font-weight:600;">${alt.timestamp}</span>
        `;
        alertListContainer.appendChild(div);
      });
    }

    lucide.createIcons();
    renderPatientPortalTimelineChart();
  };

  const renderPatientPortalTimelineChart = () => {
    const canvas = document.getElementById('chart-patient-risk-trend');
    if (!canvas) return;

    if (charts.patientTrend) {
      charts.patientTrend.destroy();
    }

    const p = patients.find(pat => pat.id === currentUser);
    if (!p) return;

    const ctx = canvas.getContext('2d');
    let labels = [];
    let points = [];

    if (patientTimelinePeriod === "24h") {
      labels = ['8 AM', '12 PM', '4 PM', '8 PM', '12 AM', 'Now'];
      if (p.priority === 3) {
        points = [30, 25, 28, 22, 26, p.riskScore];
      } else {
        points = [p.riskScore - 25, p.riskScore - 18, p.riskScore - 12, p.riskScore - 6, p.riskScore - 2, p.riskScore];
      }
    } else {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (p.priority === 3) {
        points = [20, 22, 28, 24, 25, 23, p.riskScore];
      } else {
        points = [30, 38, 48, 55, 68, 75, p.riskScore];
      }
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, p.priority === 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(20, 184, 166, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    charts.patientTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'AI Deterioration Risk Probability %',
          data: points,
          borderColor: p.priority === 1 ? '#EF4444' : p.priority === 2 ? '#F59E0B' : '#14B8A6',
          borderWidth: 2.5,
          pointBackgroundColor: 'white',
          pointBorderWidth: 2,
          fill: true,
          backgroundColor: gradient,
          tension: 0.35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { size: 9 } } },
          x: { ticks: { font: { size: 9 } } }
        }
      }
    });
  };

  const renderRemindersList = () => {
    const list = document.getElementById('patient-ai-reminders-list');
    if (!list) return;

    list.innerHTML = '';
    reminders.forEach((r, idx) => {
      const div = document.createElement('div');
      div.className = "staff-row";
      div.style.padding = "8px 12px";
      div.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="rem-check-${idx}" style="cursor:pointer;">
          <label for="rem-check-${idx}" style="font-size:0.75rem; cursor:pointer;">${r.text}</label>
        </div>
        <span style="font-size:0.7rem; color: var(--text-secondary); font-weight:700;">${r.time}</span>
      `;
      div.querySelector('input').addEventListener('change', () => {
        setTimeout(() => {
          reminders.splice(idx, 1);
          renderRemindersList();
          showNotification("Reminder Completed", `Cleared: "${r.text}"`);
        }, 550);
      });
      list.appendChild(div);
    });
    
    if (reminders.length === 0) {
      list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size:0.75rem;">No active schedules logged.</div>`;
    }
  };

  // --- Render Overview KPI Cards ---
  const renderKPIs = () => {
    const filteredPatients = filterPatientsByNurseScope();
    const totalPatients = filteredPatients.length; 
    document.getElementById('kpi-total-patients').textContent = totalPatients;

    const criticalCount = filteredPatients.filter(p => p.priority === 1 || p.riskScore >= 80).length;
    const criticalEl = document.getElementById('kpi-critical-patients');
    criticalEl.textContent = criticalCount;

    const sepsisCount = filteredPatients.filter(p => p.predictedRisks.sepsis === 'High').length;
    document.getElementById('kpi-sepsis-cases').textContent = sepsisCount;

    const occupiedBeds = resources.icuBeds.current;
    const totalBeds = resources.icuBeds.total;
    const icuPercent = Math.round((occupiedBeds / totalBeds) * 100);
    document.getElementById('kpi-icu-occupancy').textContent = `${icuPercent}%`;

    document.getElementById('kpi-vents').textContent = resources.ventilators.total - resources.ventilators.current;

    const activeIds = filteredPatients.map(p=>p.id);
    const alertCount = alerts.filter(a => activeIds.includes(a.patientId) && a.status === 'Active').length;
    document.getElementById('kpi-alerts').textContent = alertCount;

    renderSparkline('sparkline-patients', [totalPatients, totalPatients, totalPatients], '#0F4C81');
    renderSparkline('sparkline-critical', [1, 2, criticalCount], '#EF4444');
    renderSparkline('sparkline-sepsis', [1, 2, sepsisCount], '#F59E0B');
    renderSparkline('sparkline-icu', [75, 78, icuPercent], '#14B8A6');
    renderSparkline('sparkline-vents', [6, 8, 7], '#0F4C81');
    renderSparkline('sparkline-alerts', [2, 4, alertCount], '#EF4444');
  };

  // Helper to isolate patient list to assigned nurse N01/N02/N03 credentials scope
  const filterPatientsByNurseScope = () => {
    if (currentRole === "patient") return [];
    
    // N01/N1/N001 = P001-P003
    if (currentUser === "N01" || currentUser === "N1" || currentUser === "N001") {
      return patients.filter(p => ["P001", "P002", "P003"].includes(p.id));
    }
    // N02/N2/N002 = P004-P007
    if (currentUser === "N02" || currentUser === "N2" || currentUser === "N002") {
      return patients.filter(p => ["P004", "P005", "P006", "P007"].includes(p.id));
    }
    // N03/N3/N003 = P008-P010
    if (currentUser === "N03" || currentUser === "N3" || currentUser === "N003") {
      return patients.filter(p => ["P008", "P009", "P010"].includes(p.id));
    }
    return patients; // Fallback
  };

  const renderSparkline = (canvasId, data, color) => {
    if (charts.sparklines[canvasId]) {
      charts.sparklines[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId).getContext('2d');
    charts.sparklines[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{ data: data, borderColor: color, borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.4 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
  };

  // --- Render Priority Queue ---
  const renderPriorityQueue = () => {
    const container = document.getElementById('priority-queue-container');
    container.innerHTML = '';
    
    const filteredPatients = filterPatientsByNurseScope();
    const sortedPatients = [...filteredPatients].sort((a, b) => b.riskScore - a.riskScore);
    
    document.getElementById('queue-length-badge').textContent = `${sortedPatients.length} patients`;
    
    if (sortedPatients.length > 0 && !sortedPatients.some(p => p.id === selectedPatientId)) {
      selectedPatientId = sortedPatients[0].id;
    }

    sortedPatients.forEach(p => {
      const isSelected = p.id === selectedPatientId;
      const card = document.createElement('div');
      card.className = `patient-priority-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-patient-id', p.id);
      
      let pClass = "p3";
      if (p.priority === 1) { pClass = "p1"; }
      else if (p.priority === 2) { pClass = "p2"; }

      const timerClass = p.deteriorationTime <= 20 ? 'urgent' : '';
      const timerVal = p.priority === 3 ? 'Stable' : `${p.deteriorationTime} Minutes`;

      card.innerHTML = `
        <span class="priority-badge ${pClass}">Priority #${p.priority}</span>
        <div class="patient-card-header">
          <span class="patient-name-card">${p.name}</span>
          <span class="patient-age-card">${p.age} Y/O ${p.gender} | ${p.bed}</span>
        </div>
        <div class="patient-vitals-row">
          <div class="vital-item-mini ${p.vitals.hr > 100 ? 'alert' : ''}">
            <span class="label">HR</span>
            <span class="val">${p.vitals.hr}</span>
          </div>
          <div class="vital-item-mini ${p.vitals.bpSys < 90 ? 'alert' : ''}">
            <span class="label">BP</span>
            <span class="val">${p.vitals.bpSys}/${p.vitals.bpDia}</span>
          </div>
          <div class="vital-item-mini ${p.vitals.temp > 38.0 ? 'warning' : ''}">
            <span class="label">Temp</span>
            <span class="val">${p.vitals.temp}°C</span>
          </div>
          <div class="vital-item-mini ${p.vitals.spo2 < 90 ? 'alert' : ''}">
            <span class="label">SpO₂</span>
            <span class="val">${p.vitals.spo2}%</span>
          </div>
        </div>
        <div class="patient-card-footer">
          <span class="risk-score-pill ${p.riskScore >= 80 ? 'high' : p.riskScore >= 60 ? 'medium' : 'low'}">Risk Score: ${p.riskScore}%</span>
          <span class="deterioration-timer ${timerClass}">
            <i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${timerVal}
          </span>
        </div>
      `;
      
      card.addEventListener('click', () => {
        selectedPatientId = p.id;
        renderAll();
      });

      container.appendChild(card);
    });
    
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  };

  // --- Render Digital Health Twin ---
  const renderHealthTwin = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;
    
    document.getElementById('twin-patient-name').textContent = `${patient.name} (${patient.id})`;
    document.getElementById('twin-vital-hr').textContent = `${patient.vitals.hr} bpm`;
    document.getElementById('twin-vital-bp').textContent = `${patient.vitals.bpSys}/${patient.vitals.bpDia} mmHg`;
    document.getElementById('twin-vital-temp').textContent = `${patient.vitals.temp} °C`;
    document.getElementById('twin-vital-spo2').textContent = `${patient.vitals.spo2}%`;

    toggleBoxAlert('twin-vital-hr-box', patient.vitals.hr > 100 || patient.vitals.hr < 60);
    toggleBoxAlert('twin-vital-bp-box', patient.vitals.bpSys < 90 || patient.vitals.bpSys > 140);
    toggleBoxAlert('twin-vital-temp-box', patient.vitals.temp > 38.3 || patient.vitals.temp < 36.0);
    toggleBoxAlert('twin-vital-spo2-box', patient.vitals.spo2 < 90);

    const sepsisBadge = document.getElementById('twin-risk-sepsis');
    sepsisBadge.textContent = patient.predictedRisks.sepsis;
    sepsisBadge.className = `twin-risk-badge ${patient.predictedRisks.sepsis.toLowerCase()}`;

    const cardiacBadge = document.getElementById('twin-risk-cardiac');
    cardiacBadge.textContent = patient.predictedRisks.cardiac;
    cardiacBadge.className = `twin-risk-badge ${patient.predictedRisks.cardiac.toLowerCase()}`;

    const respBadge = document.getElementById('twin-risk-respiratory');
    respBadge.textContent = patient.predictedRisks.respiratory;
    respBadge.className = `twin-risk-badge ${patient.predictedRisks.respiratory.toLowerCase()}`;

    const heartSpot = document.querySelector('.twin-hotspot.heart');
    const lungsSpot = document.querySelector('.twin-hotspot.lungs');
    const brainSpot = document.querySelector('.twin-hotspot.brain');

    heartSpot.style.display = 'block';
    lungsSpot.style.display = 'block';
    brainSpot.style.display = 'block';

    if (patient.vitals.hr > 105) {
      heartSpot.style.transform = 'scale(1.5)';
      heartSpot.style.backgroundColor = 'var(--alert-red)';
    } else {
      heartSpot.style.transform = 'scale(1)';
      heartSpot.style.backgroundColor = 'var(--secondary-color)';
    }

    if (patient.vitals.spo2 < 91 || patient.diagnosis.includes("Pneumonia")) {
      lungsSpot.style.transform = 'scale(1.6)';
      lungsSpot.style.backgroundColor = 'var(--alert-red)';
    } else {
      lungsSpot.style.transform = 'scale(1)';
      lungsSpot.style.backgroundColor = 'var(--secondary-color)';
    }

    if (patient.diagnosis.includes("Delirium")) {
      brainSpot.style.transform = 'scale(1.5)';
      brainSpot.style.backgroundColor = 'var(--alert-red)';
    } else {
      brainSpot.style.transform = 'scale(1)';
      brainSpot.style.backgroundColor = 'var(--secondary-color)';
    }
  };

  // --- Render Sepsis Early Intel Module ---
  const renderSepsisIntel = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    document.getElementById('sepsis-probability-val').textContent = `${patient.riskScore}%`;
    document.getElementById('sepsis-confidence-val').textContent = `${patient.sepsisRisk.confidence}%`;
    document.getElementById('sepsis-recommendation-val').textContent = patient.sepsisRisk.action;

    const levelBadge = document.getElementById('sepsis-badge-level');
    levelBadge.textContent = `Sepsis: ${patient.sepsisRisk.level}`;
    levelBadge.className = `status-badge ${patient.sepsisRisk.level.toLowerCase() === 'critical' ? 'critical' : patient.sepsisRisk.level.toLowerCase() === 'high' ? 'warning' : 'stable'}`;

    const container = document.getElementById('sepsis-factors-container');
    container.innerHTML = '';
    patient.sepsisRisk.contributingFactors.forEach(factor => {
      const item = document.createElement('div');
      item.className = `sepsis-factor-item ${factor.active ? '' : 'check'}`;
      item.innerHTML = `
        <i data-lucide="${factor.active ? 'alert-triangle' : 'check'}"></i>
        <span>${factor.factor}</span>
      `;
      container.appendChild(item);
    });

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    renderSepsisGauge(patient.riskScore);
  };

  const renderSepsisGauge = (probability) => {
    if (charts.sepsisGauge) {
      charts.sepsisGauge.destroy();
    }
    const remaining = 100 - probability;
    const isCritical = probability >= 80;
    const isWarning = probability >= 50 && probability < 80;
    const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22C55E';

    const ctx = document.getElementById('chart-sepsis-gauge').getContext('2d');
    charts.sepsisGauge = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{ data: [probability, remaining], backgroundColor: [color, 'rgba(0, 0, 0, 0.05)'], borderWidth: 0, cutout: '80%' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        circumference: 180,
        rotation: 270,
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    });
  };

  // --- Render Time-To-Deterioration Engine ---
  const renderDeteriorationEngine = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const timerTextEl = document.getElementById('deterioration-timer-text');
    const stateEl = document.getElementById('det-current-state');
    const urgencyEl = document.getElementById('det-urgency-val');

    if (patient.priority === 3) {
      timerTextEl.textContent = "Stable";
      timerTextEl.style.color = "var(--success-green)";
      stateEl.textContent = "Physiologically Stable";
      urgencyEl.textContent = "No Immediate Threat";
      urgencyEl.className = "det-stat-val";
      urgencyEl.style.color = "var(--success-green)";
    } else {
      timerTextEl.textContent = `Event in: ${patient.deteriorationTime}m`;
      timerTextEl.style.color = "var(--alert-red)";
      stateEl.textContent = "Accelerated Risk Path";
      urgencyEl.textContent = `+${Math.round(patient.riskScore / 6)}% / hr`;
      urgencyEl.className = "det-stat-val critical";
      urgencyEl.style.color = "var(--alert-red)";
    }

    if (charts.deteriorationTimeline) {
      charts.deteriorationTimeline.destroy();
    }

    let points = [];
    if (patient.priority === 3) {
      points = [patient.riskScore - 10, patient.riskScore - 5, patient.riskScore, patient.riskScore - 8, patient.riskScore - 12];
    } else {
      points = [patient.riskScore - 20, patient.riskScore - 10, patient.riskScore, patient.riskScore + 4, Math.min(99, patient.riskScore + 8)];
    }

    const ctx = document.getElementById('chart-deterioration-timeline').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, patient.priority === 1 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    charts.deteriorationTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['-20m', '-10m', 'Now', '+10m', '+20m'],
        datasets: [{ data: points, borderColor: patient.priority === 1 ? '#EF4444' : patient.priority === 2 ? '#F59E0B' : '#14B8A6', borderWidth: 2, pointBackgroundColor: 'white', pointBorderWidth: 2, fill: true, backgroundColor: gradient, tension: 0.3 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { min: 0, max: 100, grid: { color: 'rgba(0, 0, 0, 0.03)' }, ticks: { font: { size: 9 }, stepSize: 25 } } }
      }
    });
  };

  // --- Render AI CMO Report Panel ---
  const renderCMOPanel = () => {
    const filteredPatients = filterPatientsByNurseScope();
    const criticalCount = filteredPatients.filter(p => p.priority === 1 || p.riskScore >= 80).length;
    
    document.getElementById('cmo-critical-count').textContent = criticalCount;
    document.getElementById('cmo-emergency-count').textContent = Math.ceil(criticalCount / 2) || (criticalCount > 0 ? 1 : 0);
    
    const overloadEl = document.getElementById('cmo-overload-risk');
    if (criticalCount >= 2) {
      overloadEl.textContent = "High Risk";
      overloadEl.className = "cmo-brief-val red";
    } else {
      overloadEl.textContent = "Medium Risk";
      overloadEl.className = "cmo-brief-val amber";
    }

    const recContainer = document.getElementById('cmo-recommendations-container');
    recContainer.innerHTML = '';

    const actions = [];
    if (criticalCount > 0) {
      actions.push({ text: `Reserve ICU bed spaces immediately. Wards forecast emergency transfer probability.`, type: 'red' });
    }
    
    const p1 = filteredPatients.find(p => p.priority === 1);
    if (p1) {
      actions.push({ text: `Assign a senior triage physician to monitor ${p1.name} in ${p1.bed}. Risk path is critical.`, type: 'red' });
    }
    actions.push({ text: "General clinical audit: Check saturation levels across ICU beds. Coordinate nursing rosters.", type: 'normal' });

    actions.forEach(act => {
      const div = document.createElement('div');
      div.className = `cmo-rec-item ${act.type === 'red' ? 'red' : ''}`;
      div.innerHTML = `
        <i data-lucide="${act.type === 'red' ? 'alert-triangle' : 'info'}" style="flex-shrink:0; width: 14px; height: 14px;"></i>
        <span>${act.text}</span>
      `;
      recContainer.appendChild(div);
    });

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  };

  // --- Render Resources Summary Dashboard ---
  const renderResourcesSummary = () => {
    const container = document.getElementById('resource-grid-container');
    if (!container) return;
    container.innerHTML = '';
    
    Object.values(resources).forEach(res => {
      const pct = Math.round((res.current / res.total) * 100);
      const isLow = pct < 45;
      const isCritical = pct < 25;
      const colorClass = isCritical ? 'red' : isLow ? 'amber' : 'green';
      
      const card = document.createElement('div');
      card.className = "resource-mini-card";
      let icon = "package";
      if (res.label.includes("Bed")) icon = "bed";
      else if (res.label.includes("Vent")) icon = "wind";
      else if (res.label.includes("Oxygen")) icon = "droplets";
      else if (res.label.includes("Doc")) icon = "stethoscope";
      else if (res.label.includes("Nurs")) icon = "heart-handshake";

      let shortageText = `<span class="res-prediction-tag"><i data-lucide="shield-check" style="width: 10px; height:10px;"></i> Stable</span>`;
      if (res.predictedShortageTime !== "None") {
        shortageText = `<span class="res-prediction-tag alert"><i data-lucide="clock" style="width: 10px; height:10px;"></i> Shortage: ${res.predictedShortageTime}</span>`;
      }

      card.innerHTML = `
        <div class="res-card-top" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="res-avail-lbl">${res.label}</span>
          <i data-lucide="${icon}"></i>
        </div>
        <div class="res-numbers" style="display:flex; align-items:baseline; gap:4px; margin-top:4px;">
          <span class="res-current-val">${res.current}</span>
          <span class="res-total-val">/ ${res.total}</span>
        </div>
        <div class="res-progress-bar" style="margin-top:6px;">
          <div class="res-progress-fill ${colorClass}" style="width: ${pct}%"></div>
        </div>
        <div style="margin-top:4px;">${shortageText}</div>
      `;
      container.appendChild(card);
    });

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  };

  // --- Render Active Alerts Ticker ---
  const renderActiveAlertsTicker = () => {
    const container = document.getElementById('alerts-ticker-container');
    container.innerHTML = '';

    const filteredPatients = filterPatientsByNurseScope();
    const activeIds = filteredPatients.map(p => p.id);
    const activeAlerts = alerts.filter(a => activeIds.includes(a.patientId) && a.status === 'Active');
    
    if (activeAlerts.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size:0.8rem;">No active alerts under your assignment.</div>`;
      return;
    }

    activeAlerts.forEach(alt => {
      const div = document.createElement('div');
      div.className = "alert-row-item";
      div.innerHTML = `
        <div class="alert-row-left">
          <span class="alert-status-indicator ${alt.risk.toLowerCase()}"></span>
          <div class="alert-row-info">
            <span class="alert-row-patient">${alt.patientName} (${alt.risk} Risk)</span>
            <span class="alert-row-reason">${alt.reason}</span>
            <span class="alert-row-time">${alt.timestamp}</span>
          </div>
        </div>
        <button class="alert-action-btn" data-alert-id="${alt.id}">Intervene</button>
      `;
      div.querySelector('.alert-action-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openPatientModal(alt.patientId);
      });
      container.appendChild(div);
    });
  };

  // --- Render Patients Table View ---
  const renderPatientsTable = () => {
    const tbody = document.getElementById('patients-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('patients-search').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-group button.active').getAttribute('data-filter');
    const filteredPatients = filterPatientsByNurseScope();

    let filtered = filteredPatients.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(searchVal) || p.id.toLowerCase().includes(searchVal) || p.diagnosis.toLowerCase().includes(searchVal);
      let matchCat = true;
      if (activeFilter === 'critical') matchCat = p.priority === 1;
      else if (activeFilter === 'high') matchCat = p.priority === 2;
      else if (activeFilter === 'stable') matchCat = p.priority === 3;
      return matchQuery && matchCat;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 40px;">No patients match search parameters.</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      let pClass = "stable";
      let pLabel = "Stable";
      if (p.priority === 1) { pClass = "critical"; pLabel = "Critical"; }
      else if (p.priority === 2) { pClass = "warning"; pLabel = "High Risk"; }

      const eventText = p.priority === 3 ? 'No imminent event' : `Deterioration: ${p.deteriorationTime}m`;

      tr.innerHTML = `
        <td>
          <div class="patient-meta">
            <div class="patient-avatar-mini">${p.name.split(' ').map(n=>n[0]).join('')}</div>
            <div class="patient-meta-details">
              <span class="patient-table-name">${p.name}</span>
              <span class="patient-table-id">${p.id} | Age: ${p.age} | ${p.gender}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600;">${p.bed}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${p.ward}</div>
        </td>
        <td>
          <span class="status-badge ${pClass}">${pLabel} (${p.riskScore}%)</span>
        </td>
        <td class="vital-tag ${p.vitals.hr > 105 ? 'alert' : ''}">${p.vitals.hr} bpm</td>
        <td class="vital-tag ${p.vitals.spo2 < 91 ? 'alert' : ''}">${p.vitals.spo2}%</td>
        <td class="vital-tag ${p.vitals.temp > 38.3 ? 'warning' : ''}">${p.vitals.temp}°C</td>
        <td style="font-weight: 600; color: ${p.priority === 1 ? 'var(--alert-red)' : 'var(--text-secondary)'};">
          ${eventText}
        </td>
        <td>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="openPatientModal('${p.id}')">
            View Details
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  };

  // --- Render Detailed Alerts Page ---
  const renderDetailedAlertsPage = () => {
    const container = document.getElementById('alerts-detailed-container');
    if (!container) return;
    container.innerHTML = '';
    
    const activeFilter = document.querySelector('[data-alert-filter].active').getAttribute('data-alert-filter');
    const filteredPatients = filterPatientsByNurseScope();
    const activeIds = filteredPatients.map(p => p.id);

    let filteredAlerts = alerts.filter(a => {
      const matchScope = activeIds.includes(a.patientId);
      let matchSeverity = true;
      if (activeFilter !== 'all') {
        matchSeverity = a.risk === activeFilter;
      }
      return matchScope && matchSeverity;
    });

    if (filteredAlerts.length === 0) {
      container.innerHTML = `<div class="glass-card" style="padding: 40px; text-align: center; color: var(--text-muted);">No logs match active scopes.</div>`;
      return;
    }

    filteredAlerts.forEach(alt => {
      const card = document.createElement('div');
      card.className = `alert-card-detailed ${alt.risk.toLowerCase()} glass-card`;
      const isResolved = alt.status === 'Resolved';
      const indicatorClass = alt.risk.toLowerCase();

      card.innerHTML = `
        <div class="alert-card-left">
          <div class="alert-detailed-icon ${indicatorClass}">
            <i data-lucide="${alt.risk === 'Critical' ? 'shield-alert' : alt.risk === 'High' ? 'alert-triangle' : 'info'}"></i>
          </div>
          <div class="alert-detailed-info">
            <div class="alert-det-header">
              <span class="alert-det-title">${alt.patientName} (${alt.patientId})</span>
              <span class="status-badge ${alt.risk.toLowerCase()}">${alt.risk} Severity</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight:600;"><i data-lucide="clock" style="width:10px; height:10px; display:inline;"></i> ${alt.timestamp}</span>
            </div>
            <div class="alert-det-reason"><strong>Trigger Reason:</strong> ${alt.reason}</div>
            <div class="alert-det-rec"><i data-lucide="activity"></i> <strong>AI Action Directive:</strong> ${alt.recommendation}</div>
          </div>
        </div>
        <div class="alert-card-actions">
          ${isResolved ? '<span style="color: var(--success-green); font-weight: 700; font-size: 0.85rem;"><i data-lucide="check-circle2"></i> Resolved</span>' : `
            <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.75rem;" onclick="resolveAlert('${alt.id}')">Resolve Alert</button>
            <button class="btn btn-primary" style="padding: 8px 16px; font-size: 0.75rem;" onclick="openPatientModal('${alt.patientId}')">Intervene</button>
          `}
        </div>
      `;
      container.appendChild(card);
    });

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  };

  // --- Render Resources Detailed View ---
  const renderResourcesPage = () => {
    const grid = document.getElementById('resources-page-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.values(resources).forEach(res => {
      const pct = Math.round((res.current / res.total) * 100);
      let statusClass = "green";
      let statusText = "Optimal Supply";

      if (pct < 30) {
        statusClass = "red";
        statusText = "Severe Shortage Risk";
      } else if (pct < 55) {
        statusClass = "amber";
        statusText = "Guarded Supply Levels";
      }

      const card = document.createElement('div');
      card.className = "resource-card-detailed glass-card";
      let icon = "package";
      if (res.label.includes("Bed")) icon = "bed";
      else if (res.label.includes("Vent")) icon = "wind";
      else if (res.label.includes("Oxygen")) icon = "droplets";
      else if (res.label.includes("Doc")) icon = "stethoscope";
      else if (res.label.includes("Nurs")) icon = "heart-handshake";

      card.innerHTML = `
        <div class="res-card-heading">
          <h3>${res.label}</h3>
          <i data-lucide="${icon}"></i>
        </div>
        <span class="res-large-num">${res.current}<span style="font-size: 1.25rem; font-weight:500; color: var(--text-muted);"> / ${res.total}</span></span>
        <div class="res-progress-bar" style="height: 8px;">
          <div class="res-progress-fill ${statusClass}" style="width: ${pct}%;"></div>
        </div>
        <div class="res-status-message ${statusClass}">${statusText}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: -6px;">
          Next-Hour Demand Index: <strong>+${Math.round(100 - pct + 12)}%</strong>
        </div>
      `;
      grid.appendChild(card);
    });

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  };

  const renderRoster = () => {
    const roster = document.getElementById('staff-roster-container');
    if (!roster) return;

    const activeNurseName = hospitalData.authUsers[currentUser]?.nurseName || "Dr. Sarah Mercer";

    roster.innerHTML = `
      <div class="staff-row">
        <div class="staff-info-col">
          <div class="staff-avatar">${activeNurseName.split(' ').map(n=>n[0]).join('')}</div>
          <div>
            <div class="staff-name">${activeNurseName}</div>
            <div class="staff-role">Assigned Coordinator (On Duty)</div>
          </div>
        </div>
        <span class="staff-status-badge available">On Command</span>
      </div>
      <div class="staff-row">
        <div class="staff-info-col">
          <div class="staff-avatar">JC</div>
          <div>
            <div class="staff-name">Dr. Jonathan Choi</div>
            <div class="staff-role">ICU Attending Physician</div>
          </div>
        </div>
        <span class="staff-status-badge busy">In ICU Bed-01</span>
      </div>
      <div class="staff-row">
        <div class="staff-info-col">
          <div class="staff-avatar">TL</div>
          <div>
            <div class="staff-name">Dr. Tasha Lopez</div>
            <div class="staff-role">Sepsis Triage Specialist</div>
          </div>
        </div>
        <span class="staff-status-badge on-call">On-Call</span>
      </div>
    `;
  };

  // --- Render Ward Patient Heatmap (5x2 Bed grid display representing P001-P010) ---
  const renderHeatmap = () => {
    const grid = document.getElementById('heatmap-beds-grid');
    if (!grid) return;
    grid.innerHTML = '';

    patients.forEach(pat => {
      const cell = document.createElement('div');
      cell.className = "heatmap-bed-cell";
      
      let riskClass = "risk-stable";
      let scoreClass = "low";
      if (pat.priority === 1) {
        riskClass = "risk-critical";
        scoreClass = "high";
      } else if (pat.priority === 2) {
        riskClass = "risk-warning";
        scoreClass = "med";
      }
      
      cell.className += ` ${riskClass}`;
      cell.setAttribute('data-patient-id', pat.id);
      cell.innerHTML = `
        <div class="bed-header-row">
          <span class="bed-number-lbl">${pat.bed}</span>
          <span class="bed-indicator-dot"></span>
        </div>
        <span class="bed-patient-name" style="font-weight: 700;">${pat.name}</span>
        <span class="bed-risk-value ${scoreClass}">Risk: ${pat.riskScore}%</span>
      `;
      cell.addEventListener('click', () => {
        openPatientModal(pat.id);
      });
      grid.appendChild(cell);
    });
  };

  const renderDashboardCharts = () => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if (patient) {
      renderSepsisGauge(patient.riskScore);
    }
  };

  const renderResourcesCharts = () => {
    if (charts.resourceHistory) {
      charts.resourceHistory.destroy();
    }
    const ctx = document.getElementById('chart-resource-history').getContext('2d');
    charts.resourceHistory = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'],
        datasets: [
          { label: 'ICU Beds Occupied', data: [14, 15, 17, 18, 18, 17, 18, 18], borderColor: '#0F4C81', borderWidth: 2, tension: 0.3, fill: false },
          { label: 'Ventilators In Use', data: [5, 6, 6, 7, 8, 8, 8, 8], borderColor: '#14B8A6', borderWidth: 2, tension: 0.3, fill: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { font: { family: 'Inter', size: 10 } } } }
      }
    });
  };

  const renderInsightsCharts = () => {
    if (charts.sepsisTrends) {
      charts.sepsisTrends.destroy();
    }
    const ctxSepsis = document.getElementById('chart-sepsis-trends').getContext('2d');
    charts.sepsisTrends = new Chart(ctxSepsis, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'Sepsis Pathways Prevented', data: [12, 19, 14, 22, 17, 28, 25], backgroundColor: 'rgba(20, 184, 166, 0.75)', borderRadius: 4 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    if (charts.deptHealth) {
      charts.deptHealth.destroy();
    }
    const ctxDept = document.getElementById('chart-department-health').getContext('2d');
    charts.deptHealth = new Chart(ctxDept, {
      type: 'bar',
      data: {
        labels: departments.map(d => d.name),
        datasets: [{ label: 'System Load %', data: departments.map(d => d.patients), backgroundColor: '#0F4C81', borderRadius: 4 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    });
  };

  // --- Patient Details Modal logic ---
  window.openPatientModal = (patientId) => {
    const p = patients.find(pat => pat.id === patientId);
    if (!p) return;

    document.getElementById('modal-patient-name').textContent = p.name;
    document.getElementById('modal-patient-id').textContent = `ID: ${p.id}`;
    document.getElementById('modal-patient-age').textContent = `Age: ${p.age}`;
    document.getElementById('modal-patient-bed').textContent = `Bed: ${p.bed}`;
    
    const priBadge = document.getElementById('modal-patient-priority');
    priBadge.textContent = `Priority #${p.priority}`;
    priBadge.className = `modal-pill ${p.priority === 1 ? 'red' : p.priority === 2 ? 'warning' : 'stable'}`;
    if (p.priority === 2) priBadge.style.backgroundColor = 'var(--warning-amber)';
    if (p.priority === 3) priBadge.style.backgroundColor = 'var(--success-green)';

    document.getElementById('modal-patient-diag').textContent = p.diagnosis;
    document.getElementById('modal-patient-history').textContent = p.history;
    document.getElementById('modal-patient-meds').textContent = p.medications;
    document.getElementById('modal-patient-allergies').textContent = p.allergies;
    
    document.getElementById('modal-vital-hr').textContent = `${p.vitals.hr} bpm`;
    document.getElementById('modal-vital-bp').textContent = `${p.vitals.bpSys}/${p.vitals.bpDia} mmHg`;
    document.getElementById('modal-vital-temp').textContent = `${p.vitals.temp} °C`;
    document.getElementById('modal-vital-spo2').textContent = `${p.vitals.spo2}%`;
    document.getElementById('modal-vital-rr').textContent = `${p.vitals.rr} /min`;

    toggleModalVitalAlert('modal-vital-hr', p.vitals.hr > 105);
    toggleModalVitalAlert('modal-vital-bp', p.vitals.bpSys < 90);
    toggleModalVitalAlert('modal-vital-temp', p.vitals.temp > 38.3);
    toggleModalVitalAlert('modal-vital-spo2', p.vitals.spo2 < 91);

    document.getElementById('modal-ai-recommendations').textContent = p.sepsisRisk.action;
    document.getElementById('modal-patient-notes').value = p.notes;
    document.getElementById('modal-patient-notes').setAttribute('data-patient-id', p.id);

    const actionsPanel = document.getElementById('modal-nurse-actions-section');
    const notesTextarea = document.getElementById('modal-patient-notes');
    const saveNotesBtn = document.getElementById('modal-btn-save-notes');
    
    if (currentRole === "patient") {
      actionsPanel.style.display = "none";
      notesTextarea.readOnly = true;
      saveNotesBtn.style.display = "none";
    } else {
      actionsPanel.style.display = "block";
      notesTextarea.readOnly = false;
      saveNotesBtn.style.display = "inline-block";
      document.getElementById('modal-action-status').value = p.priority;
    }

    document.getElementById('patient-details-modal').classList.add('active');
  };

  const toggleModalVitalAlert = (elementId, isAlert) => {
    const el = document.getElementById(elementId);
    if (isAlert) {
      el.className = "modal-vital-indicator alert";
    } else {
      el.className = "modal-vital-indicator stable";
    }
  };

  const closeModal = () => {
    document.getElementById('patient-details-modal').classList.remove('active');
  };

  // --- Real-time Physiology Data Simulator (P008 critical, P010 medium, others normal) ---
  const startLiveSimulator = () => {
    setInterval(() => {
      patients.forEach(p => {
        if (p.id === "P008") {
          p.priority = 1;
          p.vitals.hr = fluctuateValue(p.vitals.hr, 115, 128, 1);
          p.vitals.spo2 = fluctuateValue(p.vitals.spo2, 83, 89, 1);
          p.vitals.temp = parseFloat(fluctuateValue(p.vitals.temp, 38.8, 39.5, 0.1).toFixed(1));
          p.riskScore = 92;
          if (p.deteriorationTime > 2) p.deteriorationTime -= 1;
          else p.deteriorationTime = 18;
        } 
        else if (p.id === "P010") {
          p.priority = 2;
          p.vitals.hr = fluctuateValue(p.vitals.hr, 100, 110, 1);
          p.vitals.spo2 = fluctuateValue(p.vitals.spo2, 90, 93, 1);
          p.vitals.temp = parseFloat(fluctuateValue(p.vitals.temp, 37.9, 38.4, 0.1).toFixed(1));
          p.riskScore = 72;
          if (p.deteriorationTime > 2) p.deteriorationTime -= 1;
          else p.deteriorationTime = 45;
        } 
        else {
          p.priority = 3;
          p.vitals.hr = fluctuateValue(p.vitals.hr, 68, 80, 1);
          p.vitals.spo2 = fluctuateValue(p.vitals.spo2, 96, 99, 1);
          p.vitals.temp = parseFloat(fluctuateValue(p.vitals.temp, 36.5, 37.2, 0.1).toFixed(1));
          p.riskScore = 20;
          p.deteriorationTime = 0;
        }
      });
      renderAll();
    }, 4000);
  };

  const fluctuateValue = (curr, minVal, maxVal, step) => {
    const delta = (Math.random() > 0.5 ? 1 : -1) * step;
    let nextVal = curr + delta;
    if (nextVal > maxVal) nextVal = maxVal;
    if (nextVal < minVal) nextVal = minVal;
    return nextVal;
  };

  // ==========================================================================
  // PATIENT AI PORTAL CONTROLLER LOGIC (DEPLOYMENT BUILD)
  // ==========================================================================
  const chatInput = document.getElementById('patient-chat-input');
  const chatSendBtn = document.getElementById('btn-patient-chat-send');
  const chatMessages = document.getElementById('patient-chat-messages');
  const chatTypeDoubt = document.getElementById('btn-chat-type-doubt');
  const chatTypeRequest = document.getElementById('btn-chat-type-request');
  const dispatchLogs = document.getElementById('patient-ai-dispatch-logs');

  if (chatTypeDoubt && chatTypeRequest) {
    chatTypeDoubt.addEventListener('click', () => {
      chatType = "doubt";
      chatTypeDoubt.classList.add('active');
      chatTypeRequest.classList.remove('active');
      chatInput.placeholder = "Type your doubt or question about your health...";
    });
    chatTypeRequest.addEventListener('click', () => {
      chatType = "request";
      chatTypeRequest.classList.add('active');
      chatTypeDoubt.classList.remove('active');
      chatInput.placeholder = "Type request: e.g. 'I need water', 'I need restroom help', or 'I feel suffocated'...";
    });
  }

  const handleSendChatMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";
    appendChatBubble("patient", text);

    const p = patients.find(pat => pat.id === currentUser) || { vitals: {}, diagnosis: "", history: "" };

    let responseData = null;
    try {
      const res = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          patient_id: currentUser,
          vitals: p.vitals,
          diagnosis: p.diagnosis,
          history_summary: p.history,
          attender_number: attenderPhone,
          type: chatType
        })
      });
      if (res.ok) {
        responseData = await res.json();
      }
    } catch (e) {
      console.warn("[CareMind AI] Python backend offline. Running backup local classification simulation.", e);
    }

    if (!responseData) {
      responseData = simulateLocalAIFallback(text, p.vitals, p.diagnosis, p.history);
    }

    appendChatBubble("ai", responseData.response);

    if (responseData.reminder) {
      reminders.push(responseData.reminder);
      renderRemindersList();
    }

    handleDispatchedAlerts(responseData);
  };

  const appendChatBubble = (sender, text) => {
    const isPatient = sender === "patient";
    const bubble = document.createElement('div');
    bubble.style.display = 'flex';
    bubble.style.gap = '10px';
    bubble.style.alignSelf = isPatient ? 'flex-end' : 'flex-start';
    bubble.style.maxWidth = '80%';

    bubble.innerHTML = `
      ${!isPatient ? `
        <div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(20, 184, 166, 0.1); color: var(--secondary-color); display:flex; align-items:center; justify-content:center; flex-shrink: 0;">
          <i data-lucide="bot" style="width: 18px; height:18px;"></i>
        </div>
      ` : ''}
      <div style="background: ${isPatient ? 'linear-gradient(135deg, var(--primary-color) 0%, #175e9b 100%)' : '#F1F5F9'}; 
                  color: ${isPatient ? 'white' : 'var(--text-primary)'}; 
                  border: 1px solid rgba(0,0,0,0.03); 
                  border-radius: ${isPatient ? '12px 0 12px 12px' : '0 12px 12px 12px'}; 
                  padding: 10px 14px; 
                  font-size: 0.825rem; 
                  line-height: 1.45;">
        ${text}
      </div>
    `;

    chatMessages.appendChild(bubble);
    lucide.createIcons();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const simulateLocalAIFallback = (msg, vitals, diagnosis, history) => {
    const msgLower = msg.toLowerCase();
    let classification = chatType;
    let notify_attendant = false;
    let notify_nurse = false;
    let priority = "Low";
    let dispatch_message = "";
    let response = "";
    let reminder = null;

    if (classification === "request" || anyWord(msgLower, ["water", "food", "blanket", "restroom", "toilet", "walk", "suffocat", "breathing", "pain", "dizzy", "nurse", "attender"])) {
      classification = "request";
      
      if (anyWord(msgLower, ["suffocat", "breathing", "chest pain", "pain", "fall"])) {
        notify_nurse = true;
        notify_attendant = true;
        priority = "High";
        dispatch_message = `Critical: Patient ${currentUser} reports severe distress: "${msg}". Saturation checking required.`;
        response = "I have paged the emergency nurse team and paged your attendant immediately. Clinical staff are rushing to your bedside now.";
      } 
      else if (anyWord(msgLower, ["restroom", "toilet", "walk", "urine"])) {
        notify_attendant = true;
        priority = "Medium";
        dispatch_message = `Alert: Patient ${currentUser} requires restroom assistance.`;
        response = "I have alerted your attendant to assist you to the restroom.";
      }
      else {
        notify_attendant = true;
        priority = "Low";
        dispatch_message = `Request: Patient ${currentUser} needs water / comfort items.`;
        response = "I have requested your attendant to bring comfort items to your room.";
      }
    } else {
      classification = "doubt";
      const hr = vitals.hr || 72;
      const spo2 = vitals.spo2 || 98;
      
      if (msgLower.includes("remind")) {
        response = "I have set an AI reminder for your scheduled clinical check.";
        reminder = { text: "AI Diagnostic checkup", time: "10:30 PM" };
      } else if (msgLower.includes("vital") || msgLower.includes("heart") || msgLower.includes("spo2")) {
        response = `Your current vitals: Heart Rate is ${hr} bpm (normal is 60-100) and Oxygen is ${spo2}% (normal is 95-100%). Continue standard treatments.`;
      } else {
        response = `Under your active diagnosis of '${diagnosis}', we are monitoring your logs closely. Feel free to ask if you need restroom help or water.`;
      }
    }

    return { classification, response, notify_attendant, notify_nurse, dispatch_message, priority, reminder };
  };

  const anyWord = (str, words) => words.some(w => str.includes(w));

  // Handle Dispatches - hardcoded to route SMS log outputs to both 9677555064 and 6379119254
  const handleDispatchedAlerts = (data) => {
    if (!dispatchLogs) return;

    const pat = patients.find(p => p.id === currentUser) || { name: "Patient", bed: "Bed" };

    if (data.notify_attendant || data.notify_nurse) {
      if (dispatchLogs.innerHTML.includes("No active dispatch")) {
        dispatchLogs.innerHTML = '';
      }

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (data.notify_attendant) {
        const item = document.createElement('div');
        item.style.padding = '8px 12px';
        item.style.background = 'rgba(20, 184, 166, 0.08)';
        item.style.borderLeft = '3px solid var(--secondary-color)';
        item.style.borderRadius = '4px';
        item.style.fontSize = '0.75rem';
        item.style.lineHeight = '1.35';
        item.style.marginBottom = '6px';
        item.innerHTML = `
          <strong>[SMS SENT to Admin Mobiles: 9677555064 & 6379119254]</strong><br>
          <span style="color: var(--text-secondary);">${data.dispatch_message}</span>
          <div style="font-size:0.6rem; color:var(--text-muted); text-align:right; margin-top:2px;">${time}</div>
        `;
        dispatchLogs.prepend(item);
        showNotification("Attendant Paged", "SMS alerts successfully dispatched to admin mobiles (9677555064, 6379119254).");
      }

      if (data.notify_nurse) {
        const item = document.createElement('div');
        item.style.padding = '8px 12px';
        item.style.background = 'rgba(239, 68, 68, 0.08)';
        item.style.borderLeft = '3px solid var(--alert-red)';
        item.style.borderRadius = '4px';
        item.style.fontSize = '0.75rem';
        item.style.lineHeight = '1.35';
        item.style.marginBottom = '6px';
        item.innerHTML = `
          <strong>[NURSE ALERT DISPATCHED]</strong><br>
          <span style="color: var(--text-secondary);">${data.dispatch_message}</span>
          <div style="font-size:0.6rem; color:var(--text-muted); text-align:right; margin-top:2px;">${time}</div>
        `;
        dispatchLogs.prepend(item);
        showNotification("Nurse Alerted", "Critical alarm dispatched to hospital coordinator panel.");

        // Inject alert into database to show up on nurse screen!
        alerts.unshift({
          id: `A-${500 + alerts.length + 1}`,
          patientName: pat.name,
          patientId: currentUser,
          risk: data.priority || "High",
          reason: `Patient AI Alert: ${data.dispatch_message || 'Distress Alarm'}`,
          recommendation: "Immediate patient bedside assessment. Titrate oxygen if needed.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "Active"
        });

        // Also change patient status to Critical so their visual card pulses red on nurse dashboard!
        const patIndex = patients.findIndex(p => p.id === currentUser);
        if (patIndex !== -1) {
          patients[patIndex].priority = 1;
          patients[patIndex].riskScore = Math.max(92, patients[patIndex].riskScore);
          patients[patIndex].vitals.hr = 120;
          patients[patIndex].vitals.spo2 = 88;
        }
      }
    }
  };

  // --- Setting Up Event Listeners ---
  const setupEventListeners = () => {
    if (chatSendBtn && chatInput) {
      chatSendBtn.addEventListener('click', handleSendChatMessage);
      chatInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          handleSendChatMessage();
        }
      });
    }

    document.querySelectorAll('.filter-group button[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-group button[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPatientsTable();
      });
    });

    document.getElementById('patients-search').addEventListener('input', () => {
      renderPatientsTable();
    });

    document.querySelectorAll('[data-alert-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-alert-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDetailedAlertsPage();
      });
    });

    document.getElementById('modal-btn-save-notes').addEventListener('click', () => {
      if (currentRole === "patient") return; 
      const patientId = document.getElementById('modal-patient-notes').getAttribute('data-patient-id');
      const notesVal = document.getElementById('modal-patient-notes').value;
      const statusVal = parseInt(document.getElementById('modal-action-status').value);
      
      const patIndex = patients.findIndex(p => p.id === patientId);
      if (patIndex !== -1) {
        patients[patIndex].notes = notesVal;
        if (patients[patIndex].priority !== statusVal) {
          patients[patIndex].priority = statusVal;
          if (statusVal === 3) {
            patients[patIndex].riskScore = 28;
            patients[patIndex].sepsisRisk.level = "LOW";
            patients[patIndex].vitals.hr = 74;
            patients[patIndex].vitals.spo2 = 98;
          } else if (statusVal === 2) {
            patients[patIndex].riskScore = 65;
            patients[patIndex].sepsisRisk.level = "HIGH";
          } else {
            patients[patIndex].riskScore = 90;
            patients[patIndex].sepsisRisk.level = "CRITICAL";
          }
        }
        showNotification("Clinical Action Saved", `Physician notes and priority updated for ${patients[patIndex].name}.`);
      }
      closeModal();
      renderAll();
    });

    document.getElementById('modal-action-escalate').addEventListener('click', () => {
      if (currentRole === "patient") return;
      const patientId = document.getElementById('modal-patient-notes').getAttribute('data-patient-id');
      const p = patients.find(pat => pat.id === patientId);
      if (p) {
        showNotification("Case Escalated", `Telemetry data for ${p.name} dispatched to Attending Medical Officer.`);
        alerts.unshift({
          id: `A-${500 + alerts.length + 1}`,
          patientName: p.name,
          patientId: p.id,
          risk: "High",
          reason: `Nurse Escalation: Attending coordinator initiated emergency consult protocol.`,
          recommendation: "Immediate registrar consult on patient telemetry pathways.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "Active"
        });
        closeModal();
        renderAll();
      }
    });

    document.getElementById('modal-action-resolve').addEventListener('click', () => {
      if (currentRole === "patient") return;
      const patientId = document.getElementById('modal-patient-notes').getAttribute('data-patient-id');
      let resolvedCount = 0;
      alerts.forEach(a => {
        if (a.patientId === patientId && a.status === 'Active') {
          a.status = 'Resolved';
          resolvedCount++;
        }
      });

      const patIndex = patients.findIndex(p => p.id === patientId);
      if (patIndex !== -1) {
        patients[patIndex].priority = 3;
        patients[patIndex].riskScore = 25;
        patients[patIndex].sepsisRisk.level = "LOW";
        patients[patIndex].vitals.hr = 75;
        patients[patIndex].vitals.spo2 = 98;
        patients[patIndex].vitals.temp = 36.8;
      }

      if (resolvedCount > 0) {
        showNotification("Alarms Resolved", `Cleared ${resolvedCount} vital signs alarm alerts for patient.`);
      } else {
        showNotification("Vitals Recalibrated", `Patient physiological indexes stabilized.`);
      }
      closeModal();
      renderAll();
    });

    const trend24h = document.getElementById('patient-trend-24h');
    const trend7d = document.getElementById('patient-trend-7d');
    if (trend24h && trend7d) {
      trend24h.addEventListener('click', () => {
        trend24h.classList.add('active');
        trend7d.classList.remove('active');
        patientTimelinePeriod = "24h";
        renderPatientPortalTimelineChart();
      });
      trend7d.addEventListener('click', () => {
        trend7d.classList.add('active');
        trend24h.classList.remove('active');
        patientTimelinePeriod = "7d";
        renderPatientPortalTimelineChart();
      });
    }

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-btn-cancel').addEventListener('click', closeModal);
    
    document.querySelectorAll('.btn-report-export').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-report-type');
        let filename = "";
        let classification = "";
        switch(type) {
          case 'daily_summary':
            filename = `caremind_daily_summary_${new Date().toISOString().split('T')[0]}.csv`;
            classification = "Daily Census";
            break;
          case 'critical_events':
            filename = `caremind_critical_incident_logs_${new Date().toISOString().split('T')[0]}.csv`;
            classification = "Critical Incidents";
            break;
          case 'resource_forecast':
            filename = `caremind_resource_forecast_${new Date().toISOString().split('T')[0]}.csv`;
            classification = "Forecasting Logistics";
            break;
          case 'patient_triage':
            filename = `caremind_patient_triage_risk_${new Date().toISOString().split('T')[0]}.csv`;
            classification = "Triage Indexes";
            break;
        }

        const tbody = document.getElementById('export-history-table-body');
        if (tbody) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><i data-lucide="file-spreadsheet" style="vertical-align: middle; margin-right: 8px; color: var(--success-green);"></i> ${filename}</td>
            <td>${classification}</td>
            <td>Today, ${new Date().toLocaleTimeString()}</td>
            <td>Dr. Sarah Mercer</td>
            <td><span style="color: var(--primary-color); font-weight: 700; cursor: pointer; text-decoration:underline;">Download</span></td>
          `;
          tbody.prepend(tr);
          lucide.createIcons();
        }
        showNotification("CSV Report Exported", `Report successfully generated as ${filename}. Check your system download folder.`);
      });
    });

    document.getElementById('notification-bell-btn').addEventListener('click', () => {
      switchTab('alerts');
      showNotification("Triage Inbox Focused", "Displaying all live physiological alerts and patient telemetry logs.");
    });
  };

  init();
});
