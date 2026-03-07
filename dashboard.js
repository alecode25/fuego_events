// ===== ELEMENTS =====
const btnCamera   = document.getElementById('btnCamera');
const btnCode     = document.getElementById('btnCode');

const modalCamera = document.getElementById('modalCamera');
const modalCode   = document.getElementById('modalCode');

const closeCamera = document.getElementById('closeCamera');
const closeCode   = document.getElementById('closeCode');

const qrVideo     = document.getElementById('qrVideo');
const camResult   = document.getElementById('camResult');
const stopCamera  = document.getElementById('stopCamera');

const ticketCode  = document.getElementById('ticketCode');
const flCode      = document.getElementById('fl-code');
const verifyBtn   = document.getElementById('verifyBtn');
const codeResult  = document.getElementById('codeResult');

let videoStream   = null;

// ===== HELPERS =====
function showModal(modal) {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function hideModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function showResult(el, ok, msg) {
  el.className = 'scan-result ' + (ok ? 'ok' : 'error');
  el.innerHTML = (ok ? '✓ ' : '✕ ') + msg;
  el.style.display = 'flex';
}

// ===== CAMERA MODAL =====
btnCamera.addEventListener('click', () => {
  showModal(modalCamera);
  startCamera();
});

async function startCamera() {
  camResult.style.display = 'none';
  stopCamera.style.display = 'none';
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }
    });
    qrVideo.srcObject = videoStream;
  } catch (err) {
    showResult(camResult, false, 'Fotocamera non disponibile o accesso negato');
    camResult.style.display = 'flex';
    stopCamera.style.display = 'flex';
  }
}

function stopCameraStream() {
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
    qrVideo.srcObject = null;
  }
}

closeCamera.addEventListener('click', () => {
  stopCameraStream();
  hideModal(modalCamera);
});

stopCamera.addEventListener('click', () => {
  stopCameraStream();
  hideModal(modalCamera);
});

// ===== CODE MODAL =====
btnCode.addEventListener('click', () => {
  ticketCode.value = '';
  codeResult.style.display = 'none';
  flCode.classList.remove('has-error');
  ticketCode.classList.remove('error');
  showModal(modalCode);
  setTimeout(() => ticketCode.focus(), 100);
});

closeCode.addEventListener('click', () => {
  hideModal(modalCode);
});

ticketCode.addEventListener('input', () => {
  // Auto uppercase
  const pos = ticketCode.selectionStart;
  ticketCode.value = ticketCode.value.toUpperCase();
  ticketCode.setSelectionRange(pos, pos);
  flCode.classList.remove('has-error');
  ticketCode.classList.remove('error');
  codeResult.style.display = 'none';
});

verifyBtn.addEventListener('click', () => {
  const val = ticketCode.value.trim();
  if (!val) {
    flCode.classList.add('has-error');
    ticketCode.classList.add('error');
    return;
  }
  // Simulate verification — replace with real API call
  const valid = val.startsWith('FG-') && val.length >= 8;
  showResult(
    codeResult,
    valid,
    valid ? 'Accesso Consentito — ' + val : 'Codice Non Valido'
  );
});

ticketCode.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') verifyBtn.click();
});

// Close modals clicking outside
[modalCamera, modalCode].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      stopCameraStream();
      hideModal(modal);
    }
  });
});

// ESC key closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    stopCameraStream();
    hideModal(modalCamera);
    hideModal(modalCode);
  }
});