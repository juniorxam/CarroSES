// Dados simulados para todo o sistema
const MockData = {
    // Usuários do sistema
    users: [
        {
            id: '1',
            email: 'gestor@saude.gov.br',
            password: '123456',
            role: 'ADMIN',
            name: 'Carlos Silva',
            phone: '(11) 99999-8888',
            unit: 'Gestão Central',
            createdAt: '2024-01-15'
        },
        {
            id: '2',
            email: 'motorista@saude.gov.br',
            password: '123456',
            role: 'MOTORISTA',
            name: 'João Silva',
            phone: '(11) 98888-7777',
            unit: 'SAMU 192',
            vehicleId: '101',
            createdAt: '2024-01-15'
        },
        {
            id: '3',
            email: 'servidor@saude.gov.br',
            password: '123456',
            role: 'SERVIDOR',
            name: 'Dra. Ana Santos',
            phone: '(11) 97777-6666',
            unit: 'UBS Centro',
            createdAt: '2024-01-15'
        }
    ],
    
    // Veículos da frota
    vehicles: [
        {
            id: '101',
            plate: 'SAMU-192',
            model: 'Fiat Ducato',
            brand: 'Fiat',
            year: 2022,
            color: 'Branco',
            status: 'em_viagem',
            driverId: '2',
            capacity: '6 pessoas',
            fuelType: 'Diesel',
            lastMaintenance: '2024-01-10',
            location: { lat: -23.5505, lng: -46.6333 }
        },
        {
            id: '102',
            plate: 'SAMU-193',
            model: 'Mercedes Sprinter',
            brand: 'Mercedes',
            year: 2023,
            color: 'Branco',
            status: 'disponivel',
            driverId: '4',
            capacity: '8 pessoas',
            fuelType: 'Diesel',
            lastMaintenance: '2024-01-12',
            location: { lat: -23.5605, lng: -46.6433 }
        },
        {
            id: '103',
            plate: 'SAMU-194',
            model: 'Volkswagen LT',
            brand: 'Volkswagen',
            year: 2021,
            color: 'Branco',
            status: 'disponivel',
            driverId: '5',
            capacity: '5 pessoas',
            fuelType: 'Diesel',
            lastMaintenance: '2024-01-05',
            location: { lat: -23.5705, lng: -46.6233 }
        }
    ],
    
    // Solicitações de viagem
    trips: [
        {
            id: '1001',
            patientName: 'Carlos Mendes',
            patientAge: 65,
            patientCondition: 'urgente',
            origin: 'UBS Vila Nova - R. das Flores, 123',
            destination: 'Hospital Central - Av. Principal, 456',
            originCoords: { lat: -23.5455, lng: -46.6283 },
            destCoords: { lat: -23.5555, lng: -46.6383 },
            reason: 'Dor torácica intensa, suspeita de infarto',
            priority: 'alta',
            status: 'pendente',
            requesterId: '3',
            createdAt: '2024-01-15T14:25:00',
            distance: '6.2 km',
            estimatedTime: '18 min'
        },
        {
            id: '1002',
            patientName: 'Maria Silva',
            patientAge: 45,
            patientCondition: 'monitoring',
            origin: 'UBS Centro - R. Central, 789',
            destination: 'Pronto Socorro - Av. das Nações, 321',
            originCoords: { lat: -23.5355, lng: -46.6183 },
            destCoords: { lat: -23.5255, lng: -46.6083 },
            reason: 'Transporte de paciente para exames especializados',
            priority: 'media',
            status: 'pendente',
            requesterId: '3',
            createdAt: '2024-01-15T14:20:00',
            distance: '4.5 km',
            estimatedTime: '15 min'
        }
    ],
    
    // Histórico de viagens
    tripHistory: [
        {
            id: '9001',
            vehicleId: '101',
            driverId: '2',
            patientName: 'José Santos',
            origin: 'UBS Norte',
            destination: 'Hospital Municipal',
            startTime: '2024-01-15T08:30:00',
            endTime: '2024-01-15T09:15:00',
            distance: '8.1 km',
            duration: '45 min',
            status: 'concluida'
        },
        {
            id: '9002',
            vehicleId: '102',
            driverId: '4',
            patientName: 'Ana Oliveira',
            origin: 'UBS Sul',
            destination: 'Pronto Socorro',
            startTime: '2024-01-15T10:00:00',
            endTime: '2024-01-15T10:50:00',
            distance: '5.7 km',
            duration: '50 min',
            status: 'concluida'
        }
    ],
    
    // Unidades de saúde
    healthUnits: [
        {
            id: 'UBS001',
            name: 'UBS Centro',
            address: 'R. Principal, 123',
            phone: '(11) 3333-4444',
            type: 'UBS',
            coordinates: { lat: -23.5455, lng: -46.6355 }
        },
        {
            id: 'UBS002',
            name: 'UBS Vila Nova',
            address: 'R. das Flores, 456',
            phone: '(11) 3333-5555',
            type: 'UBS',
            coordinates: { lat: -23.5555, lng: -46.6455 }
        },
        {
            id: 'HOSP001',
            name: 'Hospital Municipal',
            address: 'Av. Central, 789',
            phone: '(11) 3333-6666',
            type: 'Hospital',
            coordinates: { lat: -23.5355, lng: -46.6255 }
        }
    ]
};

// Funções utilitárias
function getStatusColor(status) {
    const colors = {
        'disponivel': '#34A853',
        'em_viagem': '#1A73E8',
        'manutencao': '#FBBC05',
        'inativo': '#EA4335',
        'pendente': '#FBBC05',
        'aceita': '#1A73E8',
        'concluida': '#34A853',
        'cancelada': '#EA4335'
    };
    return colors[status] || '#5F6368';
}

function getStatusText(status) {
    const texts = {
        'disponivel': 'Disponível',
        'em_viagem': 'Em Viagem',
        'manutencao': 'Em Manutenção',
        'inativo': 'Inativo',
        'pendente': 'Pendente',
        'aceita': 'Aceita',
        'concluida': 'Concluída',
        'cancelada': 'Cancelada'
    };
    return texts[status] || status;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
}