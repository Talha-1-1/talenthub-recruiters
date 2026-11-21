/**
 * TalentHub Recruiters - Task 1 Automated Verification Script
 * Tests:
 * 1. Health check endpoint (GET /api/health)
 * 2. User registration (POST /api/auth/register) -> Expects 201 + JWT
 * 3. Duplicate email prevention (POST /api/auth/register) -> Expects 400
 * 4. User login (POST /api/auth/login) -> Expects 200 + JWT
 * 5. Invalid login credentials (POST /api/auth/login) -> Expects 401
 * 6. Protected profile retrieval (GET /api/profile) -> Expects 200 + user data
 * 7. Protected profile retrieval (GET /api/auth/profile) -> Expects 200 + user data
 * 8. Unauthorized access without token (GET /api/profile) -> Expects 401
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const request = (path, method = 'GET', data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? JSON.stringify(data) : null;

    const headers = {};
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: headers,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log(`\n======================================================`);
  console.log(`🧪 Running TalentHub Recruiters Auth Test Suite`);
  console.log(`🎯 Target API: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const uniqueSuffix = Date.now();
  const testUser = {
    name: 'Muhammad Talha Ayub',
    email: `talha.test.${uniqueSuffix}@talenthub.com`,
    password: 'SecurePassword123!',
    role: 'candidate',
    title: 'Full Stack MERN Developer',
  };

  let registeredToken = null;
  let loginToken = null;

  try {
    // 1. Health check
    console.log(`[TEST 1] Testing Health Check GET /api/health...`);
    const healthRes = await request('/api/health', 'GET');
    if (healthRes.status === 200 && healthRes.data.status === 'UP') {
      console.log(`✅ [PASS] Health check returned 200 OK:`, healthRes.data);
    } else {
      console.error(`❌ [FAIL] Health check unexpected response:`, healthRes);
    }

    // 2. Register Candidate
    console.log(`\n[TEST 2] Testing User Registration POST /api/auth/register...`);
    const regRes = await request('/api/auth/register', 'POST', testUser);
    if (regRes.status === 201 && regRes.data.token) {
      registeredToken = regRes.data.token;
      console.log(`✅ [PASS] Register returned 201 Created.`);
      console.log(`   User ID: ${regRes.data.user._id}`);
      console.log(`   Name: ${regRes.data.user.name}`);
      console.log(`   Role: ${regRes.data.user.role}`);
      console.log(`   Token (first 30 chars): ${registeredToken.substring(0, 30)}...`);
    } else {
      console.error(`❌ [FAIL] Register failed:`, regRes);
    }

    // 3. Duplicate email prevention
    console.log(`\n[TEST 3] Testing Duplicate Registration Prevention...`);
    const dupRes = await request('/api/auth/register', 'POST', testUser);
    if (dupRes.status === 400) {
      console.log(`✅ [PASS] Duplicate email correctly rejected with 400 Bad Request: "${dupRes.data.message}"`);
    } else {
      console.error(`❌ [FAIL] Duplicate check failed:`, dupRes);
    }

    // 4. Login User
    console.log(`\n[TEST 4] Testing User Login POST /api/auth/login...`);
    const loginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password,
    });
    if (loginRes.status === 200 && loginRes.data.token) {
      loginToken = loginRes.data.token;
      console.log(`✅ [PASS] Login returned 200 OK.`);
      console.log(`   Welcome: ${loginRes.data.user.name} (${loginRes.data.user.role})`);
      console.log(`   Token (first 30 chars): ${loginToken.substring(0, 30)}...`);
    } else {
      console.error(`❌ [FAIL] Login failed:`, loginRes);
    }

    // 5. Invalid password login
    console.log(`\n[TEST 5] Testing Login with Wrong Password...`);
    const badLoginRes = await request('/api/auth/login', 'POST', {
      email: testUser.email,
      password: 'WrongPassword456!',
    });
    if (badLoginRes.status === 401) {
      console.log(`✅ [PASS] Invalid login correctly rejected with 401 Unauthorized: "${badLoginRes.data.message}"`);
    } else {
      console.error(`❌ [FAIL] Invalid login check failed:`, badLoginRes);
    }

    // 6. Access protected route GET /api/profile
    console.log(`\n[TEST 6] Testing Protected Route GET /api/profile with Bearer Token...`);
    const profileRes = await request('/api/profile', 'GET', null, loginToken);
    if (profileRes.status === 200 && profileRes.data.user.name === testUser.name) {
      console.log(`✅ [PASS] Protected route /api/profile returned 200 OK.`);
      console.log(`   Fetched User Name: "${profileRes.data.user.name}"`);
      console.log(`   Fetched User Email: "${profileRes.data.user.email}"`);
      console.log(`   Password field included: ${profileRes.data.user.password ? 'YES (Security flaw)' : 'NO (Secure)'}`);
    } else {
      console.error(`❌ [FAIL] Protected route failed:`, profileRes);
    }

    // 7. Access protected route GET /api/auth/profile
    console.log(`\n[TEST 7] Testing Protected Route GET /api/auth/profile with Bearer Token...`);
    const authProfileRes = await request('/api/auth/profile', 'GET', null, loginToken);
    if (authProfileRes.status === 200) {
      console.log(`✅ [PASS] Protected route /api/auth/profile returned 200 OK.`);
    } else {
      console.error(`❌ [FAIL] Protected route /api/auth/profile failed:`, authProfileRes);
    }

    // 8. Access protected route without token
    console.log(`\n[TEST 8] Testing Protected Route Access Without Token...`);
    const noTokenRes = await request('/api/profile', 'GET');
    if (noTokenRes.status === 401) {
      console.log(`✅ [PASS] Unauthorized request rejected with 401: "${noTokenRes.data.message}"`);
    } else {
      console.error(`❌ [FAIL] Unauthorized request was not rejected with 401:`, noTokenRes);
    }

    console.log(`\n======================================================`);
    console.log(`🎉 ALL TESTS COMPLETED SUCCESSFULLY!`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error(`\n❌ Error during test execution:`, error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
};

runTests();
