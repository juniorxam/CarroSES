// Lógica do Painel do Motorista
document.addEventListener('DOMContentLoaded', function() {
    // Carrega dados do usuário
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData.role === 'MOTORISTA') {
        document.querySelector('.user-info strong').textContent = userData.name;
        loadDriverData(userData);
    }
    
    // Inicializa mapa
    initDriverMap();
    
    // Configura eventos
    setupDriverEvents();
    
    // Simula dados em tempo real
    simulateDriverUpdates();
});

function loadDriverData(user) {
    // Encontra veículo do motorista
    const vehicle = MockData.vehicles.find(v => v.driverId === user.id);
    if (vehicle) {
        updateVehicleInfo(vehicle);
    }
    
    // Carrega histórico do dia
    loadDailyHistory();
}

function initDriverMap() {
    const center = [-23.5505, -46.6333];
    const driverMap = L.map('driverMap').setView(center, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(driverMap);
    
    // Adiciona marcador do veículo atual
    const vehicle = MockData.vehicles[0];
    if (vehicle) {
        const vehicleIcon = L.divIcon({
            className: 'driver-vehicle-icon',
            html: `<div style="
                width: 24px;
                height: 24px;
                background: #1A73E8;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        L.marker([vehicle.location.lat, vehicle.location.lng], { icon: vehicleIcon })
            .addTo(driverMap)
            .bindPopup(`<strong>${vehicle.plate}</strong><br>${vehicle.model}`);
    }
    
    // Salva referência do mapa
    window.driverMap = driverMap;
}

function updateVehicleInfo(vehicle) {
    document.querySelector('.vehicle-details h4').textContent = vehicle.plate;
    document.querySelector('.vehicle-details p:nth-child(2)').textContent = `Placa: ${vehicle.plate}`;
    document.querySelector('.vehicle-details p:nth-child(3)').textContent = `Modelo: ${vehicle.model}`;
    document.querySelector('.vehicle-details p:nth-child(4)').textContent = `Ano: ${vehicle.year}`;
    
    const statusElement = document.querySelector('.vehicle-status span:last-child');
    statusElement.textContent = getStatusText(vehicle.status);
    
    // Atualiza status no header
    const statusBadge = document.querySelector('#driverStatus .status-badge');
    statusBadge.textContent = getStatusText(vehicle.status).toUpperCase();
    statusBadge.className = `status-badge ${vehicle.status}`;
}

function loadDailyHistory() {
    const historyList = document.querySelector('.history-list');
    historyList.innerHTML = '';
    
    MockData.tripHistory.forEach(trip => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${trip.status}`;
        historyItem.innerHTML = `
            <div class="history-time">${formatTime(trip.startTime)} - ${formatTime(trip.endTime)}</div>
            <div class="history-route">${trip.origin} → ${trip.destination}</div>
            <div class="history-status">${getStatusText(trip.status)}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function setupDriverEvents() {
    // Botão de mudar status
    document.getElementById('btnToggleStatus').addEventListener('click', function() {
        const currentStatus = this.classList.contains('available') ? 'available' : 'in-trip';
        const newStatus = currentStatus === 'available' ? 'in-trip' : 'available';
        
        this.classList.remove(currentStatus);
        this.classList.add(newStatus);
        this.innerHTML = newStatus === 'available' 
            ? '<i class="fas fa-power-off"></i><span>MUDAR PARA EM VIAGEM</span>'
            : '<i class="fas fa-power-off"></i><span>MUDAR PARA DISPONÍVEL</span>';
        
        // Atualiza status no sistema
        updateDriverStatus(newStatus);
    });
    
    // Aceitar viagem
    document.getElementById('btnAcceptTrip').addEventListener('click', function() {
        showToast('Viagem aceita com sucesso!', 'success');
        document.getElementById('newRequestBadge').textContent = '0';
        document.getElementById('newRequestCard').style.display = 'none';
        
        // Mostra informações da viagem ativa
        document.getElementById('currentTripInfo').style.display = 'block';
        document.getElementById('noTripInfo').style.display = 'none';
        
        // Habilita botões de controle
        document.getElementById('btnStartTrip').disabled = false;
        document.getElementById('btnCompleteTrip').disabled = false;
    });
    
    // Recusar viagem
    document.getElementById('btnRejectTrip').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja recusar esta viagem?')) {
            showToast('Viagem recusada.', 'warning');
            document.getElementById('newRequestBadge').textContent = '0';
            document.getElementById('newRequestCard').style.display = 'none';
        }
    });
    
    // Iniciar viagem
    document.getElementById('btnStartTrip').addEventListener('click', function() {
        showToast('Viagem iniciada!', 'success');
        this.disabled = true;
        updateDriverStatus('em_viagem');
        
        // Inicia simulação de rota
        simulateTripRoute();
    });
    
    // Finalizar viagem
    document.getElementById('btnCompleteTrip').addEventListener('click', function() {
        showToast('Viagem finalizada com sucesso!', 'success');
        document.getElementById('currentTripInfo').style.display = 'none';
        document.getElementById('noTripInfo').style.display = 'block';
        this.disabled = true;
        updateDriverStatus('disponivel');
    });
    
    // Reportar problema
    document.getElementById('btnReportProblem').addEventListener('click', function() {
        document.getElementById('problemModal').classList.add('active');
    });
    
    // Modal de problema
    const problemModal = document.getElementById('problemModal');
    document.querySelector('#problemModal .close-modal').addEventListener('click', function() {
        problemModal.classList.remove('active');
    });
    
    document.getElementById('btnCancelProblem').addEventListener('click', function() {
        problemModal.classList.remove('active');
    });
    
    document.getElementById('btnSubmitProblem').addEventListener('click', function() {
        const problemType = document.getElementById('problemType').value;
        const description = document.getElementById('problemDescription').value;
        
        if (!problemType || !description) {
            showToast('Preencha todos os campos!', 'error');
            return;
        }
        
        showToast('Problema reportado à central!', 'success');
        problemModal.classList.remove('active');
        
        // Limpa formulário
        document.getElementById('problemType').value = '';
        document.getElementById('problemDescription').value = '';
    });
}

function updateDriverStatus(status) {
    const statusBadge = document.querySelector('#driverStatus .status-badge');
    const vehicleStatus = document.querySelector('.vehicle-status span:last-child');
    
    statusBadge.textContent = getStatusText(status).toUpperCase();
    statusBadge.className = `status-badge ${status}`;
    vehicleStatus.textContent = getStatusText(status);
    
    // Atualiza cor do botão de status
    const toggleBtn = document.getElementById('btnToggleStatus');
    toggleBtn.classList.remove('available', 'in-trip');
    toggleBtn.classList.add(status === 'disponivel' ? 'in-trip' : 'available');
    
    toggleBtn.innerHTML = status === 'disponivel' 
        ? '<i class="fas fa-power-off"></i><span>MUDAR PARA EM VIAGEM</span>'
        : '<i class="fas fa-power-off"></i><span>MUDAR PARA DISPONÍVEL</span>';
}

function simulateDriverUpdates() {
    // Atualiza localização do veículo a cada 10 segundos
    setInterval(() => {
        if (window.driverMap) {
            const vehicle = MockData.vehicles[0];
            if (vehicle) {
                // Adiciona pequena variação na posição
                vehicle.location.lat += (Math.random() - 0.5) * 0.001;
                vehicle.location.lng += (Math.random() - 0.5) * 0.001;
                
                // Atualiza mapa
                window.driverMap.setView([vehicle.location.lat, vehicle.location.lng], 13);
            }
        }
        
        // Simula nível de combustível
        const fuelElement = document.getElementById('fuelLevel');
        if (fuelElement) {
            let currentFuel = parseInt(fuelElement.textContent);
            if (currentFuel > 20) {
                currentFuel -= 1;
                fuelElement.textContent = `${currentFuel}%`;
                
                if (currentFuel <= 20) {
                    fuelElement.style.color = '#EA4335';
                    showToast('Nível de combustível baixo!', 'warning');
                }
            }
        }
    }, 10000);
    
    // Simula nova solicitação a cada 2 minutos
    setInterval(() => {
        if (Math.random() > 0.5 && document.getElementById('newRequestCard').style.display !== 'none') {
            document.getElementById('newRequestBadge').textContent = '1';
            document.getElementById('newRequestCard').style.display = 'block';
            showToast('Nova solicitação de viagem recebida!', 'info');
        }
    }, 120000);
}

function simulateTripRoute() {
    // Simula progresso da viagem
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        
        // Atualiza distância percorrida
        const totalDistance = document.getElementById('totalDistance');
        if (totalDistance) {
            const currentDistance = (8.5 * progress / 100).toFixed(1);
            totalDistance.textContent = `${currentDistance} km`;
        }
        
        // Atualiza tempo estimado
        const estimatedTime = document.getElementById('estimatedTime');
        if (estimatedTime) {
            const remainingTime = Math.max(0, 25 - (25 * progress / 100));
            estimatedTime.textContent = `${Math.round(remainingTime)} min`;
        }
        
        // Atualiza posição no mapa
        if (window.driverMap && progress < 100) {
            const vehicle = MockData.vehicles[0];
            vehicle.location.lat += 0.0005;
            vehicle.location.lng += 0.0005;
            window.driverMap.setView([vehicle.location.lat, vehicle.location.lng], 13);
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            showToast('Destino próximo!', 'info');
        }
    }, 2000);
}