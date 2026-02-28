// js/main.js
import { initStorage } from './storage.js';
import { isLoggedIn, getCurrentUser, logout, loginUser, registerUser } from './auth.js';
import { showToast } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderProducts } from './products.js';
import { renderClients } from './clients.js';
import { renderSales } from './sales.js';
import { renderExchange } from './exchange.js';

initStorage();

// Elementos DOM
const authContainer = document.getElementById('auth-container');
const mainApp = document.getElementById('main-app');
const currentUserSpan = document.getElementById('current-user');
const menuItems = document.querySelectorAll('.sidebar-nav li');
const logoutBtn = document.getElementById('logout-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const themeToggle = document.getElementById('theme-toggle');

let currentView = 'dashboard';

// Verificar sesión
function checkSession() {
    if (isLoggedIn()) {
        authContainer.style.display = 'none';
        mainApp.style.display = 'flex';
        currentUserSpan.textContent = getCurrentUser();
        renderView(currentView);
    } else {
        authContainer.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

// Autenticación
loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const success = await loginUser(username, password);
    if (success) checkSession();
});

registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const pwd = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    if (!username || !pwd) return showToast('Complete todos los campos', 'warning');
    if (pwd !== confirm) return showToast('Las contraseñas no coinciden', 'warning');
    await registerUser(username, pwd);
    toggleAuthForms('login');
});

showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms('register'); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthForms('login'); });

function toggleAuthForms(form) {
    document.getElementById('login-form').style.display = form === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = form === 'register' ? 'block' : 'none';
}

logoutBtn.addEventListener('click', () => {
    logout();
    checkSession();
    currentView = 'dashboard';
});

// Navegación
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentView = item.dataset.view;
        renderView(currentView);
    });
});

function renderView(view) {
    const userId = getCurrentUser();
    if (!userId) return;
    switch(view) {
        case 'dashboard': renderDashboard(userId); break;
        case 'products': renderProducts(userId); break;
        case 'clients': renderClients(userId); break;
        case 'sales': renderSales(userId); break;
        case 'exchange': renderExchange(); break;
        default: renderDashboard(userId);
    }
}

// Modo oscuro
const savedTheme = localStorage.getItem('theme') || 'light';
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> <span>Modo claro</span>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i> <span>Modo claro</span>' 
        : '<i class="fas fa-moon"></i> <span>Modo oscuro</span>';
});

// Iniciar
checkSession();