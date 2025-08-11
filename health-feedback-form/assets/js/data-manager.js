/**
 * Health Feedback Data Manager
 * Handles data storage, aggregation, export, and management functionality
 */

class HealthDataManager {
    constructor() {
        this.storageKeys = {
            submissions: 'healthFeedbackSubmissions',
            statistics: 'healthFeedbackStats',
            settings: 'healthFeedbackSettings'
        };
        
        this.defaultSettings = {
            dataRetentionDays: 365,
            maxSubmissions: 10000,
            exportFormat: 'json',
            anonymizeData: true,
            lastCleanup: null
        };
        
        this.init();
    }
    
    init() {
        this.initializeStorage();
        this.performMaintenanceTasks();
    }
    
    /**
     * Initialize localStorage with default structures
     */
    initializeStorage() {
        // Initialize submissions array if not exists
        if (!localStorage.getItem(this.storageKeys.submissions)) {
            localStorage.setItem(this.storageKeys.submissions, JSON.stringify([]));
        }
        
        // Initialize statistics object if not exists
        if (!localStorage.getItem(this.storageKeys.statistics)) {
            const initialStats = this.createInitialStatistics();
            localStorage.setItem(this.storageKeys.statistics, JSON.stringify(initialStats));
        }
        
        // Initialize settings if not exists
        if (!localStorage.getItem(this.storageKeys.settings)) {
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(this.defaultSettings));
        }
    }
    
    /**
     * Create initial statistics structure
     */
    createInitialStatistics() {
        return {
            totalSubmissions: 0,
            lastUpdated: new Date().toISOString(),
            demographics: {
                ageGroups: {},
                genders: {},
                locations: {}
            },
            lifestyle: {
                physicalActivity: {},
                dietHabits: {},
                sleepHours: {},
                smoking: {},
                alcohol: {}
            },
            healthClassifications: {
                healthy: 0,
                moderate: 0,
                abnormal: 0
            },
            medicalConditions: {},
            healthScores: {
                average: 0,
                min: 100,
                max: 0,
                distribution: {
                    '0-20': 0,
                    '21-40': 0,
                    '41-60': 0,
                    '61-80': 0,
                    '81-100': 0
                }
            },
            riskFactors: {},
            trends: {
                daily: {},
                weekly: {},
                monthly: {}
            }
        };
    }
    
    /**
     * Add a new submission to the data store
     * @param {Object} submissionData - The processed submission data
     * @returns {Promise<boolean>} - Success status
     */
    async addSubmission(submissionData) {
        try {
            // Validate submission data
            if (!this.validateSubmissionData(submissionData)) {
                throw new Error('Invalid submission data');
            }
            
            // Get current submissions
            const submissions = this.getSubmissions();
            
            // Check storage limits
            if (submissions.length >= this.getSettings().maxSubmissions) {
                // Remove oldest submissions if limit exceeded
                const excessCount = submissions.length - this.getSettings().maxSubmissions + 1;
                submissions.splice(0, excessCount);
            }
            
            // Add timestamp if not present
            if (!submissionData.timestamp) {
                submissionData.timestamp = new Date().toISOString();
            }
            
            // Add unique ID
            submissionData.id = this.generateUniqueId();
            
            // Anonymize data if required
            if (this.getSettings().anonymizeData) {
                submissionData = this.anonymizeSubmission(submissionData);
            }
            
            // Add to submissions array
            submissions.push(submissionData);
            
            // Save updated submissions
            localStorage.setItem(this.storageKeys.submissions, JSON.stringify(submissions));
            
            // Update statistics
            await this.updateStatistics(submissions);
            
            return true;
        } catch (error) {
            console.error('Error adding submission:', error);
            return false;
        }
    }
    
    /**
     * Validate submission data structure
     * @param {Object} data - Submission data to validate
     * @returns {boolean} - Validation result
     */
    validateSubmissionData(data) {
        const requiredFields = [
            'demographics',
            'lifestyle', 
            'medicalConditions',
            'overallHealth',
            'healthClassification',
            'healthScore'
        ];
        
        // Check required top-level fields
        for (const field of requiredFields) {
            if (!data.hasOwnProperty(field)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate demographics
        if (!data.demographics.ageGroup || !data.demographics.gender) {
            console.error('Missing required demographic fields');
            return false;
        }
        
        // Validate health score range
        if (typeof data.healthScore !== 'number' || data.healthScore < 0 || data.healthScore > 100) {
            console.error('Invalid health score');
            return false;
        }
        
        // Validate health classification
        const validClassifications = ['healthy', 'moderate', 'abnormal'];
        if (!validClassifications.includes(data.healthClassification)) {
            console.error('Invalid health classification');
            return false;
        }
        
        return true;
    }
    
    /**
     * Anonymize submission data to protect privacy
     * @param {Object} submission - Original submission data
     * @returns {Object} - Anonymized submission data
     */
    anonymizeSubmission(submission) {
        const anonymized = JSON.parse(JSON.stringify(submission));
        
        // Generalize location to city/region level only
        if (anonymized.demographics.location) {
            const locationParts = anonymized.demographics.location.split(',');
            anonymized.demographics.location = locationParts[0].trim(); // Keep only first part
        }
        
        // Remove any additional comments that might contain PII
        if (anonymized.additionalComments) {
            // Keep only if it doesn't contain potential PII patterns
            const piiPatterns = [
                /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
                /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
                /\b\d{3}-\d{3}-\d{4}\b/, // Phone pattern
                /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct)\b/i // Address pattern
            ];
            
            let containsPII = false;
            for (const pattern of piiPatterns) {
                if (pattern.test(anonymized.additionalComments)) {
                    containsPII = true;
                    break;
                }
            }
            
            if (containsPII) {
                anonymized.additionalComments = '[Comments removed for privacy]';
            }
        }
        
        return anonymized;
    }
    
    /**
     * Generate a unique ID for submissions
     * @returns {string} - Unique identifier
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    /**
     * Update aggregated statistics
     * @param {Array} submissions - All submissions
     */
    async updateStatistics(submissions) {
        try {
            const stats = this.createInitialStatistics();
            stats.totalSubmissions = submissions.length;
            stats.lastUpdated = new Date().toISOString();
            
            let totalHealthScore = 0;
            let minScore = 100;
            let maxScore = 0;
            
            submissions.forEach(submission => {
                // Demographics
                this.incrementCounter(stats.demographics.ageGroups, submission.demographics.ageGroup);
                this.incrementCounter(stats.demographics.genders, submission.demographics.gender);
                
                // Simplified location (city only)
                const location = submission.demographics.location.split(',')[0].trim();
                this.incrementCounter(stats.demographics.locations, location);
                
                // Lifestyle
                this.incrementCounter(stats.lifestyle.physicalActivity, submission.lifestyle.physicalActivity);
                this.incrementCounter(stats.lifestyle.dietHabits, submission.lifestyle.dietHabits);
                this.incrementCounter(stats.lifestyle.sleepHours, submission.lifestyle.sleepHours);
                this.incrementCounter(stats.lifestyle.smoking, submission.lifestyle.smoking);
                this.incrementCounter(stats.lifestyle.alcohol, submission.lifestyle.alcohol);
                
                // Health classifications
                this.incrementCounter(stats.healthClassifications, submission.healthClassification);
                
                // Medical conditions
                if (Array.isArray(submission.medicalConditions)) {
                    submission.medicalConditions.forEach(condition => {
                        if (condition !== 'none') {
                            this.incrementCounter(stats.medicalConditions, condition);
                        }
                    });
                }
                
                // Health scores
                const score = submission.healthScore;
                totalHealthScore += score;
                minScore = Math.min(minScore, score);
                maxScore = Math.max(maxScore, score);
                
                // Health score distribution
                if (score <= 20) stats.healthScores.distribution['0-20']++;
                else if (score <= 40) stats.healthScores.distribution['21-40']++;
                else if (score <= 60) stats.healthScores.distribution['41-60']++;
                else if (score <= 80) stats.healthScores.distribution['61-80']++;
                else stats.healthScores.distribution['81-100']++;
                
                // Risk factors
                if (Array.isArray(submission.riskFactors)) {
                    submission.riskFactors.forEach(factor => {
                        this.incrementCounter(stats.riskFactors, factor);
                    });
                }
                
                // Trends (by date)
                const date = new Date(submission.timestamp);
                const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                const weekKey = this.getWeekKey(date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                this.incrementCounter(stats.trends.daily, dateKey);
                this.incrementCounter(stats.trends.weekly, weekKey);
                this.incrementCounter(stats.trends.monthly, monthKey);
            });
            
            // Calculate average health score
            stats.healthScores.average = submissions.length > 0 ? 
                Math.round(totalHealthScore / submissions.length) : 0;
            stats.healthScores.min = submissions.length > 0 ? minScore : 0;
            stats.healthScores.max = submissions.length > 0 ? maxScore : 0;
            
            // Save updated statistics
            localStorage.setItem(this.storageKeys.statistics, JSON.stringify(stats));
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }
    
    /**
     * Helper function to increment counters in statistics
     * @param {Object} obj - Object to increment counter in
     * @param {string} key - Key to increment
     */
    incrementCounter(obj, key) {
        if (key && key !== '') {
            obj[key] = (obj[key] || 0) + 1;
        }
    }
    
    /**
     * Get week key for trending data
     * @param {Date} date - Date object
     * @returns {string} - Week key in format YYYY-WXX
     */
    getWeekKey(date) {
        const year = date.getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }
    
    /**
     * Get all submissions
     * @returns {Array} - Array of submissions
     */
    getSubmissions() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.submissions) || '[]');
        } catch (error) {
            console.error('Error getting submissions:', error);
            return [];
        }
    }
    
    /**
     * Get aggregated statistics
     * @returns {Object} - Statistics object
     */
    getStatistics() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.statistics) || '{}');
        } catch (error) {
            console.error('Error getting statistics:', error);
            return this.createInitialStatistics();
        }
    }
    
    /**
     * Get application settings
     * @returns {Object} - Settings object
     */
    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKeys.settings) || '{}');
        } catch (error) {
            console.error('Error getting settings:', error);
            return this.defaultSettings;
        }
    }
    
    /**
     * Update application settings
     * @param {Object} newSettings - New settings to merge
     */
    updateSettings(newSettings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    }
    
    /**
     * Export data in various formats
     * @param {string} format - Export format ('json', 'csv')
     * @param {Object} options - Export options
     * @returns {Object} - Export result
     */
    exportData(format = 'json', options = {}) {
        try {
            const submissions = this.getSubmissions();
            const statistics = this.getStatistics();
            const settings = this.getSettings();
            
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    totalSubmissions: submissions.length,
                    dataVersion: '1.0',
                    source: 'Health Feedback Form'
                },
                submissions: options.includeSubmissions !== false ? submissions : [],
                statistics: options.includeStatistics !== false ? statistics : {},
                settings: options.includeSettings === true ? settings : {}
            };
            
            switch (format.toLowerCase()) {
                case 'json':
                    return this.exportAsJSON(exportData);
                case 'csv':
                    return this.exportAsCSV(submissions);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Export data as JSON
     * @param {Object} data - Data to export
     * @returns {Object} - Export result
     */
    exportAsJSON(data) {
        try {
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const filename = `health-feedback-data-${new Date().toISOString().split('T')[0]}.json`;
            
            return {
                success: true,
                blob,
                url,
                filename,
                size: blob.size,
                type: 'application/json'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Export submissions as CSV
     * @param {Array} submissions - Submissions to export
     * @returns {Object} - Export result
     */
    exportAsCSV(submissions) {
        try {
            if (submissions.length === 0) {
                throw new Error('No data to export');
            }
            
            // Define CSV headers
            const headers = [
                'Timestamp',
                'Age Group',
                'Gender',
                'Location',
                'Physical Activity',
                'Diet Habits',
                'Sleep Hours',
                'Smoking',
                'Alcohol',
                'Medical Conditions',
                'Overall Health',
                'Health Score',
                'Health Classification',
                'Risk Factors'
            ];
            
            // Convert submissions to CSV rows
            const rows = submissions.map(submission => [
                submission.timestamp,
                submission.demographics.ageGroup,
                submission.demographics.gender,
                submission.demographics.location,
                submission.lifestyle.physicalActivity,
                submission.lifestyle.dietHabits,
                submission.lifestyle.sleepHours,
                submission.lifestyle.smoking,
                submission.lifestyle.alcohol,
                Array.isArray(submission.medicalConditions) ? 
                    submission.medicalConditions.join('; ') : '',
                submission.overallHealth,
                submission.healthScore,
                submission.healthClassification,
                Array.isArray(submission.riskFactors) ? 
                    submission.riskFactors.join('; ') : ''
            ]);
            
            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(field => 
                    typeof field === 'string' && field.includes(',') ? 
                        `"${field.replace(/"/g, '""')}"` : field
                ).join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const filename = `health-feedback-submissions-${new Date().toISOString().split('T')[0]}.csv`;
            
            return {
                success: true,
                blob,
                url,
                filename,
                size: blob.size,
                type: 'text/csv'
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Download exported data
     * @param {Object} exportResult - Result from exportData method
     */
    downloadExport(exportResult) {
        if (!exportResult.success) {
            console.error('Cannot download failed export:', exportResult.error);
            return;
        }
        
        const link = document.createElement('a');
        link.href = exportResult.url;
        link.download = exportResult.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(exportResult.url), 1000);
    }
    
    /**
     * Clear all stored data
     * @param {boolean} confirm - Confirmation flag
     * @returns {boolean} - Success status
     */
    clearAllData(confirm = false) {
        if (!confirm) {
            return false;
        }
        
        try {
            localStorage.removeItem(this.storageKeys.submissions);
            localStorage.removeItem(this.storageKeys.statistics);
            localStorage.removeItem(this.storageKeys.settings);
            
            // Reinitialize with defaults
            this.initializeStorage();
            
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
    
    /**
     * Get data summary for GitHub repository storage
     * @returns {Object} - Summary data suitable for repository storage
     */
    getRepositoryData() {
        const statistics = this.getStatistics();
        const submissions = this.getSubmissions();
        
        // Create anonymized summary for repository
        return {
            metadata: {
                lastUpdated: statistics.lastUpdated,
                totalSubmissions: statistics.totalSubmissions,
                dataVersion: '1.0'
            },
            summary: {
                demographics: statistics.demographics,
                healthClassifications: statistics.healthClassifications,
                averageHealthScore: statistics.healthScores.average,
                commonRiskFactors: Object.entries(statistics.riskFactors)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
                trends: {
                    monthly: statistics.trends.monthly
                }
            },
            // Include only aggregated data, no individual submissions
            aggregatedData: {
                healthScoreDistribution: statistics.healthScores.distribution,
                lifestylePatterns: statistics.lifestyle
            }
        };
    }
    
    /**
     * Perform maintenance tasks (cleanup old data, optimize storage)
     */
    performMaintenanceTasks() {
        try {
            const settings = this.getSettings();
            const now = new Date();
            const lastCleanup = settings.lastCleanup ? new Date(settings.lastCleanup) : null;
            
            // Run cleanup weekly
            const weekInMs = 7 * 24 * 60 * 60 * 1000;
            if (!lastCleanup || (now - lastCleanup) > weekInMs) {
                this.cleanupOldData();
                this.updateSettings({ lastCleanup: now.toISOString() });
            }
        } catch (error) {
            console.error('Error performing maintenance:', error);
        }
    }
    
    /**
     * Clean up old data based on retention settings
     */
    cleanupOldData() {
        try {
            const settings = this.getSettings();
            const submissions = this.getSubmissions();
            const retentionMs = settings.dataRetentionDays * 24 * 60 * 60 * 1000;
            const cutoffDate = new Date(Date.now() - retentionMs);
            
            // Filter out old submissions
            const filteredSubmissions = submissions.filter(submission => {
                const submissionDate = new Date(submission.timestamp);
                return submissionDate > cutoffDate;
            });
            
            // Update storage if data was removed
            if (filteredSubmissions.length !== submissions.length) {
                localStorage.setItem(this.storageKeys.submissions, JSON.stringify(filteredSubmissions));
                this.updateStatistics(filteredSubmissions);
                console.log(`Cleaned up ${submissions.length - filteredSubmissions.length} old submissions`);
            }
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }
    
    /**
     * Get storage usage information
     * @returns {Object} - Storage usage details
     */
    getStorageInfo() {
        try {
            const submissions = localStorage.getItem(this.storageKeys.submissions) || '[]';
            const statistics = localStorage.getItem(this.storageKeys.statistics) || '{}';
            const settings = localStorage.getItem(this.storageKeys.settings) || '{}';
            
            const submissionsSize = new Blob([submissions]).size;
            const statisticsSize = new Blob([statistics]).size;
            const settingsSize = new Blob([settings]).size;
            const totalSize = submissionsSize + statisticsSize + settingsSize;
            
            return {
                totalSize,
                submissionsSize,
                statisticsSize,
                settingsSize,
                submissionCount: JSON.parse(submissions).length,
                formattedSize: this.formatBytes(totalSize)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { totalSize: 0, formattedSize: '0 B' };
        }
    }
    
    /**
     * Format bytes to human readable format
     * @param {number} bytes - Number of bytes
     * @returns {string} - Formatted string
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Create global instance
window.HealthDataManager = new HealthDataManager();

// Enhanced HealthDataUtils with data manager integration
window.HealthDataUtils = {
    ...window.HealthDataUtils,
    
    exportData: function(format = 'json', options = {}) {
        const result = window.HealthDataManager.exportData(format, options);
        if (result.success) {
            window.HealthDataManager.downloadExport(result);
        } else {
            alert('Export failed: ' + result.error);
        }
    },
    
    exportCSV: function() {
        this.exportData('csv');
    },
    
    exportJSON: function() {
        this.exportData('json');
    },
    
    clearAllData: function() {
        if (confirm('Are you sure you want to clear all stored health data? This action cannot be undone.')) {
            const success = window.HealthDataManager.clearAllData(true);
            if (success) {
                alert('All data has been cleared.');
                window.location.reload();
            } else {
                alert('Failed to clear data. Please try again.');
            }
        }
    },
    
    getSubmissions: function() {
        return window.HealthDataManager.getSubmissions();
    },
    
    getStatistics: function() {
        return window.HealthDataManager.getStatistics();
    },
    
    getStorageInfo: function() {
        return window.HealthDataManager.getStorageInfo();
    },
    
    getRepositoryData: function() {
        return window.HealthDataManager.getRepositoryData();
    }
};

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthDataManager;
}
