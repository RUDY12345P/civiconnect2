// =============================================
// CiviConnect - auth.js
// Firebase Auth con respaldo demo en localStorage
// =============================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, db } from './firebase-config.js';

const provider = new GoogleAuthProvider();
const DEMO_USERS_KEY = 'civiconnect_demo_users';
const DEMO_SESSION_KEY = 'civiconnect_demo_session';

function goToPage(page) {
  window.location.href = new URL(page, window.location.href).href;
}

function readDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function setDemoSession(user) {
  const safeUser = {
    uid: user.uid,
    name: user.name || user.displayName || 'Usuario Demo',
    email: user.email,
    role: user.role || 'citizen',
    points: user.points || 0,
    eventsJoined: user.eventsJoined || []
  };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

function getDemoSession() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY));
  } catch (_) {
    return null;
  }
}

function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

function demoRegister({ name, email, password, role = 'citizen' }) {
  const users = readDemoUsers();
  const normalizedEmail = email.toLowerCase();
  if (users.some(user => user.email === normalizedEmail)) {
    const err = new Error('Este correo ya está registrado en modo demo.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const user = {
    uid: `demo-${Date.now()}`,
    name,
    email: normalizedEmail,
    password,
    role,
    points: 0,
    eventsJoined: []
  };
  users.push(user);
  saveDemoUsers(users);
  return setDemoSession(user);
}

function demoLogin(email, password) {
  const normalizedEmail = email.toLowerCase();
  const user = readDemoUsers().find(item => item.email === normalizedEmail && item.password === password);
  if (!user) {
    const err = new Error('Correo o contraseña incorrectos en modo demo.');
    err.code = 'auth/invalid-credential';
    throw err;
  }
  return setDemoSession(user);
}

function demoGoogleLogin() {
  const email = 'demo.google@civiconnect.local';
  const users = readDemoUsers();
  let user = users.find(item => item.email === email);
  if (!user) {
    user = {
      uid: 'demo-google-user',
      name: 'Usuario Google Demo',
      email,
      password: '',
      role: 'citizen',
      points: 175,
      eventsJoined: ['ev001', 'ev003']
    };
    users.push(user);
    saveDemoUsers(users);
  }
  return setDemoSession(user);
}

export async function registerUser({ name, email, password, role = 'citizen' }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      points: 0,
      eventsJoined: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    clearDemoSession();
    return user;
  } catch (err) {
    return demoRegister({ name, email, password, role });
  }
}

export async function loginUser(email, password) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    clearDemoSession();
    return user;
  } catch (err) {
    return demoLogin(email, password);
  }
}

export async function loginWithGoogle() {
  try {
    const { user } = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName || 'Usuario',
        email: user.email,
        role: 'citizen',
        points: 0,
        eventsJoined: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    clearDemoSession();
    return user;
  } catch (err) {
    window.showToast?.('Firebase no respondió. Entrando en modo demo.', 'info');
    return demoGoogleLogin();
  }
}

export async function logout() {
  clearDemoSession();
  try {
    await signOut(auth);
  } catch (_) {}
  goToPage('../index.html');
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (_) {
    localStorage.setItem('civiconnect_demo_reset_email', email);
  }
}

export async function getUserProfile(uid) {
  const demoUser = getDemoSession();
  if (demoUser?.uid === uid) return demoUser;

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (_) {
    return demoUser;
  }
}

export function watchAuth(callback) {
  const demoUser = getDemoSession();
  if (demoUser) {
    callback(demoUser);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export function requireAuth(redirectTo = 'login.html') {
  return new Promise((resolve) => {
    const demoUser = getDemoSession();
    if (demoUser) {
      resolve(demoUser);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (!user) goToPage(redirectTo);
      else resolve(user);
    });
  });
}

export function redirectIfAuth(redirectTo = 'dashboard.html') {
  return new Promise((resolve) => {
    const demoUser = getDemoSession();
    if (demoUser) {
      goToPage(redirectTo);
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) goToPage(redirectTo);
      else resolve(null);
    });
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('[type="submit"]');
    const errEl = document.getElementById('authError');

    const name = registerForm.name.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirm = registerForm.confirmPassword.value;
    const role = registerForm.role?.value || 'citizen';

    if (!name || name.length < 2) {
      showAuthError(errEl, 'Ingresa tu nombre completo.');
      return;
    }
    if (password !== confirm) {
      showAuthError(errEl, 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      showAuthError(errEl, 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Creando cuenta...';
    errEl?.classList.remove('visible');

    try {
      await registerUser({ name, email, password, role });
      window.showToast?.('Cuenta creada. Bienvenid@ a CiviConnect.', 'success');
      setTimeout(() => goToPage('dashboard.html'), 900);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
      showAuthError(errEl, authMessage(err, 'Error al crear la cuenta. Inténtalo de nuevo.'));
    }
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('[type="submit"]');
    const errEl = document.getElementById('authError');

    btn.disabled = true;
    btn.textContent = 'Entrando...';
    errEl?.classList.remove('visible');

    try {
      await loginUser(loginForm.email.value.trim(), loginForm.password.value);
      goToPage('dashboard.html');
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Iniciar sesión';
      showAuthError(errEl, authMessage(err, 'No pudimos iniciar sesión. Revisa tus datos.'));
    }
  });
}

const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = resetForm.querySelector('[type="submit"]');
    const errEl = document.getElementById('authError');
    const okEl = document.getElementById('authSuccess');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      await resetPassword(resetForm.email.value.trim());
      if (okEl) {
        okEl.textContent = 'Listo. Si Firebase no está disponible, queda registrado como solicitud demo.';
        okEl.style.display = 'block';
      }
      errEl?.classList.remove('visible');
    } catch (_) {
      btn.disabled = false;
      btn.textContent = 'Enviar enlace';
      showAuthError(errEl, 'No encontramos ese correo registrado.');
    }
  });
}

const googleBtn = document.getElementById('googleLoginBtn');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    googleBtn.disabled = true;
    googleBtn.dataset.originalText = googleBtn.textContent;
    googleBtn.textContent = 'Conectando...';
    try {
      await loginWithGoogle();
      goToPage('dashboard.html');
    } catch (err) {
      googleBtn.disabled = false;
      googleBtn.textContent = googleBtn.dataset.originalText || 'Continuar con Google';
      window.showToast?.('Error al iniciar sesión.', 'error');
    }
  });
}

function showAuthError(errEl, message) {
  if (!errEl) return;
  errEl.textContent = message;
  errEl.classList.add('visible');
}

function authMessage(err, fallback) {
  const msgs = {
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/invalid-email': 'El formato del correo no es válido.',
    'auth/weak-password': 'La contraseña es muy débil.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.'
  };
  return msgs[err?.code] || fallback;
}

export { auth, db, getDemoSession };
