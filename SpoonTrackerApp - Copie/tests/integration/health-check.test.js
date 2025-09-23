// Tests d'intégration et health checks
const https = require('https');
const http = require('http');

class HealthCheckTests {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || process.env.HEALTH_CHECK_URL || 'http://localhost:8080';
        this.testResults = [];
    }

    async runHealthChecks() {
        console.log(`🏥 Running health checks for: ${this.baseUrl}\n`);

        try {
            await this.testHttpResponse();
            await this.testContentPresence();
            await this.testResourcesLoading();
            await this.testJavaScriptExecution();

            this.summarizeResults();
            return this.testResults.filter(r => r.status === 'FAIL').length === 0;

        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return false;
        }
    }

    async testHttpResponse() {
        return new Promise((resolve, reject) => {
            const client = this.baseUrl.startsWith('https:') ? https : http;

            const req = client.get(this.baseUrl, (res) => {
                if (res.statusCode === 200) {
                    this.addResult('HTTP Response', 'PASS', `Status: ${res.statusCode}`);
                    console.log('✅ HTTP Response: OK (200)');
                } else {
                    this.addResult('HTTP Response', 'FAIL', `Status: ${res.statusCode}`);
                    console.log(`❌ HTTP Response: Failed (${res.statusCode})`);
                }
                resolve();
            });

            req.on('error', (error) => {
                this.addResult('HTTP Response', 'FAIL', error.message);
                console.log(`❌ HTTP Response: ${error.message}`);
                resolve(); // Continue with other tests
            });

            req.setTimeout(10000, () => {
                this.addResult('HTTP Response', 'FAIL', 'Timeout after 10s');
                console.log('❌ HTTP Response: Timeout');
                req.destroy();
                resolve();
            });
        });
    }

    async testContentPresence() {
        return new Promise((resolve) => {
            const client = this.baseUrl.startsWith('https:') ? https : http;

            const req = client.get(this.baseUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const checks = [
                        { name: 'Title', pattern: /Gestionnaire de Cuillères/i },
                        { name: 'Spoon Counter', pattern: /spoon-counter/i },
                        { name: 'Main Content', pattern: /main-content/i },
                        { name: 'Stats Section', pattern: /stats/i }
                    ];

                    checks.forEach(check => {
                        if (check.pattern.test(data)) {
                            this.addResult(`Content: ${check.name}`, 'PASS');
                            console.log(`✅ Content: ${check.name} found`);
                        } else {
                            this.addResult(`Content: ${check.name}`, 'FAIL');
                            console.log(`❌ Content: ${check.name} not found`);
                        }
                    });

                    resolve();
                });
            });

            req.on('error', () => {
                this.addResult('Content Check', 'FAIL', 'Request failed');
                resolve();
            });
        });
    }

    async testResourcesLoading() {
        return new Promise((resolve) => {
            const client = this.baseUrl.startsWith('https:') ? https : http;

            const req = client.get(this.baseUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const resources = [
                        { name: 'CSS', pattern: /styles\/main\.css/i },
                        { name: 'JavaScript', pattern: /scripts\/app\.js/i },
                        { name: 'Application Insights', pattern: /appInsights/i }
                    ];

                    resources.forEach(resource => {
                        if (resource.pattern.test(data)) {
                            this.addResult(`Resource: ${resource.name}`, 'PASS');
                            console.log(`✅ Resource: ${resource.name} referenced`);
                        } else {
                            this.addResult(`Resource: ${resource.name}`, 'WARN');
                            console.log(`⚠️ Resource: ${resource.name} not found`);
                        }
                    });

                    resolve();
                });
            });

            req.on('error', () => {
                this.addResult('Resources Check', 'FAIL', 'Request failed');
                resolve();
            });
        });
    }

    async testJavaScriptExecution() {
        // Test basique de structure HTML pour JavaScript
        return new Promise((resolve) => {
            const client = this.baseUrl.startsWith('https:') ? https : http;

            const req = client.get(this.baseUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    const jsElements = [
                        'spoonCount',
                        'spoonVisual',
                        'totalSpent',
                        'activitiesDone',
                        'energyLevel'
                    ];

                    let elementsFound = 0;
                    jsElements.forEach(elementId => {
                        if (data.includes(`id="${elementId}"`)) {
                            elementsFound++;
                        }
                    });

                    if (elementsFound >= jsElements.length * 0.8) { // 80% des éléments
                        this.addResult('JavaScript Elements', 'PASS', `${elementsFound}/${jsElements.length} elements found`);
                        console.log(`✅ JavaScript Elements: ${elementsFound}/${jsElements.length} found`);
                    } else {
                        this.addResult('JavaScript Elements', 'FAIL', `Only ${elementsFound}/${jsElements.length} elements found`);
                        console.log(`❌ JavaScript Elements: Only ${elementsFound}/${jsElements.length} found`);
                    }

                    resolve();
                });
            });

            req.on('error', () => {
                this.addResult('JavaScript Check', 'FAIL', 'Request failed');
                resolve();
            });
        });
    }

    addResult(test, status, details = '') {
        this.testResults.push({ test, status, details, timestamp: new Date() });
    }

    summarizeResults() {
        console.log('\n📊 Health Check Summary:');

        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const warnings = this.testResults.filter(r => r.status === 'WARN').length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Warnings: ${warnings}`);
        console.log(`📋 Total: ${this.testResults.length}`);

        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`   - ${r.test}: ${r.details}`));
        }

        if (warnings > 0) {
            console.log('\n⚠️ Warnings:');
            this.testResults
                .filter(r => r.status === 'WARN')
                .forEach(r => console.log(`   - ${r.test}: ${r.details}`));
        }

        // Generate JUnit XML for Azure DevOps
        this.generateJUnitXML();
    }

    generateJUnitXML() {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="HealthCheck" tests="${this.testResults.length}" failures="${this.testResults.filter(r => r.status === 'FAIL').length}" timestamp="${new Date().toISOString()}">
${this.testResults.map(result => `
  <testcase name="${result.test}" classname="HealthCheck">
    ${result.status === 'FAIL' ? `<failure message="${result.details}">${result.details}</failure>` : ''}
  </testcase>`).join('')}
</testsuite>`;

        require('fs').writeFileSync('health-check-results.xml', xml);
        console.log('\n📄 JUnit results written to health-check-results.xml');
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const url = process.argv[2] || process.env.HEALTH_CHECK_URL;
    if (!url) {
        console.error('❌ Usage: node health-check.test.js <URL>');
        console.error('   or set HEALTH_CHECK_URL environment variable');
        process.exit(1);
    }

    const healthCheck = new HealthCheckTests(url);
    healthCheck.runHealthChecks().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = HealthCheckTests;