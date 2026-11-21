const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('./src/server');
const User = require('./src/models/User');

const runTestSuite = async () => {
  console.log('======================================================');
  console.log('🧪 TalentHub Recruiters Auth Test Suite (Supertest)');
  console.log('======================================================');

  try {
    // 1. Health check
    console.log('\n[TEST 1] GET /api/health');
    const healthRes = await request(app).get('/api/health');
    console.log(`Status: ${healthRes.statusCode}, Data:`, healthRes.body);
    if (healthRes.statusCode !== 200 || healthRes.body.status !== 'UP') {
      throw new Error('Health check failed');
    }
    console.log('✅ [PASS] Health check verified');

    // Test candidate data
    const timestamp = Date.now();
    const candidateData = {
      name: 'Muhammad Talha Ayub',
      email: `candidate.${timestamp}@talenthub.com`,
      password: 'SecurePassword123!',
      role: 'candidate',
      title: 'Full Stack MERN Developer',
    };

    // 2. Register candidate
    console.log('\n[TEST 2] POST /api/auth/register (Candidate)');
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(candidateData);
    console.log(`Status: ${regRes.statusCode}, Token: ${regRes.body.token ? 'Present' : 'Missing'}`);
    console.log('Registered User:', regRes.body.user);
    if (regRes.statusCode !== 201 || !regRes.body.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    console.log('✅ [PASS] Candidate registration succeeded with 201 and JWT');

    const token = regRes.body.token;

    // Verify password was hashed in MongoDB
    const dbUser = await User.findById(regRes.body.user._id);
    if (!dbUser || dbUser.password === candidateData.password || !dbUser.password.startsWith('$2')) {
      throw new Error('Password was not properly hashed with bcrypt!');
    }
    console.log(`✅ [PASS] Verified password in MongoDB is hashed: ${dbUser.password.substring(0, 20)}...`);

    // 3. Duplicate email registration
    console.log('\n[TEST 3] Duplicate Registration Check');
    const dupRes = await request(app)
      .post('/api/auth/register')
      .send(candidateData);
    console.log(`Status: ${dupRes.statusCode}, Message: ${dupRes.body.message}`);
    if (dupRes.statusCode !== 400) {
      throw new Error('Duplicate user was not rejected with 400');
    }
    console.log('✅ [PASS] Duplicate email rejected with 400');

    // 4. Login user
    console.log('\n[TEST 4] POST /api/auth/login');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: candidateData.email,
        password: candidateData.password,
      });
    console.log(`Status: ${loginRes.statusCode}, Token: ${loginRes.body.token ? 'Present' : 'Missing'}`);
    if (loginRes.statusCode !== 200 || !loginRes.body.token) {
      throw new Error('Login failed');
    }
    console.log('✅ [PASS] Login succeeded with 200 and valid JWT');

    // 5. Invalid credentials login
    console.log('\n[TEST 5] Invalid Password Login Check');
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: candidateData.email,
        password: 'IncorrectPassword!',
      });
    console.log(`Status: ${badLoginRes.statusCode}, Message: ${badLoginRes.body.message}`);
    if (badLoginRes.statusCode !== 401) {
      throw new Error('Invalid login was not rejected with 401');
    }
    console.log('✅ [PASS] Invalid password rejected with 401');

    // 6. Access protected GET /api/profile
    console.log('\n[TEST 6] GET /api/profile (Protected with Bearer Token)');
    const profileRes = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    console.log(`Status: ${profileRes.statusCode}, Profile:`, profileRes.body.user);
    if (
      profileRes.statusCode !== 200 ||
      profileRes.body.user.name !== candidateData.name ||
      profileRes.body.user.password
    ) {
      throw new Error('Profile retrieval failed or exposed password');
    }
    console.log(`✅ [PASS] GET /api/profile returned 200 and user name "${profileRes.body.user.name}"`);

    // 7. Access protected GET /api/auth/profile
    console.log('\n[TEST 7] GET /api/auth/profile (Protected with Bearer Token)');
    const authProfileRes = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);
    console.log(`Status: ${authProfileRes.statusCode}`);
    if (authProfileRes.statusCode !== 200) {
      throw new Error('GET /api/auth/profile failed');
    }
    console.log('✅ [PASS] GET /api/auth/profile returned 200');

    // 8. Access protected route WITHOUT token
    console.log('\n[TEST 8] GET /api/profile without Token (Should fail 401)');
    const unauthRes = await request(app).get('/api/profile');
    console.log(`Status: ${unauthRes.statusCode}, Message: ${unauthRes.body.message}`);
    if (unauthRes.statusCode !== 401) {
      throw new Error('Protected route allowed unauthenticated request');
    }
    console.log('✅ [PASS] Unauthorized access blocked with 401');

    console.log('\n======================================================');
    console.log('🎉 ALL 8 TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Test failure:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
};

runTestSuite();
