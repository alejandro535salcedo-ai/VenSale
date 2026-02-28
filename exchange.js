// js/exchange.js
import { getExchange, saveExchange } from './storage.js';
import { showToast, formatVED } from './utils.js';

export function renderExchange() {
    const exchange = getExchange();
    const html = `
        <h2><i class="fas fa-dollar-sign"></i> Tasa BCV</h2>
        <div class="card">
            <p><strong>Tasa actual:</strong> ${formatVED(exchange.rate)} por USD</p>
            <p><strong>Última actualización:</strong> ${exchange.date} (${exchange.lastUpdated || 'manual'})</p>
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin:20px 0;">
                <input type="number" id="manualRate" step="0.01" placeholder="Nueva tasa manual" value="${exchange.rate}">
                <button id="setManualRate"><i class="fas fa-pen"></i> Fijar manual</button>
                <button id="fetchRateBtn" class="primary"><i class="fas fa-cloud-download-alt"></i> Obtener automática</button>
            </div>
        </div>
    `;
    document.getElementById('view-container').innerHTML = html;

    document.getElementById('setManualRate').addEventListener('click', () => {
        const newRate = parseFloat(document.getElementById('manualRate').value);
        if (isNaN(newRate) || newRate <= 0) {
            showToast('Tasa inválida', 'warning');
            return;
        }
        exchange.rate = newRate;
        exchange.date = new Date().toISOString().split('T')[0];
        exchange.lastUpdated = 'manual';
        saveExchange(exchange);
        showToast('Tasa actualizada manualmente', 'success');
        renderExchange();
    });

    document.getElementById('fetchRateBtn').addEventListener('click', fetchBCVRate);
}

async function fetchBCVRate() {
    try {
        const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (!response.ok) throw new Error('Error en API');
        const data = await response.json();
        const rate = data.promedio || data.precio;
        if (!rate) throw new Error('No se obtuvo tasa');
        const exchange = getExchange();
        exchange.rate = rate;
        exchange.date = new Date().toISOString().split('T')[0];
        exchange.lastUpdated = 'automática';
        saveExchange(exchange);
        showToast('Tasa actualizada automáticamente', 'success');
        renderExchange();
    } catch (e) {
        showToast('No se pudo obtener la tasa automática', 'error');
    }
}