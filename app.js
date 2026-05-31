// =============================================
// SUPABASE CONFIG
// =============================================
const SUPABASE_URL  = 'https://amrcywgsouszukzisxwe.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcmN5d2dzb3VzenVremlzeHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDc5OTAsImV4cCI6MjA4ODQyMzk5MH0.cfE0AJAFRoZIcEhEBUbWutXhzgJIwMlotnaSvmslt8M';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
        persistSession:     false,
        autoRefreshToken:   false,
        detectSessionInUrl: false
    }
});


// =============================================
// TOAST
// =============================================
function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = 'toast', 3000);
}

// =============================================
// APP
// =============================================
const FuegoApp = (() => {

    const ui = {
        card: document.getElementById('mainCard'),
        reg: {
            btn:        document.getElementById('regSubmitBtn'),
            nome:       document.getElementById('reg-nome'),
            cognome:    document.getElementById('reg-cognome'),
            tel:        document.getElementById('reg-telefono'),
            email:      document.getElementById('reg-email'),
            privacy:    document.getElementById('reg-privacy'),
            privacyBox: document.getElementById('privacy-box'),
            success:    document.getElementById('regSuccess'),
        },
        login: {
            btn:        document.getElementById('loginBtn'),
            id:         document.getElementById('user-id'),
            pass:       document.getElementById('password'),
            togglePass: document.getElementById('togglePass'),
            success:    document.getElementById('loginSuccess'),
        },
        modal: {
            wrap:  document.getElementById('emailConfirmModal'),
            email: document.getElementById('emailConfirmValue'),
            ok:    document.getElementById('emailConfirmOk'),
            back:  document.getElementById('emailConfirmBack'),
        }
    };

    const validate = {
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        phone: (v) => /^[\d\s\+\-\(\)]{7,}$/.test(v),
        empty: (v) => v.trim().length > 0,
        schoolEmail: (v) => {
            const domain = v.split('@')[1] || '';
            return domain.endsWith('.edu.it') || domain === 'istruzione.it';
        }
    };

    function setErr(id, show) {
        const wrap = document.getElementById(id);
        if (!wrap) return;
        wrap.classList.toggle('has-error', show);
        const hint = wrap.querySelector('.err-hint');
        if (hint) hint.style.display = show ? 'inline' : 'none';
    }

    // =============================================
    // REGISTRAZIONE → SUPABASE
    // =============================================
    function handleRegister() {
        const nome    = ui.reg.nome.value.trim();
        const cognome = ui.reg.cognome.value.trim();
        const tel     = ui.reg.tel.value.trim();
        const email   = ui.reg.email.value.trim();

        let ok = true;

        if (!validate.empty(nome))    { setErr('f-nome', true);     ok = false; } else setErr('f-nome', false);
        if (!validate.empty(cognome)) { setErr('f-cognome', true);  ok = false; } else setErr('f-cognome', false);
        if (!validate.phone(tel))     { setErr('f-telefono', true); ok = false; } else setErr('f-telefono', false);
        if (!validate.email(email)) {
            setErr('f-email', true);
            ok = false;
        } else if (validate.schoolEmail(email)) {
            setErr('f-email', true);
            const hint = document.querySelector('#f-email .err-hint');
            if (hint) hint.textContent = 'Email scolastica non ammessa';
            ok = false;
        } else {
            setErr('f-email', false);
            const hint = document.querySelector('#f-email .err-hint');
            if (hint) hint.textContent = 'Email non valida';
        }

        if (!ui.reg.privacy.checked) {
            ui.reg.privacyBox.style.borderColor = 'var(--error)';
            ok = false;
        } else {
            ui.reg.privacyBox.style.borderColor = 'var(--border)';
        }

        if (!ok) return;

        // Mostra modal conferma email
        ui.modal.email.textContent = email;
        ui.modal.wrap.style.display = 'flex';
    }

    async function doRegister() {
        const nome    = ui.reg.nome.value.trim();
        const cognome = ui.reg.cognome.value.trim();
        const tel     = ui.reg.tel.value.trim();
        const email   = ui.reg.email.value.trim();

        ui.modal.wrap.style.display = 'none';
        ui.reg.btn.disabled = true;
        ui.reg.btn.innerHTML = '<span>INVIO IN CORSO...</span><span class="material-symbols-outlined">hourglass_top</span>';

        try {
            const { data: result, error: rpcError } = await db.rpc('registra_utente', {
                p_nome:     nome,
                p_cognome:  cognome,
                p_email:    email,
                p_telefono: tel
            });

            if (rpcError) {
                showToast('Errore di rete. Riprova.', 'err');
                ui.reg.btn.disabled = false;
                ui.reg.btn.innerHTML = '<span>ENTRA IN LISTA</span><span class="material-symbols-outlined">bolt</span>';
                return;
            }

            if (!result.ok) {
                if (result.error === 'lista_piena') {
                    showToast('🔒 Lista chiusa — posti esauriti', 'err');
                    ui.reg.btn.innerHTML = '<span>LISTA CHIUSA 🔒</span><span class="material-symbols-outlined">lock</span>';
                    ui.reg.btn.style.background = 'linear-gradient(135deg, #555, #333)';
                    ui.reg.btn.style.boxShadow = 'none';
                } else if (result.error === 'email_duplicata') {
                    showToast('⚠️ Email già registrata', 'err');
                    ui.reg.btn.disabled = false;
                    ui.reg.btn.innerHTML = '<span>ENTRA IN LISTA</span><span class="material-symbols-outlined">bolt</span>';
                } else {
                    showToast('Errore: ' + result.error, 'err');
                    ui.reg.btn.disabled = false;
                    ui.reg.btn.innerHTML = '<span>ENTRA IN LISTA</span><span class="material-symbols-outlined">bolt</span>';
                }
                return;
            }

            const isVerde = result.tipo === 'verde';
            const overlay = ui.reg.success;
            overlay.querySelector('h2').textContent = isVerde ? 'QR 🟢 VERDE' : 'QR 🟣 VIOLA';
            overlay.querySelector('p').innerHTML = isVerde
                ? 'Sei tra i primi 400! Hai ottenuto il <b style="color:#22cc66">Biglietto Verde — Gratuito</b>.<br>Controlla la tua email per il biglietto.'
                : 'Hai ottenuto il <b style="color:#aa44ff">Biglietto Viola — Promo Drink</b>.<br>Controlla la tua email per il biglietto.';
            showToast(isVerde ? '✓ Biglietto Verde — Gratuito!' : '✓ Biglietto Viola — Promo Drink', 'ok');
            overlay.style.display = 'flex';

        } catch (e) {
            showToast('Errore di rete. Riprova.', 'err');
            ui.reg.btn.disabled = false;
            ui.reg.btn.innerHTML = '<span>ENTRA IN LISTA</span><span class="material-symbols-outlined">bolt</span>';
        }
    }

    // =============================================
    // LOGIN STAFF → RPC
    // =============================================
    async function handleLogin() {
        const idVal   = ui.login.id.value.trim();
        const passVal = ui.login.pass.value.trim();

        let ok = true;
        if (!validate.empty(idVal))   { setErr('fl-id',   true);  ok = false; } else setErr('fl-id',   false);
        if (!validate.empty(passVal)) { setErr('fl-pass', true);  ok = false; } else setErr('fl-pass', false);
        if (!ok) return;

        ui.login.btn.disabled = true;
        ui.login.btn.innerHTML = '<span>VERIFICA...</span><span class="material-symbols-outlined">hourglass_top</span>';

        try {
            const { data: result, error } = await db.rpc('login_scanner', {
                p_id_scanner: idVal,
                p_pass:       passVal
            });

            if (error) {
                showToast('Errore: ' + error.message, 'err');
                ui.login.btn.disabled = false;
                ui.login.btn.innerHTML = '<span>VERIFICA</span><span class="material-symbols-outlined">login</span>';
                return;
            }

            if (!result.ok) {
                showToast('✕ Credenziali non valide', 'err');
                setErr('fl-id', true);
                setErr('fl-pass', true);
                ui.login.btn.disabled = false;
                ui.login.btn.innerHTML = '<span>VERIFICA</span><span class="material-symbols-outlined">login</span>';
                return;
            }

            const session = {
                token:     result.token,
                scannerId: result.id,
                userId:    result.id_scanner
            };
            sessionStorage.setItem('fuego_session', JSON.stringify(session));

            showToast('✓ Accesso effettuato', 'ok');
            ui.login.success.style.display = 'flex';
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1400);

        } catch (e) {
            showToast('Errore di rete. Riprova.', 'err');
            ui.login.btn.disabled = false;
            ui.login.btn.innerHTML = '<span>VERIFICA</span><span class="material-symbols-outlined">login</span>';
        }
    }

    // =============================================
    // INIT
    // =============================================
    return {
        init: () => {
            window.flipCard = () => ui.card.classList.toggle('is-flipped');

            // Toggle password
            ui.login.togglePass.addEventListener('click', () => {
                const isPass = ui.login.pass.type === 'password';
                ui.login.pass.type = isPass ? 'text' : 'password';
                ui.login.togglePass.textContent = isPass ? 'visibility_off' : 'visibility';
            });

            // Submit registrazione
            ui.reg.btn.addEventListener('click', handleRegister);

            // Modal conferma email
            ui.modal.ok.addEventListener('click', doRegister);
            ui.modal.back.addEventListener('click', () => {
                ui.modal.wrap.style.display = 'none';
                ui.reg.email.focus();
                ui.reg.email.select();
            });

            // Submit login
            ui.login.btn.addEventListener('click', handleLogin);

            // Enter key
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                if (ui.card.classList.contains('is-flipped')) {
                    handleLogin();
                } else {
                    handleRegister();
                }
            });

            // Clear errors on input
            document.querySelectorAll('input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const parent = e.target.closest('.field');
                    if (parent) {
                        parent.classList.remove('has-error');
                        const hint = parent.querySelector('.err-hint');
                        if (hint) hint.style.display = 'none';
                    }
                    if (e.target.id === 'reg-privacy') {
                        ui.reg.privacyBox.style.borderColor = 'var(--border)';
                    }
                });
            });
        }
    };
})();

document.addEventListener('DOMContentLoaded', FuegoApp.init);