/**
 * Health Feedback Form - Main Application JavaScript
 * Handles form validation, data processing, and local storage
 */

class HealthFeedbackApp {
    constructor() {
        this.form = document.getElementById('health-feedback-form');
        this.formStatus = document.getElementById('form-status');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.resetButton = this.form.querySelector('button[type="reset"]');
        
        // Health classification thresholds
        this.healthThresholds = {
            physicalActivity: {
                healthy: ['moderate', 'active', 'very-active'],
                abnormal: ['sedentary', 'light']
            },
            sleepHours: {
                healthy: ['7-8', '9-10'],
                abnormal: ['less-than-5', '5-6', 'more-than-10']
            },
            smoking: {
                healthy: ['never'],
                abnormal: ['former', 'occasional', 'regular']
            },
            alcohol: {
                healthy: ['never', 'rarely', 'moderate'],
                abnormal: ['regular']
            },
            overallHealth: {
                healthy: ['excellent', 'good'],
                abnormal: ['fair', 'poor']
            }
        };
        
        // Risk conditions that indicate abnormal health
        this.riskConditions = [
            'diabetes', 'hypertension', 'heart-disease', 'asthma', 
            'arthritis', 'depression', 'anxiety', 'obesity'
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupModalHandlers();
        this.loadExistingData();
        this.setupFormValidation();
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Form reset
        this.resetButton.addEventListener('click', (e) => this.handleReset(e));
        
        // Real-time validation
        this.form.addEventListener('input', (e) => this.handleInput(e));
        this.form.addEventListener('change', (e) => this.handleChange(e));
        
        // Special handling for "none" checkbox
        const noneCheckbox = document.getElementById('condition-none');
        if (noneCheckbox) {
            noneCheckbox.addEventListener('change', (e) => this.handleNoneCondition(e));
        }
        
        // Handle other medical condition checkboxes
        const conditionCheckboxes = document.querySelectorAll('input[name="medicalConditions"]:not(#condition-none)');
        conditionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.handleConditionChange(e));
        });
    }
    
    setupModalHandlers() {
        // Privacy policy modal
        const privacyLink = document.querySelector('a[href="#privacy-policy"]');
        const privacyModal = document.getElementById('privacy-policy');
        const dataUsageLink = document.querySelector('a[href="#data-usage"]');
        const dataUsageModal = document.getElementById('data-usage');
        
        if (privacyLink && privacyModal) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(privacyModal);
            });
        }
        
        if (dataUsageLink && dataUsageModal) {
            dataUsageLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal(dataUsageModal);
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
    
    setupFormValidation() {
        // Add validation to required fields
        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
        });
    }
    
    handleInput(e) {
        const field = e.target;
        
        // Clear previous validation state
        this.clearFieldError(field);
        
        // Sanitize input
        if (field.type === 'text') {
            field.value = this.sanitizeInput(field.value);
        }
    }
    
    handleChange(e) {
        const field = e.target;
        this.validateField(field);
    }
    
    handleNoneCondition(e) {
        const noneCheckbox = e.target;
        const otherCheckboxes = document.querySelectorAll('input[name="medicalConditions"]:not(#condition-none)');
        
        if (noneCheckbox.checked) {
            // Uncheck all other conditions
            otherCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    }
    
    handleConditionChange(e) {
        const checkbox = e.target;
        const noneCheckbox = document.getElementById('condition-none');
        
        if (checkbox.checked && noneCheckbox) {
            // Uncheck "none" if any other condition is selected
            noneCheckbox.checked = false;
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Validate entire form
            const isValid = this.validateForm();
            
            if (!isValid) {
                this.showFormStatus('Please correct the errors below and try again.', 'error');
                this.setLoadingState(false);
                return;
            }
            
            // Collect and process form data
            const formData = this.collectFormData();
            const processedData = this.processHealthData(formData);
            
            // Save to local storage
            await this.saveToLocalStorage(processedData);
            
            // Show success message
            this.showFormStatus('Thank you! Your health information has been submitted successfully.', 'success');
            
            // Reset form after successful submission
            setTimeout(() => {
                this.form.reset();
                this.clearAllErrors();
                this.hideFormStatus();
            }, 3000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormStatus('An error occurred while submitting your information. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    handleReset(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to clear all form data?')) {
            this.form.reset();
            this.clearAllErrors();
            this.hideFormStatus();
        }
    }
    
    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const fieldValue = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required')) {
            if (field.type === 'radio') {
                const radioGroup = this.form.querySelectorAll(`input[name="${fieldName}"]`);
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isChecked) {
                    isValid = false;
                    errorMessage = 'This field is required.';
                }
            } else if (field.type === 'checkbox') {
                // For checkbox groups, check if at least one is selected
                const checkboxGroup = this.form.querySelectorAll(`input[name="${fieldName}"]`);
                const isChecked = Array.from(checkboxGroup).some(checkbox => checkbox.checked);
                // Note: Medical conditions are optional, so we don't validate them as required
            } else if (!fieldValue) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
        }
        
        // Specific field validations
        if (fieldValue && fieldName === 'location') {
            if (fieldValue.length < 2) {
                isValid = false;
                errorMessage = 'Please enter a valid location.';
            } else if (!/^[a-zA-Z\s,.-]+$/.test(fieldValue)) {
                isValid = false;
                errorMessage = 'Location should only contain letters, spaces, commas, periods, and hyphens.';
            }
        }
        
        if (fieldValue && fieldName === 'additionalComments') {
            if (fieldValue.length > 500) {
                isValid = false;
                errorMessage = 'Comments must be 500 characters or less.';
            }
        }
        
        // Show/hide error message
        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        const fieldGroup = field.closest('.form-group') || field.closest('.radio-group') || field.closest('.checkbox-group');
        if (!fieldGroup) return;
        
        fieldGroup.classList.add('error');
        
        // Find or create error message element
        let errorElement = fieldGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = fieldGroup.querySelector(`#${field.name}-error`);
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group') || field.closest('.radio-group') || field.closest('.checkbox-group');
        if (!fieldGroup) return;
        
        fieldGroup.classList.remove('error');
        
        const errorElement = fieldGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }
    
    clearAllErrors() {
        const errorGroups = this.form.querySelectorAll('.form-group.error, .radio-group.error, .checkbox-group.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
        });
        
        const errorMessages = this.form.querySelectorAll('.error-message.show');
        errorMessages.forEach(message => {
            message.textContent = '';
            message.classList.remove('show');
        });
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {
            timestamp: new Date().toISOString(),
            demographics: {},
            lifestyle: {},
            medicalConditions: [],
            additionalComments: ''
        };
        
        // Demographics
        data.demographics.ageGroup = formData.get('ageGroup');
        data.demographics.gender = formData.get('gender');
        data.demographics.location = this.sanitizeInput(formData.get('location'));
        
        // Lifestyle
        data.lifestyle.physicalActivity = formData.get('physicalActivity');
        data.lifestyle.dietHabits = formData.get('dietHabits');
        data.lifestyle.sleepHours = formData.get('sleepHours');
        data.lifestyle.smoking = formData.get('smoking');
        data.lifestyle.alcohol = formData.get('alcohol');
        
        // Medical conditions
        const conditions = formData.getAll('medicalConditions');
        data.medicalConditions = conditions;
        
        // Overall health
        data.overallHealth = formData.get('overallHealth');
        
        // Additional comments
        data.additionalComments = this.sanitizeInput(formData.get('additionalComments') || '');
        
        return data;
    }
    
    processHealthData(data) {
        const processed = {
            ...data,
            healthClassification: this.classifyHealth(data),
            riskFactors: this.identifyRiskFactors(data),
            healthScore: this.calculateHealthScore(data)
        };
        
        return processed;
    }
    
    classifyHealth(data) {
        let healthyCount = 0;
        let abnormalCount = 0;
        
        // Check physical activity
        if (this.healthThresholds.physicalActivity.healthy.includes(data.lifestyle.physicalActivity)) {
            healthyCount++;
        } else if (this.healthThresholds.physicalActivity.abnormal.includes(data.lifestyle.physicalActivity)) {
            abnormalCount++;
        }
        
        // Check sleep hours
        if (this.healthThresholds.sleepHours.healthy.includes(data.lifestyle.sleepHours)) {
            healthyCount++;
        } else if (this.healthThresholds.sleepHours.abnormal.includes(data.lifestyle.sleepHours)) {
            abnormalCount++;
        }
        
        // Check smoking
        if (this.healthThresholds.smoking.healthy.includes(data.lifestyle.smoking)) {
            healthyCount++;
        } else if (this.healthThresholds.smoking.abnormal.includes(data.lifestyle.smoking)) {
            abnormalCount++;
        }
        
        // Check alcohol
        if (this.healthThresholds.alcohol.healthy.includes(data.lifestyle.alcohol)) {
            healthyCount++;
        } else if (this.healthThresholds.alcohol.abnormal.includes(data.lifestyle.alcohol)) {
            abnormalCount++;
        }
        
        // Check overall health
        if (this.healthThresholds.overallHealth.healthy.includes(data.overallHealth)) {
            healthyCount++;
        } else if (this.healthThresholds.overallHealth.abnormal.includes(data.overallHealth)) {
            abnormalCount++;
        }
        
        // Check medical conditions
        const hasRiskConditions = data.medicalConditions.some(condition => 
            this.riskConditions.includes(condition) && condition !== 'none'
        );
        
        if (hasRiskConditions) {
            abnormalCount += 2; // Weight medical conditions more heavily
        } else if (data.medicalConditions.includes('none')) {
            healthyCount++;
        }
        
        // Determine classification
        if (abnormalCount > healthyCount) {
            return 'abnormal';
        } else if (healthyCount > abnormalCount) {
            return 'healthy';
        } else {
            return 'moderate';
        }
    }
    
    identifyRiskFactors(data) {
        const riskFactors = [];
        
        // Lifestyle risk factors
        if (data.lifestyle.physicalActivity === 'sedentary') {
            riskFactors.push('Sedentary lifestyle');
        }
        
        if (data.lifestyle.sleepHours === 'less-than-5' || data.lifestyle.sleepHours === 'more-than-10') {
            riskFactors.push('Poor sleep patterns');
        }
        
        if (data.lifestyle.smoking === 'regular' || data.lifestyle.smoking === 'occasional') {
            riskFactors.push('Smoking');
        }
        
        if (data.lifestyle.alcohol === 'regular') {
            riskFactors.push('High alcohol consumption');
        }
        
        if (data.lifestyle.dietHabits === 'fast-food') {
            riskFactors.push('Poor diet habits');
        }
        
        // Medical condition risk factors
        const medicalRisks = data.medicalConditions.filter(condition => 
            this.riskConditions.includes(condition)
        );
        riskFactors.push(...medicalRisks.map(condition => 
            condition.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
        ));
        
        return riskFactors;
    }
    
    calculateHealthScore(data) {
        let score = 50; // Base score
        
        // Physical activity scoring
        const activityScores = {
            'very-active': 20,
            'active': 15,
            'moderate': 10,
            'light': 5,
            'sedentary': -10
        };
        score += activityScores[data.lifestyle.physicalActivity] || 0;
        
        // Sleep scoring
        const sleepScores = {
            '7-8': 15,
            '9-10': 10,
            '5-6': 5,
            'less-than-5': -15,
            'more-than-10': -5
        };
        score += sleepScores[data.lifestyle.sleepHours] || 0;
        
        // Smoking scoring
        const smokingScores = {
            'never': 10,
            'former': 5,
            'occasional': -5,
            'regular': -20
        };
        score += smokingScores[data.lifestyle.smoking] || 0;
        
        // Alcohol scoring
        const alcoholScores = {
            'never': 5,
            'rarely': 5,
            'moderate': 0,
            'regular': -10
        };
        score += alcoholScores[data.lifestyle.alcohol] || 0;
        
        // Overall health scoring
        const healthScores = {
            'excellent': 20,
            'good': 10,
            'fair': -5,
            'poor': -20
        };
        score += healthScores[data.overallHealth] || 0;
        
        // Medical conditions scoring
        const riskConditionCount = data.medicalConditions.filter(condition => 
            this.riskConditions.includes(condition)
        ).length;
        score -= riskConditionCount * 10;
        
        if (data.medicalConditions.includes('none')) {
            score += 10;
        }
        
        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, score));
    }
    
    async saveToLocalStorage(data) {
        try {
            // Get existing submissions
            const existingData = JSON.parse(localStorage.getItem('healthFeedbackSubmissions') || '[]');
            
            // Add new submission
            existingData.push(data);
            
            // Save back to localStorage
            localStorage.setItem('healthFeedbackSubmissions', JSON.stringify(existingData));
            
            // Update summary statistics
            this.updateSummaryStatistics(existingData);
            
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            throw new Error('Failed to save data');
        }
    }
    
    updateSummaryStatistics(submissions) {
        const stats = {
            totalSubmissions: submissions.length,
            lastUpdated: new Date().toISOString(),
            demographics: {
                ageGroups: {},
                genders: {},
                locations: {}
            },
            healthClassifications: {
                healthy: 0,
                abnormal: 0,
                moderate: 0
            },
            averageHealthScore: 0,
            commonRiskFactors: {}
        };
        
        let totalScore = 0;
        
        submissions.forEach(submission => {
            // Demographics
            stats.demographics.ageGroups[submission.demographics.ageGroup] = 
                (stats.demographics.ageGroups[submission.demographics.ageGroup] || 0) + 1;
            
            stats.demographics.genders[submission.demographics.gender] = 
                (stats.demographics.genders[submission.demographics.gender] || 0) + 1;
            
            // Simplified location grouping (just the first part before comma)
            const locationKey = submission.demographics.location.split(',')[0].trim();
            stats.demographics.locations[locationKey] = 
                (stats.demographics.locations[locationKey] || 0) + 1;
            
            // Health classifications
            stats.healthClassifications[submission.healthClassification]++;
            
            // Health scores
            totalScore += submission.healthScore;
            
            // Risk factors
            submission.riskFactors.forEach(factor => {
                stats.commonRiskFactors[factor] = (stats.commonRiskFactors[factor] || 0) + 1;
            });
        });
        
        stats.averageHealthScore = Math.round(totalScore / submissions.length);
        
        localStorage.setItem('healthFeedbackStats', JSON.stringify(stats));
    }
    
    loadExistingData() {
        // This could be used to pre-populate form fields if needed
        // For now, we'll just ensure localStorage is initialized
        if (!localStorage.getItem('healthFeedbackSubmissions')) {
            localStorage.setItem('healthFeedbackSubmissions', '[]');
        }
        
        if (!localStorage.getItem('healthFeedbackStats')) {
            const initialStats = {
                totalSubmissions: 0,
                lastUpdated: new Date().toISOString(),
                demographics: { ageGroups: {}, genders: {}, locations: {} },
                healthClassifications: { healthy: 0, abnormal: 0, moderate: 0 },
                averageHealthScore: 0,
                commonRiskFactors: {}
            };
            localStorage.setItem('healthFeedbackStats', JSON.stringify(initialStats));
        }
    }
    
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove potentially dangerous characters and scripts
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    
    setLoadingState(isLoading) {
        if (isLoading) {
            this.submitButton.classList.add('loading');
            this.submitButton.disabled = true;
        } else {
            this.submitButton.classList.remove('loading');
            this.submitButton.disabled = false;
        }
    }
    
    showFormStatus(message, type) {
        this.formStatus.textContent = message;
        this.formStatus.className = `form-status ${type}`;
        this.formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    hideFormStatus() {
        this.formStatus.textContent = '';
        this.formStatus.className = 'form-status';
    }
}

// Utility functions for data export (used by dashboard)
window.HealthDataUtils = {
    exportData: function() {
        const submissions = JSON.parse(localStorage.getItem('healthFeedbackSubmissions') || '[]');
        const stats = JSON.parse(localStorage.getItem('healthFeedbackStats') || '{}');
        
        const exportData = {
            submissions,
            statistics: stats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-feedback-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    clearAllData: function() {
        if (confirm('Are you sure you want to clear all stored health data? This action cannot be undone.')) {
            localStorage.removeItem('healthFeedbackSubmissions');
            localStorage.removeItem('healthFeedbackStats');
            alert('All data has been cleared.');
            window.location.reload();
        }
    },
    
    getSubmissions: function() {
        return JSON.parse(localStorage.getItem('healthFeedbackSubmissions') || '[]');
    },
    
    getStatistics: function() {
        return JSON.parse(localStorage.getItem('healthFeedbackStats') || '{}');
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new HealthFeedbackApp();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthFeedbackApp;
}
