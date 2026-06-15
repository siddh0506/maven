// CareMind AI Landing Page Interactions

document.addEventListener('DOMContentLoaded', () => {
  // Animated Counter Logic
  const animateCounters = () => {
    const monitorsEl = document.getElementById('counter-monitors');
    const sepsisEl = document.getElementById('counter-sepsis');
    const responseEl = document.getElementById('counter-response');

    if (!monitorsEl || !sepsisEl || !responseEl) return;

    // Reset values to start animation
    monitorsEl.textContent = '0';
    sepsisEl.textContent = '0.0%';
    responseEl.textContent = '0m';

    // 1. Monitors Counter (0 to 142)
    let monitorsCount = 0;
    const monitorsTarget = 142;
    const monitorsInterval = setInterval(() => {
      monitorsCount += Math.ceil(monitorsTarget / 30);
      if (monitorsCount >= monitorsTarget) {
        monitorsCount = monitorsTarget;
        clearInterval(monitorsInterval);
      }
      monitorsEl.textContent = monitorsCount.toLocaleString();
    }, 40);

    // 2. Sepsis Averted Counter (0 to 98.4%)
    let sepsisCount = 0;
    const sepsisTarget = 98.4;
    const sepsisInterval = setInterval(() => {
      sepsisCount += 3.2;
      if (sepsisCount >= sepsisTarget) {
        sepsisCount = sepsisTarget;
        clearInterval(sepsisInterval);
      }
      sepsisEl.textContent = sepsisCount.toFixed(1) + '%';
    }, 45);

    // 3. Response Buffer Counter (0 to -22m)
    let responseCount = 0;
    const responseTarget = -22;
    const responseInterval = setInterval(() => {
      responseCount -= 1;
      if (responseCount <= responseTarget) {
        responseCount = responseTarget;
        clearInterval(responseInterval);
      }
      responseEl.textContent = responseCount + 'm';
    }, 50);
  };

  // Run immediately on page load
  animateCounters();

  // ==========================================================================
  // AUTHENTICATION MODAL LOGIC
  // ==========================================================================
  const loginModal = document.getElementById('login-modal');
  const launchBtn = document.getElementById('btn-launch-command');
  const insightsBtn = document.getElementById('btn-view-insights');
  const closeBtn = document.getElementById('login-close-btn');
  const cancelBtn = document.getElementById('login-cancel-btn');
  const submitBtn = document.getElementById('login-submit-btn');
  
  const nurseTab = document.getElementById('tab-login-nurse');
  const patientTab = document.getElementById('tab-login-patient');
  
  const idLabel = document.getElementById('lbl-login-id');
  const idInput = document.getElementById('login-id-input');
  const passInput = document.getElementById('login-pass-input');
  const attenderGroup = document.getElementById('login-attender-group');
  const attenderInput = document.getElementById('login-attender-input');
  const errorMsg = document.getElementById('login-error-msg');
  
  let currentLoginRole = "nurse"; // Default tab
  let redirectTarget = "dashboard"; // Tab name target in dashboard
  
  // Open modal triggers
  if (launchBtn) {
    launchBtn.addEventListener('click', () => {
      redirectTarget = "dashboard";
      openLoginModal();
    });
  }
  
  if (insightsBtn) {
    insightsBtn.addEventListener('click', () => {
      redirectTarget = "insights";
      openLoginModal();
    });
  }
  
  const openLoginModal = () => {
    loginModal.classList.add('active');
    idInput.value = "";
    passInput.value = "";
    if (attenderInput) attenderInput.value = "";
    errorMsg.style.display = "none";
    setLoginRole(currentLoginRole);
  };
  
  const closeLoginModal = () => {
    loginModal.classList.remove('active');
  };
  
  // Close triggers
  if (closeBtn) closeBtn.addEventListener('click', closeLoginModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeLoginModal);
  
  // Tab toggles
  if (nurseTab) {
    nurseTab.addEventListener('click', () => {
      setLoginRole("nurse");
    });
  }
  
  if (patientTab) {
    patientTab.addEventListener('click', () => {
      setLoginRole("patient");
    });
  }
  
  const setLoginRole = (role) => {
    currentLoginRole = role;
    errorMsg.style.display = "none";
    
    if (role === "nurse") {
      nurseTab.classList.add('active');
      patientTab.classList.remove('active');
      idLabel.textContent = "Nurse / Coordinator ID";
      idInput.placeholder = "e.g. N001";
      if (attenderGroup) attenderGroup.style.display = "none";
    } else {
      patientTab.classList.add('active');
      nurseTab.classList.remove('active');
      idLabel.textContent = "Patient ID";
      idInput.placeholder = "e.g. P001";
      if (attenderGroup) attenderGroup.style.display = "flex";
    }
  };
  
  // Authenticate Access
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const enteredId = idInput.value.trim().toUpperCase();
      const enteredPass = passInput.value;
      
      const userRecord = hospitalData.authUsers[enteredId];
      
      if (userRecord && userRecord.role === currentLoginRole && userRecord.password === enteredPass) {
        // Successful login
        localStorage.setItem('caremind_role', currentLoginRole);
        localStorage.setItem('caremind_user', enteredId);
        
        // Save attender phone if patient is logging in
        if (currentLoginRole === "patient" && attenderInput) {
          const phone = attenderInput.value.trim() || "+1 (555) 019-9234"; // default if left blank
          localStorage.setItem('caremind_attender_phone', phone);
        }
        
        errorMsg.style.display = "none";
        closeLoginModal();
        
        // Redirect to dashboard with parameters
        if (currentLoginRole === "patient") {
          // Patients always land on their portal
          window.location.href = "dashboard.html?tab=patient-portal";
        } else {
          window.location.href = `dashboard.html?tab=${redirectTarget}`;
        }
      } else {
        // Failed login
        errorMsg.style.display = "block";
      }
    });
  }
  
  // Enter key support in input
  [idInput, passInput, attenderInput].forEach(input => {
    if (input) {
      input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      });
    }
  });
});
