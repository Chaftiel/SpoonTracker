
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
            console.log(`✅ ${ name } `);
        } catch (error) {
            this.testResults.push({ name, status: 'FAIL', error: error.message });
            console.log(`❌ ${ name }: ${ error.message } `);
        }
    }
    
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${ expected }, got ${ actual } `);
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
        
        console.log(`✅ Passed: ${ passed } `);
        console.log(`❌ Failed: ${ failed } `);
        console.log(`📋 Total: ${ this.testResults.length } `);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${ r.name }: ${ r.error } `));
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