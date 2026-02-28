// js/utils.js

// Mostrar notificación toast
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Overlay para modales (pila simple)
export function showModal(content) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal">${content}</div>`;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
    });
    document.body.appendChild(overlay);
    return overlay;
}

export function closeModal(overlay) {
    if (overlay) overlay.remove();
}

// Sanitizar HTML para evitar XSS
export function escapeHTML(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

// Formatear moneda
export function formatVED(amount) {
    return `Bs. ${Number(amount).toFixed(2)}`;
}

export function formatUSD(amount) {
    return `$${Number(amount).toFixed(2)}`;
}

// Generar ID único con fallback
export function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    } else {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Exportar tabla a PDF usando jsPDF
export function exportToPDF(columns, rows, filename = 'reporte') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.autoTable({
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`${filename}.pdf`);
}