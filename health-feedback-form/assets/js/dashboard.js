/**
 * Health Feedback Dashboard - Data Visualization and Analytics
 * Uses Chart.js for creating interactive charts and data visualizations
 */

class HealthDashboard {
    constructor() {
        this.charts = {};
        this.currentFilters = {
            ageGroup: '',
            gender: '',
            location: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filteredData = [];
        
        // Chart color schemes
        this.colorSchemes = {
            primary: [
                '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
                '#1d4ed8', '#1e40af', '#1e3a8a', '#312e81', '#1e1b4b'
            ],
            health: {
                healthy: '#059669',
                moderate: '#d97706',
                abnormal: '#dc2626'
            },
            demographics: [
                '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe',
                '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3730a3'
            ],
            lifestyle: [
                '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe',
                '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.populateFilters();
        this.updateSummaryStats();
        this.createAllCharts();
        this.updateDataTable();
        this.setupModalHandlers();
    }
    
    loadData() {
        try {
            this.rawData = JSON.parse(localStorage.getItem('healthFeedbackSubmissions') || '[]');
            this.statistics = JSON.parse(localStorage.getItem('healthFeedbackStats') || '{}');
            this.filteredData = [...this.rawData];
            
            // Show no data message if no submissions
            if (this.rawData.length === 0) {
                this.showNoDataMessage();
                return;
            }
            
            this.hideNoDataMessage();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNoDataMessage();
        }
    }
    
    setupEventListeners() {
        // Filter controls
        document.getElementById('age-filter').addEventListener('change', (e) => {
            this.currentFilters.ageGroup = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('gender-filter').addEventListener('change', (e) => {
            this.currentFilters.gender = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('location-filter').addEventListener('change', (e) => {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        });
        
        // Action controls
        document.getElementById('refresh-data').addEventListener('click', () => {
            this.refreshData();
        });
        
        document.getElementById('export-data').addEventListener('click', () => {
            if (window.HealthDataUtils) {
                window.HealthDataUtils.exportData();
            }
        });
        
        document.getElementById('clear-data').addEventListener('click', () => {
            if (window.HealthDataUtils) {
                window.HealthDataUtils.clearAllData();
            }
        });
        
        // Pagination controls
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.updateDataTable();
            }
        });
        
        document.getElementById('next-page').addEventListener('click', () => {
            const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.updateDataTable();
            }
        });
    }
    
    setupModalHandlers() {
        // About data modal
        const aboutDataLink = document.querySelector('a[href="#about-data"]');
        const aboutDataModal = document.getElementById('about-data');
        const methodologyLink = document.querySelector('a[href="#methodology"]');
        const methodologyModal = document.getElementById('methodology');
        
        if (aboutDataLink && aboutDataModal) {
            aboutDataLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(aboutDataModal);
            });
        }
        
        if (methodologyLink && methodologyModal) {
            methodologyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(methodologyModal);
            });
        }
        
