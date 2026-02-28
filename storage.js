// js/storage.js
import { generateId } from './utils.js';

const STORAGE_KEYS = {
    USERS: 'vs_users',
    PRODUCTS: 'vs_products',
    CLIENTS: 'vs_clients',
    SALES: 'vs_sales',
    EXCHANGE: 'vs_exchange',
    SESSION: 'vs_session'
};

export function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXCHANGE)) {
        const defaultExchange = { rate: 40.50, date: new Date().toISOString().split('T')[0], lastUpdated: 'manual' };
        localStorage.setItem(STORAGE_KEYS.EXCHANGE, JSON.stringify(defaultExchange));
    }
}

function getItem(key) { return JSON.parse(localStorage.getItem(key)) || []; }
function setItem(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

export function getUsers() { return getItem(STORAGE_KEYS.USERS); }
export function saveUsers(users) { setItem(STORAGE_KEYS.USERS, users); }

export function getProducts(userId) {
    const all = getItem(STORAGE_KEYS.PRODUCTS);
    return userId ? all.filter(p => p.userId === userId) : all;
}
export function saveProducts(products) { setItem(STORAGE_KEYS.PRODUCTS, products); }

export function getClients(userId) {
    const all = getItem(STORAGE_KEYS.CLIENTS);
    return userId ? all.filter(c => c.userId === userId) : all;
}
export function saveClients(clients) { setItem(STORAGE_KEYS.CLIENTS, clients); }

export function getSales(userId) {
    const all = getItem(STORAGE_KEYS.SALES);
    return userId ? all.filter(s => s.userId === userId) : all;
}
export function saveSales(sales) { setItem(STORAGE_KEYS.SALES, sales); }

export function getExchange() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGE)) || { rate: 40.5, date: '', lastUpdated: '' };
}
export function saveExchange(ex) { localStorage.setItem(STORAGE_KEYS.EXCHANGE, JSON.stringify(ex)); }

export function getSession() { return JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SESSION)); }
export function setSession(user) { sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, loggedIn: true })); }
export function clearSession() { sessionStorage.removeItem(STORAGE_KEYS.SESSION); }