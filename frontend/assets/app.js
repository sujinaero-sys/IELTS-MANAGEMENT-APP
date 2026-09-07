// ---------- API wrapper ----------
// Sent as text/plain to avoid CORS preflight issues with Apps Script.
async function api(action, payload) {
  const body = Object.assign({ action: action, token: getToken() }, payload || {});
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Something went wrong.');
  return data;
}

// ---------- Session / token helpers ----------
function getToken() { return localStorage.getItem('buye_token'); }
function setToken(t) { localStorage.setItem('buye_token', t); }
function clearToken() { localStorage.removeItem('buye_token'); localStorage.removeItem('buye_user'); }
function getStoredUser() { try { return JSON.parse(localStorage.getItem('buye_user')); } catch (e) { return null; } }
function setStoredUser(u) { localStorage.setItem('buye_user', JSON.stringify(u)); }

async function requireLogin(expectedRole) {
  const token = getToken();
  if (!token) { window.location.href = 'index.html'; return null; }
  try {
    const data = await api('checkSession', {});
    setStoredUser(data.user);
    if (expectedRole && data.user.role !== expectedRole) {
      window.location.href = data.user.role === 'admin' ? 'admin-dashboard.html' : 'trainer-dashboard.html';
      return null;
    }
    return data.user;
  } catch (e) {
    clearToken();
    window.location.href = 'index.html';
    return null;
  }
}

async function logout() {
  try { await api('logout', {}); } catch (e) { /* ignore */ }
  clearToken();
  window.location.href = 'index.html';
}

// ---------- Toast ----------
function toast(message, type) {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 3500);
}

// ---------- WhatsApp floating button ----------
function injectWhatsAppFab() {
  const a = document.createElement('a');
  a.className = 'whatsapp-fab';
  a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent('Hi BUYE-Online, I need assistance.');
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = '&#128222;';
  a.title = 'WhatsApp Assistance';
  document.body.appendChild(a);
}

document.addEventListener('DOMContentLoaded', injectWhatsAppFab);
