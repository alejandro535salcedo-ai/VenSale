// js/products.js
import { getProducts, saveProducts, getExchange } from './storage.js';
import { showModal, closeModal, escapeHTML, formatUSD, formatVED, generateId, showToast, exportToPDF } from './utils.js';

export function renderProducts(userId) {
    const products = getProducts(userId);
    const exchange = getExchange();

    const rows = products.map(p => {
        const ved = p.priceUSD * exchange.rate;
        return `<tr>
            <td>${escapeHTML(p.name)}</td>
            <td>${formatUSD(p.priceUSD)}</td>
            <td>${formatVED(ved)}</td>
            <td>
                <button class="action-btn edit-product" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-product" data-id="${p.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');

    const html = `
        <h2>
            <i class="fas fa-box"></i> Productos
            <button class="primary" id="addProductBtn"><i class="fas fa-plus"></i> Nuevo</button>
            <button class="primary" id="exportProductsPDF"><i class="fas fa-file-pdf"></i> Exportar PDF</button>
        </h2>
        <div class="search-box">
            <input type="text" id="searchProducts" placeholder="Buscar producto...">
            <i class="fas fa-search"></i>
        </div>
        <div class="card">
            <table id="productsTable">
                <thead><tr><th>Nombre</th><th>Precio USD</th><th>Precio VED</th><th>Acciones</th></tr></thead>
                <tbody id="productsTableBody">${rows}</tbody>
            </table>
        </div>
    `;
    document.getElementById('view-container').innerHTML = html;

    document.getElementById('addProductBtn').addEventListener('click', () => showProductModal(userId));
    document.getElementById('exportProductsPDF').addEventListener('click', () => {
        const columns = ['Nombre', 'Precio USD', 'Precio VED'];
        const rows = [];
        document.querySelectorAll('#productsTable tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length) {
                rows.push([
                    cells[0].innerText,
                    cells[1].innerText,
                    cells[2].innerText
                ]);
            }
        });
        exportToPDF(columns, rows, 'productos');
    });
    attachProductEvents(userId, products, exchange.rate);

    // Búsqueda en tiempo real
    document.getElementById('searchProducts').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(term));
        const newRows = filtered.map(p => {
            const ved = p.priceUSD * exchange.rate;
            return `<tr>
                <td>${escapeHTML(p.name)}</td>
                <td>${formatUSD(p.priceUSD)}</td>
                <td>${formatVED(ved)}</td>
                <td>
                    <button class="action-btn edit-product" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-product" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
        document.getElementById('productsTableBody').innerHTML = newRows || '<tr><td colspan="4">No hay resultados</td></tr>';
        attachProductEvents(userId, filtered, exchange.rate);
    });
}

function attachProductEvents(userId, products, rate) {
    document.querySelectorAll('.edit-product').forEach(b => b.addEventListener('click', (e) => showProductModal(userId, e.target.closest('button').dataset.id)));
    document.querySelectorAll('.delete-product').forEach(b => b.addEventListener('click', (e) => deleteProduct(userId, e.target.closest('button').dataset.id)));
}

function showProductModal(userId, id = null) {
    const products = getProducts(userId);
    const product = id ? products.find(p => p.id == id) : null;
    const name = product ? escapeHTML(product.name) : '';
    const price = product ? product.priceUSD : '';

    const content = `
        <h3>${id ? 'Editar' : 'Nuevo'} producto</h3>
        <input type="text" id="productName" placeholder="Nombre" value="${name}" autocomplete="off">
        <input type="number" id="productPriceUSD" placeholder="Precio USD" step="0.01" value="${price}">
        <div style="display: flex; gap:10px; justify-content: end; margin-top:20px;">
            <button id="cancelProduct">Cancelar</button>
            <button class="primary" id="saveProduct">Guardar</button>
        </div>
    `;
    const modal = showModal(content);

    document.getElementById('saveProduct').addEventListener('click', () => {
        const newName = document.getElementById('productName').value.trim();
        const newPrice = parseFloat(document.getElementById('productPriceUSD').value);
        if (!newName || isNaN(newPrice) || newPrice <= 0) {
            showToast('Datos inválidos', 'warning');
            return;
        }
        let allProducts = JSON.parse(localStorage.getItem('vs_products')) || [];
        if (id) {
            const index = allProducts.findIndex(p => p.id == id);
            allProducts[index] = { ...allProducts[index], name: newName, priceUSD: newPrice };
            showToast('Producto actualizado', 'success');
        } else {
            allProducts.push({ id: generateId(), userId, name: newName, priceUSD: newPrice });
            showToast('Producto creado', 'success');
        }
        saveProducts(allProducts);
        closeModal(modal);
        renderProducts(userId);
    });

    document.getElementById('cancelProduct').addEventListener('click', () => closeModal(modal));
}

function deleteProduct(userId, id) {
    if (!confirm('¿Eliminar producto?')) return;
    let allProducts = JSON.parse(localStorage.getItem('vs_products')) || [];
    allProducts = allProducts.filter(p => p.id != id);
    saveProducts(allProducts);
    showToast('Producto eliminado', 'info');
    renderProducts(userId);
}