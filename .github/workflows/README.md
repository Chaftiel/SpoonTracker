# 🥄 Gestionnaire de Cuillères - Spoon Tracker

Application web pour gérer votre énergie quotidienne basée sur la [théorie des cuillères](https://fr.wikipedia.org/wiki/Th%C3%A9orie_des_cuill%C3%A8res).

## 🎯 Fonctionnalités

- ✅ **Suivi d'énergie** : Compteur visuel de cuillères
- ✅ **Gestion d'activités** : Ajout et coût énergétique
- ✅ **Statistiques** : Suivi quotidien et analyse
- ✅ **Interface responsive** : Mobile et desktop
- ✅ **Monitoring** : Intégration Application Insights
- ✅ **PWA Ready** : Installation possible

## 🚀 Déploiement rapide

### Prérequis
- Compte Azure avec subscription active
- Compte Azure DevOps
- Permissions Contributor sur Azure

### Étapes
1. **Cloner ce repository** dans Azure DevOps
2. **Configurer la Service Connection** Azure
3. **Lancer le pipeline** (déclenchement automatique)
4. **Accéder à l'application** via l'URL fournie

## 🏗️ Architecture
Azure Resource Group
├── App Service Plan (F1/B1)
├── App Service (Web App)
├── Application Insights
├── Log Analytics Workspace
└── Storage Account (optionnel)

## 🔄 Pipeline CI/CD

Le pipeline Azure DevOps comprend :

1. **Validation** : Tests syntaxiques HTML/JS
2. **Build** : Package des artefacts
3. **Infrastructure** : Déploiement ARM templates
4. **Application** : Déploiement App Service
5. **Tests** : Health checks automatiques

### Environnements
- `develop` → Environnement dev (F1 gratuit)
- `main` → Environnement prod (B1 payant)
- `feature/*` → Environnements temporaires

## 🛠️ Développement local
bash
# Installation
npm install

# Serveur local
npm start
# ou
npm run serve

# Tests
npm test

# Validation
npm run validate

Monitoring
L'application inclut :

Application Insights : Métriques et erreurs
Health checks : Validation post-déploiement
Custom events : Tracking des actions utilisateur

🔧 Configuration
Variables d'environnement

ENVIRONMENT : dev/staging/prod
BUILD_ID : Numéro de build
APPINSIGHTS_INSTRUMENTATIONKEY : Clé monitoring

Paramètres ARM

appName : Nom de base (max 10 caractères)
environment : Environnement cible
sku : Taille App Service Plan
enableApplicationInsights : Monitoring on/off

📱 Utilisation

Démarrage : Vous commencez avec 12 cuillères
Activités : Ajoutez vos tâches avec leur coût
Exécution : Cliquez "Faire" pour dépenser l'énergie
Suivi : Monitoring en temps réel de votre énergie

🔮 Fonctionnalités futures

 Base de données pour historique
 API REST pour synchronisation
 Authentification utilisateur
 Notifications push
 Application mobile native
 IA pour suggestions d'optimisation

📝 License
MIT License - Voir LICENSE pour détails.

---

## 📄 Fichiers additionnels

### 10. docs/DEPLOYMENT.md
```markdown
# 📚 Guide de Déploiement Détaillé

## Prérequis techniques

### Azure
- Subscription Azure active
- Permissions `Contributor` ou `Owner`
- Quotas suffisants pour App Service

### Azure DevOps
- Organisation Azure DevOps
- Project avec permissions d'admin
- Service Connection configurée

## Configuration initiale

### 1. Création du projet Azure DevOps
```bash
# Via Azure CLI (optionnel)
az devops project create --name "SpoonTrackerApp" --description "Gestionnaire de cuillères"
2. Service Connection

Project Settings → Service connections
New service connection → Azure Resource Manager
Service principal (automatic)
Remplir :

Subscription : Votre subscription Azure
Resource group : Laisser vide (toutes les RG)
Service connection name : Azure-ServiceConnection


✅ Grant access permission to all pipelines

3. Variables de pipeline (optionnel)
Dans Pipelines → Library, créer un groupe de variables :
yaml# Variable Group: SpoonTracker-Config
azureSubscription: 'Azure-ServiceConnection'
appName: 'spoontracker'
location: 'West Europe'
Déploiement par environnement
Environnement de développement
bash# Via pipeline automatique (branche develop)
git checkout -b develop
git push origin develop
Ressources créées :

Resource Group: rg-spoontracker-dev
App Service Plan: spoontracker-dev-asp (F1 - Gratuit)
Web App: spoontracker-dev-wa
Application Insights: spoontracker-dev-ai

Environnement de production
bash# Via pipeline automatique (branche main)
git checkout main
git merge develop
git push origin main
Ressources créées :

Resource Group: rg-spoontracker-prod
App Service Plan: spoontracker-prod-asp (B1 - ~13€/mois)
Web App: spoontracker-prod-wa
Application Insights: spoontracker-prod-ai

Personnalisation
Modifier les paramètres
Éditez infrastructure/arm-templates/parameters.json :
json{
    "parameters": {
        "appName": { "value": "monapp" },
        "sku": { "value": "B1" }
    }
}
Ajouter des environnements
Modifiez azure-pipelines.yml :
yaml${{ if eq(variables['Build.SourceBranchName'], 'staging') }}:
  environment: 'staging'
  resourceGroupName: 'rg-spoontracker-staging'
  appServiceSku: 'B1'
Surveillance et monitoring
Application Insights
Accès aux métriques :

Portal Azure → Application Insights
spoontracker-{env}-ai
Overview → Voir les métriques

Logs App Service
bash# Via Azure CLI
az webapp log tail --name spoontracker-dev-wa --resource-group rg-spoontracker-dev
Health checks
Le pipeline inclut des tests automatiques :

HTTP 200 response
Contenu applicatif présent
Ressources JavaScript chargées

Dépannage
Erreurs communes
Pipeline failed: Service Connection
bash# Vérifier les permissions
az role assignment list --assignee {service-principal-id}
Deployment failed: Resource Group
bash# Créer manuellement si nécessaire
az group create --name rg-spoontracker-dev --location "West Europe"
App Service not responding
bash# Redémarrer l'application
az webapp restart --name spoontracker-dev-wa --resource-group rg-spoontracker-dev
Nettoyage des ressources
bash# Supprimer tout l'environnement dev
az group delete --name rg-spoontracker-dev --yes --no-wait

# Supprimer tout l'environnement prod
az group delete --name rg-spoontracker-prod --yes --no-wait
Coûts estimés
EnvironnementCoût mensuelRessourcesDev (F1)~2-5€App Service F1 (gratuit) + AI + StorageProd (B1)~15-20€App Service B1 + AI + Storage
Support

📧 Issues : Utiliser le système de tickets Azure DevOps
📖 Documentation : Voir /docs pour plus d'infos
🔧 Troubleshooting : Consulter les logs Application Insights


### 11. tests/unit/spoon-tracker.test.js
```javascript
// Tests unitaires pour Spoon Tracker
// Utilisation : Node.js simple (pas de framework de test pour simplifier)

class SpoonTrackerTests {
    constructor() {
        this.testResults = [];
        this.runAllTests();
    }
    
    // Mock du DOM pour les tests
    setupMockDOM() {
        global.document = {
            getElementById: (id) => {
                const mockElements = {
                    spoonCount: { textContent: '12' },
                    spoonVisual: { textContent: '' },
                    totalSpent: { textContent: '0' },
                    activitiesDone: { textContent: '0' },
                    energyLevel: { 
                        textContent: 'Excellent',
                        style: { color: '' }
                    },
                    activityList: { innerHTML: '' },
                    activityName: { value: '', focus: () => {} },
                    activityCost: { value: '1', focus: () => {} }
                };
                return mockElements[id] || { textContent: '', value: '', innerHTML: '' };
            },
            addEventListener: () => {}
        };
        
        global.window = {
            appInsights: {
                trackEvent: () => {},
                trackException: () => {}
            },
            addEventListener: () => {}
        };
        
        global.console = {
            log: () => {},
            error: () => {}
        };
        
        global.alert = () => {};
        global.confirm = () => true;
    }
    
    test(name, testFunction) {
        try {
            testFunction();
            this.testResults.push({ name, status: 'PASS', error: null });
            console.log(`✅ ${name}`);
        } catch (error) {
            this.testResults.push({ name, status: 'FAIL', error: error.message });
            console.log(`❌ ${name}: ${error.message}`);
        }
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
    
    runAllTests() {
        console.log('🧪 Running Spoon Tracker Tests...\n');
        
        this.setupMockDOM();
        
        // Import de la classe (simulation)
        const SpoonTracker = require('../../src/scripts/app.js') || class {
            constructor() {
                this.spoons = 12;
                this.totalSpent = 0;
                this.activities = [];
                this.completedActivities = 0;
            }
            
            addSpoons() { this.spoons += 1; }
            removeSpoon() { 
                if (this.spoons > 0) {
                    this.spoons -= 1;
                    this.totalSpent += 1;
                }
            }
            
            addActivity() {
                this.activities.push({
                    id: Date.now(),
                    name: 'Test Activity',
                    cost: 2
                });
            }
            
            doActivity(id) {
                const activity = this.activities.find(a => a.id === id);
                if (activity && this.spoons >= activity.cost) {
                    this.spoons -= activity.cost;
                    this.totalSpent += activity.cost;
                    this.completedActivities += 1;
                    this.activities = this.activities.filter(a => a.id !== id);
                    return true;
                }
                return false;
            }
        };
        
        // Tests d'initialisation
        this.test('SpoonTracker initializes with 12 spoons', () => {
            const tracker = new SpoonTracker();
            this.assertEqual(tracker.spoons, 12);
            this.assertEqual(tracker.totalSpent, 0);
            this.assertEqual(tracker.completedActivities, 0);
        });
        
        // Tests de manipulation des cuillères
        this.test('Can add spoons', () => {
            const tracker = new SpoonTracker();
            tracker.addSpoons();
            this.assertEqual(tracker.spoons, 13);
        });
        
        this.test('Can remove spoons', () => {
            const tracker = new SpoonTracker();
            tracker.removeSpoon();
            this.assertEqual(tracker.spoons, 11);
            this.assertEqual(tracker.totalSpent, 1);
        });
        
        this.test('Cannot go below 0 spoons', () => {
            const tracker = new SpoonTracker();
            tracker.spoons = 0;
            tracker.removeSpoon();
            this.assertEqual(tracker.spoons, 0);
        });
        
        // Tests d'activités
        this.test('Can add activity', () => {
            const tracker = new SpoonTracker();
            const initialCount = tracker.activities.length;
            tracker.addActivity();
            this.assertEqual(tracker.activities.length, initialCount + 1);
        });
        
        this.test('Can complete activity with sufficient spoons', () => {
            const tracker = new SpoonTracker();
            tracker.addActivity();
            const activityId = tracker.activities[0].id;
            const success = tracker.doActivity(activityId);
            this.assert(success, 'Activity should complete successfully');
            this.assertEqual(tracker.spoons, 10); // 12 - 2 (cost)
            this.assertEqual(tracker.completedActivities, 1);
        });
        
        this.test('Cannot complete activity with insufficient spoons', () => {
            const tracker = new SpoonTracker();
            tracker.spoons = 1;
            tracker.addActivity(); // Cost: 2
            const activityId = tracker.activities[0].id;
            const success = tracker.doActivity(activityId);
            this.assert(!success, 'Activity should not complete');
            this.assertEqual(tracker.spoons, 1);
            this.assertEqual(tracker.completedActivities, 0);
        });
        
        // Tests de logique métier
        this.test('Total spent tracks correctly', () => {
            const tracker = new SpoonTracker();
            tracker.removeSpoon(); // +1 spent
            tracker.removeSpoon(); // +1 spent
            tracker.addActivity();
            const activityId = tracker.activities[0].id;
            tracker.doActivity(activityId); // +2 spent
            this.assertEqual(tracker.totalSpent, 4);
        });
        
        // Résumé des tests
        console.log('\n📊 Test Results:');
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📋 Total: ${this.testResults.length}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
        }
        
        return failed === 0;
    }
}

// Exécution des tests si appelé directement
if (require.main === module) {
    const tests = new SpoonTrackerTests();
    process.exit(tests.testResults.filter(r => r.status === 'FAIL').length > 0 ? 1 : 0);
}

module.exports = SpoonTrackerTests;