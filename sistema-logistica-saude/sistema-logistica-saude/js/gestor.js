// Dados simulados para demonstração
const mockVehicles = [
    {
        id: '1',
        plate: 'SAMU-192',
        model: 'Fiat Ducato',
        status: 'em_viagem',
        driver: 'João Silva',
        location: { lat: -23.5505, lng: -46.6333 },
        lastUpdate: '14:30'
    },
    {
        id: '2',
        plate: 'SAMU-193',
        model: 'Mercedes Sprinter',
        status: 'disponivel',
        driver: 'Maria Santos',
        location: { lat: -23.5605, lng: -46.6433 },
        lastUpdate: '14:28'
    },
    {
        id: '3',
        plate: 'SAMU-194',
        model: 'Volkswagen LT',
        status: 'disponivel',
        driver: 'Pedro Oliveira',
        location: { lat: -23.5705, lng: -46.6233 },
        lastUpdate: '14:25'
    },
    {
        id: '4',
        plate: 'SAMU-195',
        model: 'Renault Master',
        status: 'manutencao',
        driver: 'Ana Costa',
        location: { lat: -23.5805, lng: -46.6133 },
        lastUpdate: '14:20'
    }
];

const mockRequests = [
    {
        id: '1',
        patient: 'Carlos Mendes',
        origin: 'UBS Vila Nova',
        destination: 'Hospital Central',
        priority: 'alta',
        distance: '6.2 km',
        time: '18 min',
        status: 'pendente',
        createdAt: '14:25'
    },
    {
        id: '2',
        patient: 'Maria Silva',
        origin: 'UBS Centro',
        destination: 'Pronto Socorro',
        priority: 'media',
        distance: '4.5 km',
        time: '15 min',
        status: 'pendente',
        createdAt: '14:20'
    },
    {
        id: '3',
        patient: 'José Santos',
        origin: 'UBS Norte',
        destination: 'Hospital Municipal',
        priority: 'baixa',
        distance: '8.1 km',
        time: '22 min',
        status: 'pendente',
        createdAt: '14:15'
    }
];

let map;
let vehicleMarkers = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do usuário
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData.role === 'ADMIN') {
        document.querySelector('.user-info strong').textContent = userData.name;
    }
    
    // Inicializa mapa
    initMap();
    loadVehicles();
    loadRequests();
    
    // Configura eventos
    setupEventListeners();
    
    // Simula atualizações em tempo real
    simulateRealTimeUpdates();
});

function initMap() {
    // Centro em São Paulo
    const center = [-23.5505, -46.6333];
    
    map = L.map('map').setView(center, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

function loadVehicles() {
    const vehiclesGrid = document.getElementById('vehiclesGrid');
    vehiclesGrid.innerHTML = '';
    
    mockVehicles.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.innerHTML = `
            <h4>${vehicle.plate}</h4>
            <p>${vehicle.model}</p>
            <p>Motorista: ${vehicle.driver}</p>
            <p>Status: <span class="status-badge ${vehicle.status}">${getStatusText(vehicle.status)}</span></p>
            <p>Última atualização: ${vehicle.lastUpdate}</p>
        `;
        vehiclesGrid.appendChild(vehicleCard);
        
        // Adiciona marcador no mapa
        addVehicleMarker(vehicle);
    });
    
    // Atualiza contadores
    document.getElementById('totalVehicles').textContent = mockVehicles.length;
    document.getElementById('vehiclesBadge').textContent = mockVehicles.filter(v => v.status === 'disponivel').length;
}

function loadRequests() {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = '';
    
    mockRequests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        requestItem.innerHTML = `
            <div class="request-content">
                <div class="request-header">
                    <h4>${request.patient}</h4>
                    <span class="priority ${request.priority}">${request.priority.toUpperCase()}</span>
                </div>
                <div class="request-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${request.origin} → ${request.destination}</p>
                    <p><i class="fas fa-road"></i> ${request.distance} • ${request.time}</p>
                </div>
            </div>
            <div class="request-actions">
                <button class="btn-view" data-id="${request.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-assign" data-id="${request.id}">
                    <i class="fas fa-user-tie"></i>
                </button>
            </div>
        `;
        requestsList.appendChild(requestItem);
    });
    
    // Atualiza contadores
    document.getElementById('activeTrips').textContent = mockVehicles.filter(v => v.status === 'em_viagem').length;
    document.getElementById('pendingBadge').textContent = mockRequests.length;
}

function addVehicleMarker(vehicle) {
    const iconColors = {
        disponivel: 'green',
        em_viagem: 'blue',
        manutencao: 'orange',
        inativo: 'red'
    };
    
    const icon = L.divIcon({
        className: 'vehicle-marker',
        html: `<div class="marker ${vehicle.status}" style="background: ${iconColors[vehicle.status] || 'gray'}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const marker = L.marker([vehicle.location.lat, vehicle.location.lng], { icon })
        .addTo(map)
        .bindPopup(`
            <strong>${vehicle.plate}</strong><br>
            ${vehicle.model}<br>
            Motorista: ${vehicle.driver}<br>
            Status: ${getStatusText(vehicle.status)}<br>
            Última atualização: ${vehicle.lastUpdate}
        `);
    
    vehicleMarkers.push(marker);
}

function getStatusText(status) {
    const statusMap = {
        'disponivel': 'Disponível',
        'em_viagem': 'Em Viagem',
        'manutencao': 'Manutenção',
        'inativo': 'Inativo'
    };
    return statusMap[status] || status;
}

function setupEventListeners() {
    // Filtro de status
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        filterVehicles(e.target.value);
    });
    
    // Botão de atualizar
    document.getElementById('btnRefresh').addEventListener('click', function() {
        loadVehicles();
        loadRequests();
        showToast('Dados atualizados!', 'success');
    });
    
    // Botão de centralizar
    document.getElementById('btnCenter').addEventListener('click', function() {
        map.setView([-23.5505, -46.6333], 13);
    });
    
    // Modal
    const modal = document.getElementById('detailsModal');
    const closeModal = document.querySelector('.close-modal');
    
    closeModal.addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function filterVehicles(status) {
    vehicleMarkers.forEach(marker => marker.remove());
    vehicleMarkers = [];
    
    const filteredVehicles = status === 'all' 
        ? mockVehicles 
        : mockVehicles.filter(v => v.status === status);
    
    filteredVehicles.forEach(addVehicleMarker);
}

function simulateRealTimeUpdates() {
    // Simula atualização de localização a cada 30 segundos
    setInterval(() => {
        mockVehicles.forEach(vehicle => {
            if (vehicle.status === 'em_viagem' || vehicle.status === 'disponivel') {
                // Adiciona pequena variação na localização
                vehicle.location.lat += (Math.random() - 0.5) * 0.001;
                vehicle.location.lng += (Math.random() - 0.5) * 0.001;
                
                // Atualiza horário
                const now = new Date();
                vehicle.lastUpdate = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            }
        });
        
        // Atualiza visualização
        vehicleMarkers.forEach(marker => marker.remove());
        vehicleMarkers = [];
        mockVehicles.forEach(addVehicleMarker);
        
        // Atualiza horário no sistema
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
    }, 30000);
    
    // Simula notificações periódicas
    setInterval(() => {
        if (Math.random() > 0.7) {
            showToast('Nova solicitação de viagem recebida!', 'info');
        }
    }, 60000);
}