// js/auth.js
import bcrypt from 'bcryptjs';
import { getUsers, saveUsers, setSession, clearSession, getSession } from './storage.js';
import { showToast } from './utils.js';

export async function registerUser(username, password) {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
        showToast('El usuario ya existe', 'error');
        return false;
    }
    const hash = await bcrypt.hash(password, 10);
    users.push({ username, password: hash });
    saveUsers(users);
    showToast('Registro exitoso', 'success');
    return true;
}

export async function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        showToast('Usuario o contraseña incorrectos', 'error');
        return false;
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        setSession(username);
        showToast(`Bienvenido, ${username}`, 'success');
        return true;
    } else {
        showToast('Usuario o contraseña incorrectos', 'error');
        return false;
    }
}

export function logout() {
    clearSession();
    showToast('Sesión cerrada', 'info');
}

export function getCurrentUser() {
    const session = getSession();
    return session ? session.user : null;
}

export function isLoggedIn() {
    return !!getSession();
}