const fieldId   = { input: document.getElementById('user-id'), wrap: document.getElementById('fl-id') };
const fieldPass = { input: document.getElementById('password'), wrap: document.getElementById('fl-pass') };
const loginBtn     = document.getElementById('loginBtn');
const loginForm    = document.getElementById('loginForm');
const loginSuccess = document.getElementById('loginSuccess');
const togglePass   = document.getElementById('togglePass');
const eyeOpen      = document.getElementById('eye-open');
const eyeClosed    = document.getElementById('eye-closed');

// Toggle password visibility
togglePass.addEventListener('click', () => {
  const isPass = fieldPass.input.type === 'password';
  fieldPass.input.type = isPass ? 'text' : 'password';
  eyeOpen.style.display   = isPass ? 'none' : 'block';
  eyeClosed.style.display = isPass ? 'block' : 'none';
});

// Live clear errors
fieldId.input.addEventListener('input', () => clearErr(fieldId));
fieldPass.input.addEventListener('input', () => clearErr(fieldPass));

function setErr(f) {
  f.wrap.classList.add('has-error');
  f.input.classList.add('error');
}
function clearErr(f) {
  f.wrap.classList.remove('has-error');
  f.input.classList.remove('error');
}

loginBtn.addEventListener('click', () => {
  let valid = true;

  if (!fieldId.input.value.trim()) { setErr(fieldId); valid = false; }
  else clearErr(fieldId);

  if (!fieldPass.input.value.trim()) { setErr(fieldPass); valid = false; }
  else clearErr(fieldPass);

  if (valid) {
    loginForm.style.animation = 'fadeUp 0.3s ease reverse forwards';
    setTimeout(() => {
      loginForm.style.display = 'none';
      loginSuccess.style.display = 'block';
    }, 280);
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1400);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});