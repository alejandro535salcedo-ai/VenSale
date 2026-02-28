// js/sales.js
import { getSales, saveSales, getClients, getProducts, getExchange } from './storage.js';
import { showModal, closeModal, escapeHTML, formatVED, generateId, showToast, exportToPDF } from './utils.js';

export function renderSales(userId) {
    const sales = getSales(userId);
    const clients = getClients(userId);
    const products = getProducts(userId);

    const rows = sales.map(s => {
        const client = clients.find(c => c.id === s.clientId)?.name || '?';
        const product = products.find(p => p.id === s.productId)?.name || '?';
        const debt = Math.max(0, s.totalVED - s.amountPaid);
        const statusClass = debt <= 0 ? 'paid' : (s.amountPaid > 0 ? 'partial' : 'debt');
        const statusText = debt <= 0 ? 'Pagado' : (s.amountPaid > 0 ? 'Abonado' : 'Debe');
        return `<tr>
            <td>${escapeHTML(client)}</td>
            <td>${escapeHTML(product)}</td>
            <td>${formatVED(s.totalVED)}</td>
            <td>${formatVED(s.amountPaid)}</td>
            <td class="${statusClass}">${formatVED(debt)}</td>
            <td class="${statusClass}">${statusText}</td>
            <td><button class="action-btn edit-sale" data-id="${s.id}"><i class="fas fa-edit"></i></button></td>
        </tr>`;
    }).join('');

    const html = `
        <h2>
            <i class="fas fa-cart-shopping"></i> Ventas
            <button class="primary" id="addSaleBtn"><i class="fas fa-plus"></i> Registrar venta</button>
            <button class="primary" id="exportSalesPDF"><i class="fas fa-file-pdf"></i> Exportar PDF</button>
        </h2>
        <div class="search-box">
            <input type="text" id="searchSales" placeholder="Buscar por cliente o producto...">
            <i class="fas fa-search"></i>
        </div>
        <div class="card">
            <table id="salesTable">
                <thead><tr><th>Cliente</th><th>Producto</th><th>Total VED</th><th>Pagado</th><th>Deuda</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody id="salesTableBody">${rows}</tbody>
            </table>
        </div>
    `;
    document.getElementById('view-container').innerHTML = html;

    document.getElementById('addSaleBtn').addEventListener('click', () => showSaleModal(userId));
    document.getElementById('exportSalesPDF').addEventListener('click', () => {
        const columns = ['Cliente', 'Producto', 'Total VED', 'Pagado', 'Deuda', 'Estado'];
        const rows = [];
        document.querySelectorAll('#salesTable tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length) {
                rows.push([
                    cells[0].innerText,
                    cells[1].innerText,
                    cells[2].innerText,
                    cells[3].innerText,
                    cells[4].innerText,
                    cells[5].innerText
                ]);
            }
        });
        exportToPDF(columns, rows, 'ventas');
    });
    attachSaleEvents(userId, sales, clients, products);

    document.getElementById('searchSales').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = sales.filter(s => {
            const client = clients.find(c => c.id === s.clientId)?.name || '';
            const product = products.find(p => p.id === s.productId)?.name || '';
            return client.toLowerCase().includes(term) || product.toLowerCase().includes(term);
        });
        const newRows = filtered.map(s => {
            const client = clients.find(c => c.id === s.clientId)?.name || '?';
            const product = products.find(p => p.id === s.productId)?.name || '?';
            const debt = Math.max(0, s.totalVED - s.amountPaid);
            const statusClass = debt <= 0 ? 'paid' : (s.amountPaid > 0 ? 'partial' : 'debt');
            const statusText = debt <= 0 ? 'Pagado' : (s.amountPaid > 0 ? 'Abonado' : 'Debe');
            return `<tr>
                <td>${escapeHTML(client)}</td>
                <td>${escapeHTML(product)}</td>
                <td>${formatVED(s.totalVED)}</td>
                <td>${formatVED(s.amountPaid)}</td>
                <td class="${statusClass}">${formatVED(debt)}</td>
                <td class="${statusClass}">${statusText}</td>
                <td><button class="action-btn edit-sale" data-id="${s.id}"><i class="fas fa-edit"></i></button></td>
            </tr>`;
        }).join('');
        document.getElementById('salesTableBody').innerHTML = newRows || '<tr><td colspan="7">No hay resultados</td></tr>';
        attachSaleEvents(userId, filtered, clients, products);
    });
}

