// ===== FIELD REFERENCES =====
const fields = {
  nome:     { input: document.getElementById('nome'),     wrap: document.getElementById('f-nome'),     errEl: null },
  cognome:  { input: document.getElementById('cognome'),  wrap: document.getElementById('f-cognome'),  errEl: null },
  telefono: { input: document.getElementById('telefono'), wrap: document.getElementById('f-telefono'), errEl: document.getElementById('tel-err') },
  email:    { input: document.getElementById('email'),    wrap: document.getElementById('f-email'),    errEl: document.getElementById('email-err') },
};

const privacyCheck  = document.getElementById('privacy');
const checkWrap     = document.getElementById('check-wrap');
const privacyErrEl  = document.getElementById('privacy-err');
const submitBtn     = document.getElementById('submitBtn');
const formView      = document.getElementById('formView');
const successView   = document.getElementById('successView');

// ===== VALIDATORS =====
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v) {
  return /^[\d\s\+\-\(\)]{7,}$/.test(v.trim());
}

// ===== ERROR HELPERS =====
function setError(key, msg) {
  const f = fields[key];
  f.wrap.classList.add('has-error');
  f.input.classList.add('error');
  if (f.errEl && msg) f.errEl.textContent = msg;
}

function clearError(key) {
  const f = fields[key];
  f.wrap.classList.remove('has-error');
  f.input.classList.remove('error');
}

// ===== LIVE CLEAR ON INPUT =====
Object.keys(fields).forEach(key => {
  fields[key].input.addEventListener('input', () => clearError(key));
});

privacyCheck.addEventListener('change', () => {
  checkWrap.classList.remove('has-error');
  privacyErrEl.classList.remove('show');
});

// ===== SUBMIT HANDLER =====
submitBtn.addEventListener('click', () => {
  let valid = true;

  // Nome
  if (!fields.nome.input.value.trim()) {
    setError('nome', null);
    valid = false;
  } else {
    clearError('nome');
  }

  // Cognome
  if (!fields.cognome.input.value.trim()) {
    setError('cognome', null);
    valid = false;
  } else {
    clearError('cognome');
  }

  // Telefono
  const telVal = fields.telefono.input.value;
  if (!telVal.trim()) {
    setError('telefono', 'Campo obbligatorio');
    valid = false;
  } else if (!isValidPhone(telVal)) {
    setError('telefono', 'Numero non valido');
    valid = false;
  } else {
    clearError('telefono');
  }

  // Email
  const emailVal = fields.email.input.value;
  if (!emailVal.trim()) {
    setError('email', 'Campo obbligatorio');
    valid = false;
  } else if (!isValidEmail(emailVal)) {
    setError('email', 'Email non valida');
    valid = false;
  } else {
    clearError('email');
  }

  // Privacy
  if (!privacyCheck.checked) {
    checkWrap.classList.add('has-error');
    privacyErrEl.classList.add('show');
    valid = false;
  } else {
    checkWrap.classList.remove('has-error');
    privacyErrEl.classList.remove('show');
  }

  // ===== SUCCESS =====
  if (valid) {
    formView.style.animation = 'fadeUp 0.3s ease reverse forwards';
    setTimeout(() => {
      formView.style.display = 'none';
      successView.style.display = 'block';
    }, 280);
  }
});

// ===== ENTER KEY SUPPORT =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && formView.style.display !== 'none') {
    submitBtn.click();
  }
});