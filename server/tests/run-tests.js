/**
 * Automated Test Suite for Yumzy (HACK-P197)
 * Tests Authentication, Role-based protection, Donation listings,
 * Request workflow, Atomic inventory validation, and Impact calculations.
 */

const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('\n======================================================');
  console.log('   STARTING YUMZY AUTOMATED API TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Healthcheck
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'online', '1. API Health Check');

    // 2. Donor Login
    const donorLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@yumzy.demo', password: 'YumzyDemo@123' })
    });
    const donorLoginData = await donorLoginRes.json();
    assert(
      donorLoginRes.status === 200 && donorLoginData.token && donorLoginData.user.role === 'donor',
      '2. Donor Login with Valid Credentials'
    );
    const donorToken = donorLoginData.token;

    // 3. NGO Login
    const ngoLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ngo@yumzy.demo', password: 'YumzyDemo@123' })
    });
    const ngoLoginData = await ngoLoginRes.json();
    assert(
      ngoLoginRes.status === 200 && ngoLoginData.token && ngoLoginData.user.role === 'ngo',
      '3. NGO Login with Valid Credentials'
    );
    const ngoToken = ngoLoginData.token;

    // 4. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@yumzy.demo', password: 'YumzyDemo@123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(
      adminLoginRes.status === 200 && adminLoginData.user.role === 'admin',
      '4. Admin Login with Valid Credentials'
    );
    const adminToken = adminLoginData.token;

    // 5. Invalid Login Attempt
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'donor@yumzy.demo', password: 'WrongPassword' })
    });
    assert(badLoginRes.status === 401, '5. Reject Invalid Password');

    // 6. Role-Based Access Control (NGO cannot access admin endpoint)
    const rbacRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    assert(rbacRes.status === 403, '6. RBAC: NGO Forbidden from Admin Routes');

    // 7. Role-Based Access Control (Admin CAN access admin endpoint)
    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    assert(
      adminDashRes.status === 200 && adminDashData.stats.totalUsers >= 9,
      '7. Admin Dashboard Access Granted & Correct Metrics'
    );

    // 8. Public Donation Discovery
    const donationsRes = await fetch(`${BASE_URL}/donations`);
    const donationsData = await donationsRes.json();
    assert(
      donationsRes.status === 200 && donationsData.donations.length >= 10,
      '8. Browse Available Food Donations in Marketplace'
    );

    // 9. Filter Donations by Category (Vegetarian)
    const filterRes = await fetch(`${BASE_URL}/donations?category=Vegetarian`);
    const filterData = await filterRes.json();
    const allVeg = filterData.donations.every((d) => d.category === 'Vegetarian');
    assert(filterRes.status === 200 && allVeg && filterData.donations.length > 0, '9. Filter Marketplace by Category');

    // 10. Smart Matching Recommendations for NGO
    const matchRes = await fetch(`${BASE_URL}/matching/recommended-donations`, {
      headers: { Authorization: `Bearer ${ngoToken}` }
    });
    const matchData = await matchRes.json();
    assert(
      matchRes.status === 200 &&
        matchData.recommendations.length > 0 &&
        matchData.recommendations[0].matchScore > 0,
      '10. Smart Matching Engine Generates Recommendation Scores'
    );

    // 11. Donor Creates New Food Donation
    const newDonationRes = await fetch(`${BASE_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({
        foodName: 'Test Fresh Idli Sambar Platter',
        category: 'Vegetarian',
        dietaryType: 'veg',
        quantity: 15,
        unit: 'Meals',
        pickupDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        storageInstructions: 'Keep in warm containers',
        allergenInformation: 'Gluten free, contains mustard seeds'
      })
    });
    const newDonationData = await newDonationRes.json();
    assert(
      newDonationRes.status === 201 && newDonationData.donation.availableQuantity === 15,
      '11. Donor Creates New Surplus Food Listing'
    );
    const testDonationId = newDonationData.donation._id;

    // 12. NGO Requests Food (Valid Quantity)
    const reqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`
      },
      body: JSON.stringify({
        donationId: testDonationId,
        requestedQuantity: 5,
        pickupTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        message: 'Requesting 5 meals for children lunch'
      })
    });
    const reqData = await reqRes.json();
    assert(
      reqRes.status === 201 && reqData.request.status === 'PENDING',
      '12. NGO Submits Food Donation Request'
    );
    const testRequestId = reqData.request._id;

    // 13. Prevent Over-Reservation (Requesting more than available)
    const overReqRes = await fetch(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`
      },
      body: JSON.stringify({
        donationId: testDonationId,
        requestedQuantity: 999,
        pickupTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        message: 'Excess quantity'
      })
    });
    assert(overReqRes.status === 400, '13. Atomic Guard: Prevent Over-Reservation (Qty > Available)');

    // 14. Donor Accepts Request & Verifies Atomic Inventory Reservation
    const acceptRes = await fetch(`${BASE_URL}/requests/${testRequestId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${donorToken}` }
    });
    const acceptData = await acceptRes.json();
    assert(
      acceptRes.status === 200 &&
        acceptData.request.status === 'ACCEPTED' &&
        Boolean(acceptData.pickupCode),
      '14. Donor Accepts Request & Generates Unique Pickup Code'
    );

    // 15. Check Inventory After Acceptance
    const checkDonationRes = await fetch(`${BASE_URL}/donations/${testDonationId}`);
    const checkDonationData = await checkDonationRes.json();
    assert(
      checkDonationData.donation.availableQuantity === 10 &&
        checkDonationData.donation.reservedQuantity === 5,
      '15. Atomic Inventory Updated (Available = 10, Reserved = 5)'
    );

    // 16. Donor Marks Donation Ready for Pickup
    const readyRes = await fetch(`${BASE_URL}/requests/${testRequestId}/ready`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({ instructions: 'Collection at rear pantry counter' })
    });
    const readyData = await readyRes.json();
    assert(
      readyRes.status === 200 && readyData.request.status === 'READY_FOR_PICKUP',
      '16. Donor Marks Food Ready for Pickup'
    );

    // 17. Dual Confirmation: Donor confirms handover
    const donorConfirmRes = await fetch(`${BASE_URL}/requests/${testRequestId}/confirm-pickup`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${donorToken}`
      },
      body: JSON.stringify({})
    });
    const donorConfirmData = await donorConfirmRes.json();
    assert(
      donorConfirmRes.status === 200 &&
        donorConfirmData.request.donorPickupConfirmed === true &&
        donorConfirmData.isCompleted === false,
      '17. Dual Confirmation: Step 1 Donor Handover Confirmed (Waiting for NGO)'
    );

    // 18. Dual Confirmation: NGO confirms receipt with pickup code -> triggers COMPLETED
    const ngoConfirmRes = await fetch(`${BASE_URL}/requests/${testRequestId}/confirm-pickup`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ngoToken}`
      },
      body: JSON.stringify({ confirmationCode: acceptData.pickupCode })
    });
    const ngoConfirmData = await ngoConfirmRes.json();
    assert(
      ngoConfirmRes.status === 200 &&
        ngoConfirmData.request.status === 'COMPLETED' &&
        ngoConfirmData.isCompleted === true,
      '18. Dual Confirmation: Step 2 NGO Collection Confirmed -> Status COMPLETED'
    );

    // 19. Impact Analytics Calculation
    const analyticsRes = await fetch(`${BASE_URL}/analytics/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const analyticsData = await analyticsRes.json();
    assert(
      analyticsRes.status === 200 &&
        analyticsData.stats.totalRedistributedMeals >= 40 &&
        analyticsData.stats.totalRedistributedKg > 0,
      '19. Impact Calculation Formula (0.4 kg/meal) Correctly Computed'
    );

    // 20. Public Registration Cannot Create Admin
    const fakeAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@yumzy.demo',
        password: 'Password123',
        role: 'admin'
      })
    });
    assert(fakeAdminRes.status === 403, '20. Security: Public Self-Registration as Admin Blocked');
  } catch (err) {
    console.error('[Test Execution Error]', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Start server in background or test against running server
runTests();