        // Close modal handlers
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.hideModal(openModal);
                }
            }
        });
    }
    
    showModal(modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    hideModal(modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    populateFilters() {
        // Populate location filter with unique locations
        const locationFilter = document.getElementById('location-filter');
        const locations = [...new Set(this.rawData.map(item => 
            item.demographics.location.split(',')[0].trim()
        ))].sort();
        
        // Clear existing options (except "All Locations")
        while (locationFilter.children.length > 1) {
            locationFilter.removeChild(locationFilter.lastChild);
        }
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }
    
    applyFilters() {
        this.filteredData = this.rawData.filter(item => {
            const ageMatch = !this.currentFilters.ageGroup || 
                           item.demographics.ageGroup === this.currentFilters.ageGroup;
            
            const genderMatch = !this.currentFilters.gender || 
                              item.demographics.gender === this.currentFilters.gender;
            
            const locationMatch = !this.currentFilters.location || 
                                item.demographics.location.includes(this.currentFilters.location);
            
            return ageMatch && genderMatch && locationMatch;
        });
        
        // Reset pagination
        this.currentPage = 1;
        
        // Update all visualizations
        this.updateSummaryStats();
        this.updateAllCharts();
        this.updateDataTable();
    }
    
    refreshData() {
        this.loadData();
        this.populateFilters();
        this.updateSummaryStats();
        this.updateAllCharts();
        this.updateDataTable();
    }
    
    updateSummaryStats() {
        const totalSubmissions = this.filteredData.length;
        const healthScores = this.filteredData.map(item => item.healthScore);
        const averageHealthScore = healthScores.length > 0 ? 
            Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length) : 0;
        
        const healthyCount = this.filteredData.filter(item => 
            item.healthClassification === 'healthy').length;
        const healthyPercentage = totalSubmissions > 0 ? 
            Math.round((healthyCount / totalSubmissions) * 100) : 0;
        
        const lastUpdated = this.statistics.lastUpdated ? 
            new Date(this.statistics.lastUpdated).toLocaleDateString() : 'Never';
        
        document.getElementById('total-submissions').textContent = totalSubmissions;
        document.getElementById('average-health-score').textContent = averageHealthScore;
        document.getElementById('healthy-percentage').textContent = `${healthyPercentage}%`;
        document.getElementById('last-updated').textContent = lastUpdated;
    }
    
    createAllCharts() {
        this.createAgeDistributionChart();
        this.createGenderDistributionChart();
        this.createHealthClassificationChart();
        this.createHealthScoresByAgeChart();
        this.createPhysicalActivityChart();
        this.createSleepPatternsChart();
        this.createRiskFactorsChart();
        this.createHealthScoresByLocationChart();
        this.createSubmissionsTimelineChart();
    }
    
    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        this.createAllCharts();
    }
    
    createAgeDistributionChart() {
        const ctx = document.getElementById('age-distribution-chart');
        if (!ctx) return;
        
        const ageGroups = {};
        this.filteredData.forEach(item => {
            const age = item.demographics.ageGroup;
            ageGroups[age] = (ageGroups[age] || 0) + 1;
        });
        
        this.charts.ageDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ageGroups),
                datasets: [{
                    label: 'Number of Participants',
                    data: Object.values(ageGroups),
                    backgroundColor: this.colorSchemes.primary[0],
                    borderColor: this.colorSchemes.primary[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.parsed.y} participants`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    createGenderDistributionChart() {
        const ctx = document.getElementById('gender-distribution-chart');
        if (!ctx) return;
        
        const genders = {};
        this.filteredData.forEach(item => {
            const gender = item.demographics.gender;
            genders[gender] = (genders[gender] || 0) + 1;
        });
        
        const genderLabels = {
            'male': 'Male',
            'female': 'Female',
            'other': 'Other',
            'prefer-not-to-say': 'Prefer not to say'
        };
        
        this.charts.genderDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(genders).map(key => genderLabels[key] || key),
                datasets: [{
                    data: Object.values(genders),
                    backgroundColor: this.colorSchemes.demographics.slice(0, Object.keys(genders).length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    createHealthClassificationChart() {
        const ctx = document.getElementById('health-classification-chart');
        if (!ctx) return;
        
        const classifications = {};
        this.filteredData.forEach(item => {
            const classification = item.healthClassification;
            classifications[classification] = (classifications[classification] || 0) + 1;
        });
        
        const classificationLabels = {
            'healthy': 'Healthy',
            'moderate': 'Moderate',
            'abnormal': 'Abnormal'
        };
        
        this.charts.healthClassification = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(classifications).map(key => classificationLabels[key] || key),
                datasets: [{
                    data: Object.values(classifications),
                    backgroundColor: Object.keys(classifications).map(key => this.colorSchemes.health[key]),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    createHealthScoresByAgeChart() {
        const ctx = document.getElementById('health-scores-age-chart');
        if (!ctx) return;
        
        const ageGroups = {};
        this.filteredData.forEach(item => {
            const age = item.demographics.ageGroup;
            if (!ageGroups[age]) {
                ageGroups[age] = [];
            }
            ageGroups[age].push(item.healthScore);
        });
        
        const averageScores = {};
        Object.keys(ageGroups).forEach(age => {
            const scores = ageGroups[age];
            averageScores[age] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
        
        this.charts.healthScoresByAge = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(averageScores),
                datasets: [{
                    label: 'Average Health Score',
                    data: Object.values(averageScores),
                    backgroundColor: this.colorSchemes.primary[2],
                    borderColor: this.colorSchemes.primary[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Average Score: ${context.parsed.y}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => `${value}`
                        }
                    }
                }
            }
        });
    }
    
    createPhysicalActivityChart() {
        const ctx = document.getElementById('physical-activity-chart');
        if (!ctx) return;
        
        const activities = {};
        this.filteredData.forEach(item => {
            const activity = item.lifestyle.physicalActivity;
            activities[activity] = (activities[activity] || 0) + 1;
        });
        
        const activityLabels = {
            'sedentary': 'Sedentary',
            'light': 'Light',
            'moderate': 'Moderate',
            'active': 'Active',
            'very-active': 'Very Active'
        };
        
        this.charts.physicalActivity = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: Object.keys(activities).map(key => activityLabels[key] || key),
                datasets: [{
                    label: 'Number of Participants',
                    data: Object.values(activities),
                    backgroundColor: this.colorSchemes.lifestyle[0],
                    borderColor: this.colorSchemes.lifestyle[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    
    createSleepPatternsChart() {
        const ctx = document.getElementById('sleep-patterns-chart');
        if (!ctx) return;
        
        const sleepPatterns = {};
        this.filteredData.forEach(item => {
            const sleep = item.lifestyle.sleepHours;
            sleepPatterns[sleep] = (sleepPatterns[sleep] || 0) + 1;
        });
        
        const sleepLabels = {
            'less-than-5': '< 5 hours',
            '5-6': '5-6 hours',
            '7-8': '7-8 hours',
            '9-10': '9-10 hours',
            'more-than-10': '> 10 hours'
        };
        
        this.charts.sleepPatterns = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(sleepPatterns).map(key => sleepLabels[key] || key),
                datasets: [{
                    data: Object.values(sleepPatterns),
                    backgroundColor: this.colorSchemes.lifestyle.slice(0, Object.keys(sleepPatterns).length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    createRiskFactorsChart() {
        const ctx = document.getElementById('risk-factors-chart');
        if (!ctx) return;
        
        const riskFactors = {};
        this.filteredData.forEach(item => {
            item.riskFactors.forEach(factor => {
                riskFactors[factor] = (riskFactors[factor] || 0) + 1;
            });
        });
        
        // Sort by frequency and take top 10
        const sortedFactors = Object.entries(riskFactors)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        if (sortedFactors.length === 0) {
            // Hide chart if no risk factors
            ctx.parentElement.style.display = 'none';
            return;
        }
        
        this.charts.riskFactors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedFactors.map(([factor]) => factor),
                datasets: [{
                    label: 'Number of Occurrences',
                    data: sortedFactors.map(([, count]) => count),
                    backgroundColor: this.colorSchemes.primary[3],
                    borderColor: this.colorSchemes.primary[1],
                    borderWidth: 1
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
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    createHealthScoresByLocationChart() {
        const ctx = document.getElementById('health-scores-location-chart');
        if (!ctx) return;
        
        const locations = {};
        this.filteredData.forEach(item => {
            const location = item.demographics.location.split(',')[0].trim();
            if (!locations[location]) {
                locations[location] = [];
            }
            locations[location].push(item.healthScore);
        });
        
        const averageScores = {};
        Object.keys(locations).forEach(location => {
            const scores = locations[location];
            averageScores[location] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        });
        
        // Sort by score and take top 10
        const sortedLocations = Object.entries(averageScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        this.charts.healthScoresByLocation = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: sortedLocations.map(([location]) => location),
                datasets: [{
                    label: 'Average Health Score',
                    data: sortedLocations.map(([, score]) => score),
                    backgroundColor: this.colorSchemes.demographics[0],
                    borderColor: this.colorSchemes.demographics[1],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    createSubmissionsTimelineChart() {
        const ctx = document.getElementById('submissions-timeline-chart');
        if (!ctx) return;
        
        // Group submissions by date
        const submissionsByDate = {};
        this.filteredData.forEach(item => {
            const date = new Date(item.timestamp).toDateString();
            submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
        });
        
        // Sort dates
        const sortedDates = Object.keys(submissionsByDate).sort((a, b) => 
            new Date(a) - new Date(b)
        );
        
        this.charts.submissionsTimeline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Submissions',
                    data: sortedDates.map(date => submissionsByDate[date]),
                    borderColor: this.colorSchemes.primary[0],
                    backgroundColor: this.colorSchemes.primary[4],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
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
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    updateDataTable() {
        const tableBody = document.getElementById('data-table-body');
        const tableShowing = document.getElementById('table-showing');
        const pageInfo = document.getElementById('page-info');
        const prevButton = document.getElementById('prev-page');
        const nextButton = document.getElementById('next-page');
        
        if (!tableBody) return;
        
        // Calculate pagination
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add data rows
        pageData.forEach(item => {
            const row = document.createElement('tr');
            
            const date = new Date(item.timestamp).toLocaleDateString();
            const riskFactors = item.riskFactors.slice(0, 3).join(', ') + 
                              (item.riskFactors.length > 3 ? '...' : '');
            
            row.innerHTML = `
                <td>${date}</td>
                <td>${item.demographics.ageGroup}</td>
                <td>${item.demographics.gender}</td>
                <td>${item.demographics.location}</td>
                <td>${item.healthScore}</td>
                <td><span class="classification-badge ${item.healthClassification}">${item.healthClassification}</span></td>
                <td>${riskFactors || 'None'}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update pagination info
        tableShowing.textContent = `Showing ${startIndex + 1}-${endIndex} of ${totalItems} entries`;
        pageInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        // Update pagination buttons
        prevButton.disabled = this.currentPage <= 1;
        nextButton.disabled = this.currentPage >= totalPages;
    }
    
    showNoDataMessage() {
        document.getElementById('no-data-message').style.display = 'block';
        document.querySelector('.dashboard-controls').style.display = 'none';
        document.querySelector('.summary-stats').style.display = 'none';
        document.querySelector('.charts-section').style.display = 'none';
        document.querySelector('.data-table-section').style.display = 'none';
    }
    
    hideNoDataMessage() {
        document.getElementById('no-data-message').style.display = 'none';
        document.querySelector('.dashboard-controls').style.display = 'block';
        document.querySelector('.summary-stats').style.display = 'block';
        document.querySelector('.charts-section').style.display = 'block';
        document.querySelector('.data-table-section').style.display = 'block';
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded. Please check the CDN link.');
        return;
    }
    
    // Configure Chart.js defaults
    Chart.defaults.font.family = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = '#374151';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;
    
    // Initialize dashboard
    new HealthDashboard();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthDashboard;
}
