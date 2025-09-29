// Dashboard Analytics Pro - JavaScript
class DashboardPro {
    constructor() {
        this.charts = {};
        this.sparklines = {};
        this.data = {
            activeUsers: 0,
            salesCount: 0,
            revenue: 0,
            pageViews: 0
        };
        this.settings = {
            theme: localStorage.getItem('dashboard-theme') || 'light',
            primaryColor: localStorage.getItem('dashboard-color') || '#667eea',
            sidebarMode: localStorage.getItem('sidebar-mode') || 'expanded',
            autoRefresh: localStorage.getItem('auto-refresh') !== 'false'
        };
        this.notifications = [];
        this.widgets = JSON.parse(localStorage.getItem('dashboard-widgets')) || [];
        this.currentSection = 'overview';
        this.init();
    }

    async init() {
        this.showLoading();
        this.applySettings();
        this.initSidebar();
        this.initThemeSystem();
        this.initModals();
        await this.loadInitialData();
        this.initCharts();
        this.initSparklines();
        this.initDragAndDrop();
        this.initEventListeners();
        this.initNotificationSystem();
        this.startRealTimeUpdates();
        this.hideLoading();
        this.updateLastUpdateTime();
    }

    // Settings Management
    applySettings() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.documentElement.style.setProperty('--primary-color', this.settings.primaryColor);
        
        const container = document.querySelector('.dashboard-container');
        const sidebar = document.querySelector('.dashboard-sidebar');
        
