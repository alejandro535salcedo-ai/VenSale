// js/clients.js
import { getClients, saveClients } from './storage.js';
import { showModal, closeModal, escapeHTML, generateId, showToast, exportToPDF } from './utils.js';

export function renderClients(userId) {
    const clients = getClients(userId);
    const rows = clients.map(c => `<tr>
        <td>${escapeHTML(c.name)}</td>
        <td>${escapeHTML(c.contact || '-')}</td>
        <td>
            <button class="action-btn edit-client" data-id="${c.id}"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-client" data-id="${c.id}"><i class="fas fa-trash"></i></button>
        </td>
    </tr>`).join('');

    const html = `
        <h2>
            <i class="fas fa-users"></i> Clientes
            <button class="primary" id="addClientBtn"><i class="fas fa-plus"></i> Nuevo</button>
            <button class="primary" id="exportClientsPDF"><i class="fas fa-file-pdf"></i> Exportar PDF</button>
        </h2>
        <div class="search-box">
            <input type="text" id="searchClients" placeholder="Buscar cliente...">
            <i class="fas fa-search"></i>
        </div>
        <div class="card">
            <table id="clientsTable">
                <thead><tr><th>Nombre</th><th>Contacto</th><th>Acciones</th></tr></thead>
                <tbody id="clientsTableBody">${rows}</tbody>
            </table>
        </div>
    `;
    document.getElementById('view-container').innerHTML = html;

    document.getElementById('addClientBtn').addEventListener('click', () => showClientModal(userId));
    document.getElementById('exportClientsPDF').addEventListener('click', () => {
        const columns = ['Nombre', 'Contacto'];
        const rows = [];
        document.querySelectorAll('#clientsTable tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length) {
                rows.push([
                    cells[0].innerText,
                    cells[1].innerText
                ]);
            }
        });
        exportToPDF(columns, rows, 'clientes');
    });
    attachClientEvents(userId, clients);

    document.getElementById('searchClients').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = clients.filter(c => c.name.toLowerCase().includes(term) || (c.contact && c.contact.toLowerCase().includes(term)));
        const newRows = filtered.map(c => `<tr>
            <td>${escapeHTML(c.name)}</td>
            <td>${escapeHTML(c.contact || '-')}</td>
            <td>
                <button class="action-btn edit-client" data-id="${c.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-client" data-id="${c.id}"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');
        document.getElementById('clientsTableBody').innerHTML = newRows || '<tr><td colspan="3">No hay resultados</td></tr>';
        attachClientEvents(userId, filtered);
    });
}

function attachClientEvents(userId, clients) {
    document.querySelectorAll('.edit-client').forEach(b => b.addEventListener('click', (e) => showClientModal(userId, e.target.closest('button').dataset.id)));
    document.querySelectorAll('.delete-client').forEach(b => b.addEventListener('click', (e) => deleteClient(userId, e.target.closest('button').dataset.id)));
}

function showClientModal(userId, id = null) {
    const clients = getClients(userId);
    const client = id ? clients.find(c => c.id == id) : null;
    const name = client ? escapeHTML(client.name) : '';
    const contact = client ? escapeHTML(client.contact || '') : '';

    const content = `
        <h3>${id ? 'Editar' : 'Nuevo'} cliente</h3>
        <input type="text" id="clientName" placeholder="Nombre" value="${name}">
        <input type="text" id="clientContact" placeholder="Teléfono / email" value="${contact}">
        <div style="display: flex; gap:10px; justify-content: end; margin-top:20px;">
            <button id="cancelClient">Cancelar</button>
            <button class="primary" id="saveClient">Guardar</button>
        </div>
    `;
    const modal = showModal(content);

    document.getElementById('saveClient').addEventListener('click', () => {
        const newName = document.getElementById('clientName').value.trim();
        const newContact = document.getElementById('clientContact').value.trim();
        if (!newName) {
            showToast('Nombre requerido', 'warning');
            return;
        }
        let allClients = JSON.parse(localStorage.getItem('vs_clients')) || [];
        if (id) {
            const index = allClients.findIndex(c => c.id == id);
            allClients[index] = { ...allClients[index], name: newName, contact: newContact };
            showToast('Cliente actualizado', 'success');
        } else {
            allClients.push({ id: generateId(), userId, name: newName, contact: newContact });
            showToast('Cliente creado', 'success');
        }
        saveClients(allClients);
        closeModal(modal);
        renderClients(userId);
    });

    document.getElementById('cancelClient').addEventListener('click', () => closeModal(modal));
}

function deleteClient(userId, id) {
    if (!confirm('¿Eliminar cliente?')) return;
    let allClients = JSON.parse(localStorage.getItem('vs_clients')) || [];
    allClients = allClients.filter(c => c.id != id);
    saveClients(allClients);
    showToast('Cliente eliminado', 'info');
    renderClients(userId);
}