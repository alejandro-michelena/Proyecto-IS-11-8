/*
  frontend/js/usuario.js

  Maneja la UI de login, registro, perfil y cierre de sesión.
  Se carga en index.html, registro.html y gestionPerfil.html.
*/

// ── Utilidad ──────────────────────────────────────────────────────────────────
function toast(msg, tipo) {
    document.querySelector('.toast-auth')?.remove();
    const d = document.createElement('div');
    d.className = 'toast-auth';
    d.textContent = msg;
    Object.assign(d.style, {
        position: 'fixed', bottom: '30px', right: '30px', padding: '14px 22px',
        borderRadius: '12px', fontWeight: '600', color: '#fff', zIndex: '9999',
        background: tipo === 'exito' ? '#10b981' : '#ef4444',
    });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 4000);
}

// ── Login ─────────────────────────────────────────────────────────────────────
async function login(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email')?.value    ?? '';
    const password = document.getElementById('login-password')?.value ?? '';
    const r = await fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }).then(res => res.json());
    r.ok ? location.href = 'catalogo.html' : toast(r.msg, 'error');
}

// ── Registro ──────────────────────────────────────────────────────────────────
async function registrar(e) {
    e.preventDefault();
    const nombre   = document.getElementById('registro-nombre')?.value   ?? '';
    const email    = document.getElementById('registro-email')?.value    ?? '';
    const password = document.getElementById('registro-password')?.value ?? '';
    const r = await fetch('/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
    }).then(res => res.json());
    r.ok
        ? (toast('¡Registro exitoso! Redirigiendo...', 'exito'), setTimeout(() => location.href = 'index.html', 1800))
        : toast(r.msg, 'error');
}

// ── Perfil ────────────────────────────────────────────────────────────────────
async function cargarPerfil() {
    const sesion = await fetch('/api/usuarios/sesion').then(r => r.json());
    if (!sesion?.id) return location.href = 'index.html';
    document.getElementById('perfil-nombre').textContent    = sesion.nombre;
    document.getElementById('perfil-email').textContent     = sesion.email;
    const badge = document.getElementById('perfil-rol-badge');
    if (badge) badge.textContent = sesion.rol.toUpperCase();
}

// ── Toggle password ───────────────────────────────────────────────────────────
function initTogglePassword(toggleId, inputId) {
    document.getElementById(toggleId)?.addEventListener('click', () => {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-login')?.addEventListener('click', login);
    document.getElementById('btn-registrar')?.addEventListener('click', registrar);
    initTogglePassword('toggle-password', 'login-password');
    initTogglePassword('toggle-reg-password', 'registro-password');
    if (document.getElementById('perfil-nombre')) cargarPerfil();
});
