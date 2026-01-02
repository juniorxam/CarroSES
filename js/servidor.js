// Lógica do Painel do Servidor
let servantMap;
let currentStep = 1;

document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do usuário
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData.role === 'SERVIDOR') {
        document.querySelector('.user-info strong').textContent = userData.name;
        updateUserStats();
    }
    
    // Inicializa mapa
    initServantMap();
    
    // Carrega solicitações recentes
    loadRecentRequests();
    
    // Configura eventos
    setupServantEvents();
});

function initServantMap() {
    const center = [-23.5505, -46.6333];
    servantMap = L.map('servantMap').setView(center, 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(servantMap);
    
    // Adiciona marcador da unidade atual
    const unitIcon = L.divIcon({
        className: 'unit-icon',
        html: `<div style="
            width: 32px;
            height: 32px;
            background: #34A853;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
        ">🏥</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    
    L.marker(center, { icon: unitIcon })
        .addTo(servantMap)
        .bindPopup('<strong>UBS Centro</strong><br>Unidade Básica de Saúde');
    
    // Permite clicar no mapa para definir localização
    servantMap.on('click', function(e) {
        document.getElementById('currentLat').textContent = e.latlng.lat.toFixed(6);
        document.getElementById('currentLng').textContent = e.latlng.lng.toFixed(6);
        
        // Adiciona marcador no ponto clicado
        L.marker(e.latlng)
            .addTo(servantMap)
            .bindPopup('Local selecionado')
            .openPopup();
    });
}

function loadRecentRequests() {
    const tableBody = document.getElementById('requestsTableBody');
    tableBody.innerHTML = '';
    
    MockData.trips.forEach(trip => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(trip.createdAt)}</td>
            <td>${trip.patientName}</td>
            <td>${trip.destination.split(' - ')[0]}</td>
            <td><span class="status-badge ${trip.status}">${getStatusText(trip.status)}</span></td>
            <td>---</td>
            <td>
                <button class="btn-action view" data-id="${trip.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action cancel" data-id="${trip.id}">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Atualiza estatísticas
    updateUserStats();
}

function updateUserStats() {
    const myRequests = MockData.trips.filter(t => t.requesterId === '3').length;
    const completed = MockData.tripHistory.filter(t => t.status === 'concluida').length;
    const pending = MockData.trips.filter(t => t.status === 'pendente').length;
    
    document.getElementById('myRequests').textContent = myRequests;
    document.getElementById('completedRequests').textContent = completed;
    document.getElementById('pendingRequests').textContent = pending;
}

function setupServantEvents() {
    // Navegação entre etapas do formulário
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextSection = this.getAttribute('data-next');
            navigateToStep(nextSection);
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevSection = this.getAttribute('data-prev');
            navigateToStep(prevSection);
        });
    });
    
    // Envio do formulário
    document.getElementById('transportRequestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitTransportRequest();
    });
    
    // Botões de ação rápida
    document.getElementById('btnEmergency').addEventListener('click', function() {
        document.getElementById('priority').value = 'emergency';
        document.getElementById('patientCondition').value = 'critical';
        showToast('Configurações de emergência aplicadas!', 'warning');
    });
    
    document.getElementById('btnUrgent').addEventListener('click', function() {
        document.getElementById('priority').value = 'urgent';
        document.getElementById('patientCondition').value = 'urgent';
        showToast('Configurações de urgência aplicadas!', 'info');
    });
    
    document.getElementById('btnRoutine').addEventListener('click', function() {
        document.getElementById('priority').value = 'routine';
        document.getElementById('patientCondition').value = 'stable';
        showToast('Configurações de rotina aplicadas!', 'success');
    });
    
    // Atualização do resumo
    document.querySelectorAll('#transportRequestForm input, #transportRequestForm select, #transportRequestForm textarea')
        .forEach(element => {
            element.addEventListener('change', updateRequestSummary);
        });
    
    // Modal de confirmação
    const confirmationModal = document.getElementById('confirmationModal');
    document.querySelector('#confirmationModal .close-modal').addEventListener('click', function() {
        confirmationModal.classList.remove('active');
    });
    
    document.getElementById('btnNewRequest').addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        resetForm();
        navigateToStep('section1');
    });
    
    document.getElementById('btnTrackRequest').addEventListener('click', function() {
        confirmationModal.classList.remove('active');
        showToast('Funcionalidade de acompanhamento em desenvolvimento!', 'info');
    });
    
    // Atualizar lista de solicitações
    document.getElementById('btnRefreshRequests').addEventListener('click', function() {
        loadRecentRequests();
        showToast('Lista atualizada!', 'success');
    });
}

function navigateToStep(stepId) {
    // Atualiza indicador de passos
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 <= parseInt(stepId.replace('section', ''))) {
            step.classList.add('active');
        }
    });
    
    // Esconde todas as seções
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostra seção atual
    document.getElementById(stepId).classList.add('active');
    
    // Atualiza resumo se for a última etapa
    if (stepId === 'section3') {
        updateRequestSummary();
    }
}

function updateRequestSummary() {
    const summaryDiv = document.getElementById('requestSummary');
    const formData = new FormData(document.getElementById('transportRequestForm'));
    
    summaryDiv.innerHTML = `
        <div class="summary-row">
            <span>Paciente:</span>
            <strong>${document.getElementById('patientName').value || '---'}</strong>
        </div>
        <div class="summary-row">
            <span>Idade:</span>
            <strong>${document.getElementById('patientAge').value || '---'} anos</strong>
        </div>
        <div class="summary-row">
            <span>Condição:</span>
            <strong>${document.getElementById('patientCondition').value || '---'}</strong>
        </div>
        <div class="summary-row">
            <span>Origem → Destino:</span>
            <strong>${document.getElementById('origin').value || '---'} → ${document.getElementById('destination').value || '---'}</strong>
        </div>
        <div class="summary-row">
            <span>Prioridade:</span>
            <strong class="priority-${document.getElementById('priority').value || 'routine'}">
                ${document.getElementById('priority').value ? document.getElementById('priority').value.toUpperCase() : 'ROTINA'}
            </strong>
        </div>
    `;
}

function submitTransportRequest() {
    // Validação básica
    const requiredFields = ['patientName', 'patientAge', 'patientCondition', 'origin', 'destination', 'reason'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#EA4335';
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showToast('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Simula envio da solicitação
    const newRequest = {
        id: 'T' + Date.now(),
        patientName: document.getElementById('patientName').value,
        patientAge: document.getElementById('patientAge').value,
        patientCondition: document.getElementById('patientCondition').value,
        origin: document.getElementById('origin').value,
        destination: document.getElementById('destination').value,
        reason: document.getElementById('reason').value,
        priority: document.getElementById('priority').value,
        transportType: document.getElementById('transportType').value,
        status: 'pendente',
        createdAt: new Date().toISOString(),
        requesterId: '3' // ID do servidor atual
    };
    
    // Adiciona aos dados simulados
    MockData.trips.push(newRequest);
    
    // Mostra modal de confirmação
    showConfirmationModal(newRequest);
    
    // Atualiza estatísticas
    updateUserStats();
}

function showConfirmationModal(request) {
    const modal = document.getElementById('confirmationModal');
    const detailsDiv = document.getElementById('confirmationDetails');
    
    detailsDiv.innerHTML = `
        <div class="detail-item">
            <span>Protocolo:</span>
            <strong>${request.id}</strong>
        </div>
        <div class="detail-item">
            <span>Paciente:</span>
            <strong>${request.patientName}</strong>
        </div>
        <div class="detail-item">
            <span>Destino:</span>
            <strong>${request.destination}</strong>
        </div>
        <div class="detail-item">
            <span>Prioridade:</span>
            <strong class="priority-${request.priority}">${request.priority.toUpperCase()}</strong>
        </div>
        <div class="detail-item">
            <span>Status:</span>
            <strong class="status-pendente">PENDENTE</strong>
        </div>
    `;
    
    modal.classList.add('active');
}

function resetForm() {
    document.getElementById('transportRequestForm').reset();
    document.getElementById('currentLat').textContent = '-23.5505';
    document.getElementById('currentLng').textContent = '-46.6333';
    
    // Limpa mapa
    servantMap.eachLayer(layer => {
        if (layer instanceof L.Marker && !layer.getPopup().getContent().includes('UBS Centro')) {
            servantMap.removeLayer(layer);
        }
    });
}