function attachSaleEvents(userId, sales, clients, products) {
    document.querySelectorAll('.edit-sale').forEach(b => b.addEventListener('click', (e) => showSaleModal(userId, e.target.closest('button').dataset.id)));
}

function showSaleModal(userId, id = null) {
    const sales = getSales(userId);
    const sale = id ? sales.find(s => s.id == id) : null;
    const clients = getClients(userId);
    const products = getProducts(userId);
    const exchange = getExchange();

    let clientOptions = '<option value="">Seleccione cliente</option>';
    clients.forEach(c => clientOptions += `<option value="${c.id}" ${sale && sale.clientId == c.id ? 'selected' : ''}>${escapeHTML(c.name)}</option>`);

    let productOptions = '<option value="">Seleccione producto</option>';
    products.forEach(p => productOptions += `<option value="${p.id}" data-usd="${p.priceUSD}" ${sale && sale.productId == p.id ? 'selected' : ''}>${escapeHTML(p.name)} ($${p.priceUSD})</option>`);

    const quantity = sale ? sale.quantity : 1;
    const amountPaid = sale ? sale.amountPaid : 0;

    const content = `
        <h3>${id ? 'Editar' : 'Nueva'} venta</h3>
        <select id="saleClient" required>${clientOptions}</select>
        <select id="saleProduct" required>${productOptions}</select>
        <input type="number" id="saleQuantity" min="1" value="${quantity}" placeholder="Cantidad">
        <div class="form-row"><span>Total VED: </span><strong id="previewVED">0.00</strong></div>
        <input type="number" id="saleAmountPaid" placeholder="Monto pagado Bs." step="0.01" value="${amountPaid}">
        <div style="display: flex; gap:10px; margin-top:20px;">
            <button id="cancelSale">Cancelar</button>
            <button class="primary" id="saveSale">Guardar venta</button>
        </div>
    `;
    const modal = showModal(content);

    const productSelect = document.getElementById('saleProduct');
    const quantityInput = document.getElementById('saleQuantity');
    const preview = document.getElementById('previewVED');
    const updatePreview = () => {
        const opt = productSelect.options[productSelect.selectedIndex];
        const qty = parseInt(quantityInput.value) || 1;
        if (opt && opt.dataset.usd) {
            const usd = parseFloat(opt.dataset.usd);
            preview.innerText = (usd * exchange.rate * qty).toFixed(2);
        } else preview.innerText = '0.00';
    };
    productSelect.addEventListener('change', updatePreview);
    quantityInput.addEventListener('input', updatePreview);
    if (sale) updatePreview();

    document.getElementById('saveSale').addEventListener('click', () => {
        const clientId = document.getElementById('saleClient').value;
        const productId = document.getElementById('saleProduct').value;
        const quantity = parseInt(document.getElementById('saleQuantity').value) || 1;
        let amountPaid = parseFloat(document.getElementById('saleAmountPaid').value) || 0;

        if (!clientId || !productId) {
            showToast('Seleccione cliente y producto', 'warning');
            return;
        }
        const product = products.find(p => p.id == productId);
        if (!product) return;

        let totalVED;
        let rateUsed = exchange.rate;
        if (sale && sale.rateUsed) {
            rateUsed = sale.rateUsed;
            totalVED = product.priceUSD * rateUsed * quantity;
        } else {
            totalVED = product.priceUSD * exchange.rate * quantity;
        }

        if (amountPaid > totalVED) {
            amountPaid = totalVED;
            showToast('El pago no puede exceder el total. Se ajustó automáticamente.', 'info');
        }

        let allSales = JSON.parse(localStorage.getItem('vs_sales')) || [];
        if (id) {
            const index = allSales.findIndex(s => s.id == id);
            allSales[index] = {
                ...allSales[index],
                clientId,
                productId,
                quantity,
                totalVED,
                amountPaid,
                rateUsed,
                productPriceUSD: product.priceUSD
            };
            showToast('Venta actualizada', 'success');
        } else {
            allSales.push({
                id: generateId(),
                userId,
                clientId,
                productId,
                quantity,
                date: new Date().toISOString(),
                totalVED,
                amountPaid,
                rateUsed,
                productPriceUSD: product.priceUSD
            });
            showToast('Venta registrada', 'success');
        }
        saveSales(allSales);
        closeModal(modal);
        renderSales(userId);
    });

    document.getElementById('cancelSale').addEventListener('click', () => closeModal(modal));
}