// Application Spoon Tracker
class SpoonTracker {
    constructor() {
        this.spoons = 12;
        this.totalSpent = 0;
        this.activities = [];
        this.completedActivities = 0;
        this.sessionStartTime = new Date();

        this.init();
    }

    init() {
        this.updateDisplay();
        this.setupEventListeners();
        this.loadExampleActivities();
        this.trackSession();
    }

    setupEventListeners() {
        // Gestion des entrées clavier
        document.getElementById('activityName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addActivity();
            }
        });

        document.getElementById('activityCost').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addActivity();
            }
        });

        // Prévenir la soumission de formulaire
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
            }
        });
    }

    updateDisplay() {
        document.getElementById('spoonCount').textContent = this.spoons;
        this.updateSpoonVisual();
        this.updateStats();
    }

    updateSpoonVisual() {
        const visual = document.getElementById('spoonVisual');
        const spoonEmoji = '🥄';
        const emptySpoon = '⚫';

        let display = '';
        for (let i = 0; i < Math.min(this.spoons, 15); i++) {
            display += spoonEmoji;
        }
        for (let i = this.spoons; i < 12; i++) {
            display += emptySpoon;
        }

        visual.textContent = display;
    }

    updateStats() {
        document.getElementById('totalSpent').textContent = this.totalSpent;
        document.getElementById('activitiesDone').textContent = this.completedActivities;

        const energyLevel = document.getElementById('energyLevel');
        if (this.spoons >= 10) {
            energyLevel.textContent = 'Excellent';
            energyLevel.style.color = '#4ecdc4';
        } else if (this.spoons >= 6) {
            energyLevel.textContent = 'Bon';
            energyLevel.style.color = '#ffa726';
        } else if (this.spoons >= 3) {
            energyLevel.textContent = 'Faible';
            energyLevel.style.color = '#ff6b6b';
        } else {
            energyLevel.textContent = 'Critique';
            energyLevel.style.color = '#d32f2f';
        }
    }

    addSpoons() {
        this.spoons += 1;
        this.updateDisplay();
        this.trackEvent('SpoonAdded', { newCount: this.spoons });
        this.animateSpoonDisplay();
    }

    removeSpoon() {
        if (this.spoons > 0) {
            this.spoons -= 1;
            this.totalSpent += 1;
            this.updateDisplay();
            this.trackEvent('SpoonRemoved', { newCount: this.spoons, totalSpent: this.totalSpent });
        }
    }

    resetDay() {
        if (confirm('Êtes-vous sûr de vouloir commencer un nouveau jour ?')) {
            const previousStats = {
                spoons: this.spoons,
                totalSpent: this.totalSpent,
                completedActivities: this.completedActivities,
                sessionDuration: this.getSessionDuration()
            };

            this.spoons = 12;
            this.totalSpent = 0;
            this.completedActivities = 0;
            this.activities = [];
            this.sessionStartTime = new Date();

            document.getElementById('activityList').innerHTML = '';
            this.updateDisplay();
            this.loadExampleActivities();

            this.trackEvent('DayReset', previousStats);
        }
    }

    addActivity() {
        const nameInput = document.getElementById('activityName');
        const costInput = document.getElementById('activityCost');

        const name = nameInput.value.trim();
        const cost = parseInt(costInput.value) || 1;

        if (!name) {
            alert('Veuillez entrer un nom d\'activité');
            nameInput.focus();
            return;
        }

        if (cost < 1 || cost > 10) {
            alert('Le coût doit être entre 1 et 10 cuillères');
            costInput.focus();
            return;
        }

        const activity = {
            id: Date.now(),
            name: name,
            cost: cost,
            createdAt: new Date()
        };

        this.activities.push(activity);
        this.renderActivities();

        nameInput.value = '';
        costInput.value = '1';
        nameInput.focus();

        this.trackEvent('ActivityAdded', {
            activityName: name,
            cost: cost,
            totalActivities: this.activities.length
        });
    }

    renderActivities() {
        const list = document.getElementById('activityList');
        list.innerHTML = '';

        if (this.activities.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Aucune activité ajoutée</p>';
            return;
        }

        this.activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-info">
                    <span class="activity-cost">${activity.cost} 🥄</span>
                    <span>${activity.name}</span>
                </div>
                <div>
                    <button class="btn btn-success btn-small" onclick="spoonTracker.doActivity(${activity.id})" ${this.spoons < activity.cost ? 'disabled' : ''}>
                        Faire
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="spoonTracker.removeActivity(${activity.id})">
                        ✕
                    </button>
                </div>
            `;
            list.appendChild(item);
        });
    }

    doActivity(id) {
        const activity = this.activities.find(a => a.id === id);
        if (activity && this.spoons >= activity.cost) {
            this.spoons -= activity.cost;
            this.totalSpent += activity.cost;
            this.completedActivities += 1;

            // Retirer l'activité de la liste
            this.activities = this.activities.filter(a => a.id !== id);
            this.renderActivities();
            this.updateDisplay();

            // Animation de succès
            this.animateSpoonDisplay();

            this.trackEvent('ActivityCompleted', {
                activityName: activity.name,
                cost: activity.cost,
                remainingSpoons: this.spoons,
                totalCompleted: this.completedActivities
            });

            // Notification de félicitation si énergie critique
            if (this.spoons <= 2) {
                setTimeout(() => {
                    alert('⚠️ Attention ! Votre énergie est critique. Pensez à vous reposer !');
                }, 500);
            }
        }
    }

    removeActivity(id) {
        const activity = this.activities.find(a => a.id === id);
        this.activities = this.activities.filter(a => a.id !== id);
        this.renderActivities();

        if (activity) {
            this.trackEvent('ActivityRemoved', {
                activityName: activity.name,
                cost: activity.cost
            });
        }
    }

    loadExampleActivities() {
        this.activities = [
            { id: 1, name: "Prendre une douche", cost: 2, createdAt: new Date() },
            { id: 2, name: "Faire les courses", cost: 4, createdAt: new Date() },
            { id: 3, name: "Préparer le repas", cost: 3, createdAt: new Date() },
            { id: 4, name: "Répondre aux emails", cost: 2, createdAt: new Date() }
        ];
        this.renderActivities();
    }

    animateSpoonDisplay() {
        const spoonDisplay = document.getElementById('spoonCount');
        spoonDisplay.classList.add('animate');
        setTimeout(() => {
            spoonDisplay.classList.remove('animate');
        }, 600);
    }

    getSessionDuration() {
        return Math.round((new Date() - this.sessionStartTime) / 1000 / 60); // en minutes
    }

    trackEvent(eventName, properties = {}) {
        if (window.appInsights) {
            appInsights.trackEvent({
                name: eventName,
                properties: {
                    ...properties,
                    sessionDuration: this.getSessionDuration(),
                    timestamp: new Date().toISOString()
                }
            });
        }

        // Log pour développement
        console.log(`Event: ${eventName}`, properties);
    }

    trackSession() {
        this.trackEvent('SessionStarted', {
            initialSpoons: this.spoons,
            userAgent: navigator.userAgent,
            language: navigator.language
        });

        // Track session périodiquement
        setInterval(() => {
            this.trackEvent('SessionHeartbeat', {
                currentSpoons: this.spoons,
                totalSpent: this.totalSpent,
                activitiesCount: this.activities.length,
                sessionDuration: this.getSessionDuration()
            });
        }, 5 * 60 * 1000); // Toutes les 5 minutes
    }
}

// Fonctions globales pour la compatibilité avec le HTML existant
let spoonTracker;

function addSpoons() {
    spoonTracker.addSpoons();
}

function removeSpoon() {
    spoonTracker.removeSpoon();
}

function resetDay() {
    spoonTracker.resetDay();
}

function addActivity() {
    spoonTracker.addActivity();
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function () {
    spoonTracker = new SpoonTracker();

    // Configuration des variables d'environnement
    if (window.BUILD_ID) {
        console.log(`Spoon Tracker - Build: ${window.BUILD_ID}`);
    }
    if (window.ENVIRONMENT) {
        console.log(`Environment: ${window.ENVIRONMENT}`);
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function (e) {
    if (window.appInsights) {
        appInsights.trackException({
            exception: e.error,
            properties: {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            }
        });
    }
    console.error('Global error:', e);
});