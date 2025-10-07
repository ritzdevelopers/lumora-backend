// Simple API test script
// Run with: node test-api.js

const http = require('http');

const BASE_URL = 'http://localhost:4000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: jsonBody
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Test functions
async function testHealthEndpoint() {
    console.log('\n🔍 Testing Health Endpoint...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/health',
            method: 'GET'
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📄 Response:`, response.body);
    } catch (error) {
        console.log(`❌ Error:`, error.message);
    }
}

async function testValidEnquiry() {
    console.log('\n🔍 Testing Valid Enquiry...');
    try {
        const testData = {
            name: 'John Doe',
            mail: 'john.doe@example.com',
            phone: '1234567890',
            message: 'This is a test enquiry message.'
        };

        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/api/enquiry',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, testData);
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📄 Response:`, response.body);
    } catch (error) {
        console.log(`❌ Error:`, error.message);
    }
}

async function testInvalidEnquiry() {
    console.log('\n🔍 Testing Invalid Enquiry (validation errors)...');
    try {
        const testData = {
            name: '',
            mail: 'invalid-email',
            phone: '',
            message: ''
        };

        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/api/enquiry',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, testData);
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📄 Response:`, response.body);
    } catch (error) {
        console.log(`❌ Error:`, error.message);
    }
}

async function test404Route() {
    console.log('\n🔍 Testing 404 Route...');
    try {
        const response = await makeRequest({
            hostname: 'localhost',
            port: 4000,
            path: '/nonexistent',
            method: 'GET'
        });
        
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📄 Response:`, response.body);
    } catch (error) {
        console.log(`❌ Error:`, error.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests...');
    console.log('Make sure the server is running on http://localhost:4000');
    
    await testHealthEndpoint();
    await testValidEnquiry();
    await testInvalidEnquiry();
    await test404Route();
    
    console.log('\n✨ Tests completed!');
}

// Run the tests
runTests().catch(console.error);
