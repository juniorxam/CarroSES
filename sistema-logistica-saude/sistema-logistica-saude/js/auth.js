// Simulação de autenticação
const mockUsers = [
    {
        email: 'gestor@saude.gov.br',
        password: '123456',
        role: 'ADMIN',
        name: 'Carlos Silva',
        unit: 'Gestão Central'
    },
    {
        email: 'motorista@saude.gov.br',
        password: '123456',
        role: 'MOTORISTA',
        name: 'João Silva',
        unit: 'SAMU 192'
    },
    {
        email: 'servidor@saude.gov.br',
        password: '123456',
        role: 'SERVIDOR',
        name: 'Dra. Ana Santos',
        unit: 'UBS Centro'
    }
];

// Função para exibir Toast
function showToast(message, type = 'info') {
    const colors = {
        success: '#34A853',
        error: '#EA4335',
        warning: '#FBBC05',
        info: '#1A73E8'
    };
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: colors[type] || colors.info,
        stopOnFocus: true
    }).showToast();
}

// Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const demoAccounts = document.querySelectorAll('.account-card');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Simulação de autenticação
            const user = mockUsers.find(u => 
                u.email === email && 
                u.password === password && 
                u.role === role
            );
            
            if (user) {
                // Salva dados na sessionStorage
                sessionStorage.setItem('user', JSON.stringify(user));
                sessionStorage.setItem('authenticated', 'true');
                
                showToast('Login realizado com sucesso!', 'success');
                
                // Redireciona para o painel correto
                setTimeout(() => {
                    switch(role) {
                        case 'ADMIN':
                            window.location.href = 'gestor.html';
                            break;
                        case 'MOTORISTA':
                            window.location.href = 'motorista.html';
                            break;
                        case 'SERVIDOR':
                            window.location.href = 'servidor.html';
                            break;
                    }
                }, 1000);
            } else {
                showToast('Credenciais inválidas!', 'error');
            }
        });
    }
    
    // Preenche formulário com dados de demonstração
    demoAccounts.forEach(account => {
        account.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');
            const role = this.getAttribute('data-role');
            
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
            document.getElementById('role').value = role;
            
            showToast(`Conta ${role.toLowerCase()} preenchida!`, 'info');
        });
    });
    
    // Verifica se está autenticado nas páginas protegidas
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'index.html') {
        const authenticated = sessionStorage.getItem('authenticated');
        if (!authenticated) {
            window.location.href = 'index.html';
        }
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.clear();
            showToast('Sessão encerrada!', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
});