        if (this.settings.sidebarMode === 'collapsed') {
            container.classList.add('sidebar-collapsed');
            sidebar.classList.add('collapsed');
        } else if (this.settings.sidebarMode === 'hidden') {
            container.classList.add('sidebar-hidden');
            sidebar.classList.add('hidden');
        }
    }

    saveSettings() {
        localStorage.setItem('dashboard-theme', this.settings.theme);
        localStorage.setItem('dashboard-color', this.settings.primaryColor);
        localStorage.setItem('sidebar-mode', this.settings.sidebarMode);
        localStorage.setItem('auto-refresh', this.settings.autoRefresh);
    }

    // Sidebar Management
    initSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navItems = document.querySelectorAll('.nav-item');
        
        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        mobileMenuBtn?.addEventListener('click', () => this.toggleMobileSidebar());
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.switchSection(section);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    toggleSidebar() {
        const container = document.querySelector('.dashboard-container');
        const sidebar = document.querySelector('.dashboard-sidebar');
        
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            container.classList.remove('sidebar-collapsed');
            this.settings.sidebarMode = 'expanded';
        } else {
            sidebar.classList.add('collapsed');
            container.classList.add('sidebar-collapsed');
            this.settings.sidebarMode = 'collapsed';
        }
        this.saveSettings();
    }

    toggleMobileSidebar() {
        const sidebar = document.querySelector('.dashboard-sidebar');
        const container = document.querySelector('.dashboard-container');
        
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            container.classList.remove('sidebar-hidden');
        } else {
            sidebar.classList.add('hidden');
            container.classList.add('sidebar-hidden');
        }
    }

    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
    }

    // Theme System
    initThemeSystem() {
        const themeBtn = document.getElementById('themeBtn');
        const themeSelect = document.getElementById('themeSelect');
        
        themeBtn?.addEventListener('click', () => this.toggleTheme());
        
        if (themeSelect) {
            themeSelect.value = this.settings.theme;
            themeSelect.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applyTheme();
            });
        }
        
        this.updateThemeIcon();
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        this.updateThemeIcon();
        this.saveSettings();
        
        // Recreate charts with new theme colors
        this.updateChartsTheme();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('#themeBtn i');
        if (themeIcon) {
            themeIcon.className = this.settings.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    updateChartsTheme() {
        // Update chart colors based on theme
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                chart.update();
            }
        });
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }, 1500);
    }

    async loadInitialData() {
        // Simular carregamento de dados
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.data = {
            activeUsers: 2847,
            salesCount: 156,
            revenue: 45230,
            pageViews: 18956
        };

        this.updateKPIs();
    }

    updateKPIs() {
        // Animar contadores
        this.animateCounter('activeUsers', this.data.activeUsers);
        this.animateCounter('salesCount', this.data.salesCount);
        this.animateCounter('revenue', this.data.revenue, 'currency');
        this.animateCounter('pageViews', this.data.pageViews);
    }

    animateCounter(elementId, targetValue, type = 'number') {
        const element = document.getElementById(elementId);
        const duration = 2000;
        const steps = 60;
        const increment = targetValue / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }

            let displayValue;
            if (type === 'currency') {
                displayValue = `R$ ${Math.floor(current).toLocaleString('pt-BR')}`;
            } else {
                displayValue = Math.floor(current).toLocaleString('pt-BR');
            }

            element.textContent = displayValue;
        }, duration / steps);
    }

    initCharts() {
        this.initSalesChart();
        this.initTrafficChart();
        this.initRealtimeChart();
        this.initRadarChart();
        this.initGaugeChart();
        this.initHeatmap();
    }

    initSparklines() {
        this.initSparkline('usersSparkline', this.generateSparklineData());
        this.initSparkline('salesSparkline', this.generateSparklineData());
        this.initSparkline('revenueSparkline', this.generateSparklineData());
        this.initSparkline('viewsSparkline', this.generateSparklineData());
    }

    initSparkline(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.sparklines[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(12).fill(''),
                datasets: [{
                    data: data,
                    borderColor: this.settings.primaryColor,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    }

    generateSparklineData() {
        return Array(12).fill(0).map(() => Math.floor(Math.random() * 100) + 50);
    }

    initSalesChart() {
        const ctx = document.getElementById('salesChart').getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');

        this.charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Vendas',
                    data: [1200, 1900, 1500, 2200, 1800, 2400],
                    borderColor: this.settings.primaryColor,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.settings.primaryColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
                    }
                }
            }
        });
    }

    initTrafficChart() {
        const ctx = document.getElementById('trafficChart').getContext('2d');
        
        this.charts.traffic = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Orgânico', 'Redes Sociais', 'E-mail', 'Direto', 'Outros'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    initRealtimeChart() {
        const ctx = document.getElementById('realtimeChart').getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(118, 75, 162, 0.3)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.05)');

        const timeLabels = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            timeLabels.push(time.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
        }

        this.charts.realtime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Usuários Online',
                    data: this.generateRealtimeData(30),
                    borderColor: '#764ba2',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6
                        }
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });
    }

    initRadarChart() {
        const ctx = document.getElementById('radarChart')?.getContext('2d');
        if (!ctx) return;
        
        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Vendas', 'Marketing', 'Suporte', 'Produto', 'Tecnologia', 'RH'],
                datasets: [{
                    label: 'Performance',
                    data: [85, 72, 90, 78, 95, 68],
                    borderColor: this.settings.primaryColor,
                    backgroundColor: this.settings.primaryColor + '20',
                    borderWidth: 2,
                    pointBackgroundColor: this.settings.primaryColor,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: this.settings.primaryColor
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        angleLines: { color: 'rgba(0, 0, 0, 0.1)' }
                    }
                }
            }
        });
    }

    initGaugeChart() {
        const ctx = document.getElementById('salesGauge')?.getContext('2d');
        if (!ctx) return;
        
        this.charts.gauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [78, 22],
                    backgroundColor: [
                        this.settings.primaryColor,
                        'rgba(0, 0, 0, 0.1)'
                    ],
                    borderWidth: 0,
                    cutout: '80%',
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }

    initHeatmap() {
        const container = document.getElementById('heatmapContainer');
        if (!container) return;
        
        const hours = ['00', '04', '08', '12', '16', '20'];
        const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        
        let heatmapHTML = '<div class="heatmap-grid">';
        
        // Headers
        heatmapHTML += '<div class="heatmap-cell header"></div>';
        hours.forEach(hour => {
            heatmapHTML += `<div class="heatmap-cell header">${hour}h</div>`;
        });
        
        // Data cells
        days.forEach(day => {
            heatmapHTML += `<div class="heatmap-cell day-label">${day}</div>`;
            hours.forEach(() => {
                const intensity = Math.random();
                const value = Math.floor(intensity * 100);
                heatmapHTML += `<div class="heatmap-cell" style="background-color: ${this.settings.primaryColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}" title="${value} atividades">${value}</div>`;
            });
        });
        
        heatmapHTML += '</div>';
        container.innerHTML = heatmapHTML;
    }

    generateRealtimeData(points) {
        const data = [];
        let base = 150;
        
        for (let i = 0; i < points; i++) {
            base += Math.random() * 20 - 10;
            base = Math.max(50, Math.min(300, base));
            data.push(Math.floor(base));
        }
        
        return data;
    }

    startRealTimeUpdates() {
        // Atualizar dados a cada 30 segundos
        setInterval(() => {
            this.updateRealtimeData();
            this.updateKPIValues();
            this.updateActivities();
            this.updateLastUpdateTime();
        }, 30000);

        // Atualizar gráfico em tempo real a cada 5 segundos
        setInterval(() => {
            this.updateRealtimeChart();
        }, 5000);
    }

    updateRealtimeData() {
        // Simular variação nos dados
        this.data.activeUsers += Math.floor(Math.random() * 20 - 10);
        this.data.salesCount += Math.floor(Math.random() * 3);
        this.data.revenue += Math.floor(Math.random() * 1000 - 500);
        this.data.pageViews += Math.floor(Math.random() * 50);

        // Garantir valores positivos
        Object.keys(this.data).forEach(key => {
            if (this.data[key] < 0) this.data[key] = Math.abs(this.data[key]);
        });
    }

    updateKPIValues() {
        this.animateCounter('activeUsers', this.data.activeUsers);
        this.animateCounter('salesCount', this.data.salesCount);
        this.animateCounter('revenue', this.data.revenue, 'currency');
        this.animateCounter('pageViews', this.data.pageViews);
    }

    updateRealtimeChart() {
        const chart = this.charts.realtime;
        const newValue = 150 + Math.random() * 100 - 50;
        
        // Remover primeiro ponto e adicionar novo
        chart.data.datasets[0].data.shift();
        chart.data.datasets[0].data.push(Math.floor(newValue));
        
        // Atualizar label de tempo
        const now = new Date();
        chart.data.labels.shift();
        chart.data.labels.push(now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        
        chart.update('none');
    }

    updateActivities() {
        const activities = [
            { icon: 'fas fa-user-plus', text: 'Novo usuário cadastrado', time: 'Agora' },
            { icon: 'fas fa-shopping-cart', text: 'Pedido #1234 realizado', time: '2 min atrás' },
            { icon: 'fas fa-star', text: 'Nova avaliação 5 estrelas', time: '5 min atrás' },
            { icon: 'fas fa-bell', text: 'Meta de vendas atingida', time: '8 min atrás' },
            { icon: 'fas fa-chart-line', text: 'Relatório mensal gerado', time: '15 min atrás' }
        ];

        const activityList = document.getElementById('activityList');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    updateLastUpdateTime() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent = 
            now.toLocaleTimeString('pt-BR');
    }

    // Modals Management
    initModals() {
        // Settings Modal
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsModal = document.getElementById('settingsModal');
        const closeSettings = document.getElementById('closeSettings');
        const saveSettings = document.getElementById('saveSettings');
        const resetSettings = document.getElementById('resetSettings');
        
        settingsBtn?.addEventListener('click', () => this.openSettingsModal());
        closeSettings?.addEventListener('click', () => this.closeModal('settingsModal'));
        saveSettings?.addEventListener('click', () => this.saveSettingsFromModal());
        resetSettings?.addEventListener('click', () => this.resetSettings());
        
        // Widget Modal
        const addWidgetBtn = document.getElementById('addWidgetBtn');
        const widgetModal = document.getElementById('widgetModal');
        const closeWidget = document.getElementById('closeWidget');
        
        addWidgetBtn?.addEventListener('click', () => this.openModal('widgetModal'));
        closeWidget?.addEventListener('click', () => this.closeModal('widgetModal'));
        
        // Close modal on background click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });
        
        // Color picker
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(opt => 
                    opt.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.primaryColor = e.target.dataset.color;
                this.applySettings();
            });
        });
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    openSettingsModal() {
        // Populate current settings
        document.getElementById('themeSelect').value = this.settings.theme;
        document.getElementById('sidebarMode').value = this.settings.sidebarMode;
        document.getElementById('autoRefresh').checked = this.settings.autoRefresh;
        
        // Set active color
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('active', option.dataset.color === this.settings.primaryColor);
        });
        
        this.openModal('settingsModal');
    }

    saveSettingsFromModal() {
        this.settings.theme = document.getElementById('themeSelect').value;
        this.settings.sidebarMode = document.getElementById('sidebarMode').value;
        this.settings.autoRefresh = document.getElementById('autoRefresh').checked;
        
        this.applySettings();
        this.saveSettings();
        this.closeModal('settingsModal');
        this.showNotification('Configurações salvas com sucesso!', 'success');
    }

    resetSettings() {
        this.settings = {
            theme: 'light',
            primaryColor: '#667eea',
            sidebarMode: 'expanded',
            autoRefresh: true
        };
        this.applySettings();
        this.saveSettings();
        this.closeModal('settingsModal');
        this.showNotification('Configurações restauradas!', 'info');
        setTimeout(() => location.reload(), 1000);
    }

    // Drag and Drop
    initDragAndDrop() {
        const draggables = document.querySelectorAll('[draggable="true"]');
        const containers = document.querySelectorAll('.kpi-section, .charts-section');
        
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', '');
                draggable.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });
        
        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (dragging) {
                    container.appendChild(dragging);
                }
            });
        });
    }

    // Notification System
    initNotificationSystem() {
        this.notificationContainer = document.getElementById('notifications');
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    initEventListeners() {
        // Refresh data
        window.refreshData = () => {
            this.showLoading();
            setTimeout(() => {
                this.updateRealtimeData();
                this.updateKPIValues();
                this.updateActivities();
                this.updateLastUpdateTime();
                this.hideLoading();
                this.showNotification('Dados atualizados!', 'success');
            }, 1000);
        };

        // Export data
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        // Date range filter
        document.getElementById('dateRange')?.addEventListener('change', (e) => {
            this.filterByDateRange(e.target.value);
        });

        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartPeriod(e.target.dataset.period);
            });
        });

        // KPI actions
        document.querySelectorAll('.kpi-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                const card = e.target.closest('.kpi-card');
                this.handleKPIAction(action, card);
            });
        });

        // Chart actions
        document.querySelectorAll('.chart-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]').dataset.action;
                const container = e.target.closest('.chart-container');
                this.handleChartAction(action, container);
            });
        });
    }

    exportData() {
        const data = {
            kpis: this.data,
            timestamp: new Date().toISOString(),
            period: document.getElementById('dateRange').value
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Dados exportados com sucesso!', 'success');
    }

    filterByDateRange(range) {
        this.showNotification(`Filtro aplicado: ${range}`, 'info');
        // Implement filter logic here
        this.updateRealtimeData();
        this.updateKPIValues();
    }

    updateChartPeriod(period) {
        this.showNotification(`Período alterado: ${period}`, 'info');
        // Update charts with new period data
    }

    handleKPIAction(action, card) {
        switch (action) {
            case 'settings':
                this.showNotification('Configurações do KPI', 'info');
                break;
            case 'remove':
                if (confirm('Remover este KPI?')) {
                    card.remove();
                    this.showNotification('KPI removido', 'warning');
                }
                break;
        }
    }

    handleChartAction(action, container) {
        switch (action) {
            case 'fullscreen':
                this.toggleFullscreen(container);
                break;
            case 'settings':
                this.showNotification('Configurações do gráfico', 'info');
                break;
            case 'remove':
                if (confirm('Remover este gráfico?')) {
                    container.remove();
                    this.showNotification('Gráfico removido', 'warning');
                }
                break;
        }
    }

    toggleFullscreen(element) {
        if (element.classList.contains('fullscreen')) {
            element.classList.remove('fullscreen');
        } else {
            element.classList.add('fullscreen');
        }
    }
}

// Inicializar dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardPro();
});

// Adicionar efeitos de animação aos cards
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observar todos os elementos com data-aos
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
});

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatPercent(value) {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'r':
                e.preventDefault();
                window.refreshData();
                break;
            case 'e':
                e.preventDefault();
                document.getElementById('exportBtn')?.click();
                break;
            case ',':
                e.preventDefault();
                document.getElementById('settingsBtn')?.click();
                break;
        }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}