// js/dashboard.js
import { getSales, getClients, getProducts, getExchange } from './storage.js';
import { escapeHTML, formatVED } from './utils.js';

export function renderDashboard(userId) {
    const sales = getSales(userId);
    const clients = getClients(userId);
    const products = getProducts(userId);
    const exchange = getExchange();

    const totalVentas = sales.reduce((acc, s) => acc + s.totalVED, 0);
    const deudaTotal = sales.reduce((acc, s) => acc + Math.max(0, s.totalVED - s.amountPaid), 0);

    const lastSales = sales.slice(-5).reverse().map(s => {
        const client = clients.find(c => c.id === s.clientId)?.name || '?';
        const product = products.find(p => p.id === s.productId)?.name || '?';
        const debt = Math.max(0, s.totalVED - s.amountPaid);
        const status = debt <= 0 ? 'Pagado' : s.amountPaid > 0 ? 'Abonado' : 'Debe';
        return `<tr>
            <td>${escapeHTML(client)}</td>
            <td>${escapeHTML(product)}</td>
            <td>${formatVED(s.totalVED)}</td>
            <td>${formatVED(s.amountPaid)}</td>
            <td class="${debt <= 0 ? 'paid' : s.amountPaid > 0 ? 'partial' : 'debt'}">${formatVED(debt)}</td>
            <td>${status}</td>
        </tr>`;
    }).join('');

    const html = `
        <h2><i class="fas fa-home"></i> Panel de control</h2>
        <div class="card" style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="flex:1; min-width:150px;"><strong>💰 Tasa BCV</strong><br> ${formatVED(exchange.rate)} <br><small>${exchange.date}</small></div>
            <div style="flex:1;"><strong>📦 Productos</strong><br> ${products.length}</div>
            <div style="flex:1;"><strong>👥 Clientes</strong><br> ${clients.length}</div>
            <div style="flex:1;"><strong>🧾 Ventas totales</strong><br> ${formatVED(totalVentas)}</div>
            <div style="flex:1;"><strong>📉 Deuda total</strong><br> <span class="debt">${formatVED(deudaTotal)}</span></div>
        </div>
        <div class="card">
            <h3>Últimas ventas</h3>
            <table>
                <thead><tr><th>Cliente</th><th>Producto</th><th>Total</th><th>Pagado</th><th>Deuda</th><th>Estado</th></tr></thead>
                <tbody>${lastSales || '<tr><td colspan="6">No hay ventas</td></tr>'}</tbody>
            </table>
        </div>
    `;
    document.getElementById('view-container').innerHTML = html;
}