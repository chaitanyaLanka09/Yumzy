const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Organization = require('../models/Organization');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/DonationRequest');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const { users, generateFoodListings, DEMO_PASSWORD } = require('./sampleData');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/yumzy';
    console.log(`[Seeder] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Donation.deleteMany({}),
      DonationRequest.deleteMany({}),
      Notification.deleteMany({}),
      Report.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('[Seeder] Seeding Users and Organizations...');
    const createdUsers = {};
    const createdOrgs = {};

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    for (const u of users) {
      const user = await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        phone: u.phone,
        isActive: u.isActive,
        isVerified: u.isVerified,
        preferredLanguage: u.preferredLanguage
      });

      createdUsers[u.email] = user;

      if (u.org) {
        const org = await Organization.create({
          userId: user._id,
          ...u.org
        });
        createdOrgs[u.email] = org;
      }
    }

    console.log(`[Seeder] Seeded ${Object.keys(createdUsers).length} users.`);

    console.log('[Seeder] Seeding Food Donations...');
    const rawListings = generateFoodListings(createdUsers);
    const createdDonations = [];

    for (const item of rawListings) {
      const donorUser = createdUsers[item.donorKey];
      const donorOrg = createdOrgs[item.donorKey];

      const donation = await Donation.create({
        donorId: donorUser._id,
        organizationId: donorOrg?._id,
        foodName: item.foodName,
        description: item.description,
        category: item.category,
        dietaryType: item.dietaryType,
        image: item.image,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity,
        reservedQuantity: item.reservedQuantity || 0,
        unit: item.unit,
        preparationDateTime: item.preparationDateTime,
        pickupStartTime: item.pickupStartTime,
        pickupDeadline: item.pickupDeadline,
        useByDateTime: item.useByDateTime,
        storageInstructions: item.storageInstructions,
        allergenInformation: item.allergenInformation,
        packagingInformation: item.packagingInformation,
        pickupLocation: item.pickupLocation,
        coordinates: item.coordinates,
        status: item.status
      });

      createdDonations.push(donation);
    }

    console.log(`[Seeder] Seeded ${createdDonations.length} food donation listings.`);

    // Seed realistic Requests
    console.log('[Seeder] Seeding Requests and Workflows...');
    const mainDonor = createdUsers['donor@yumzy.demo'];
    const mainNgo = createdUsers['ngo@yumzy.demo'];
    const spiceDonor = createdUsers['spicegarden@yumzy.demo'];
    const annapurnaNgo = createdUsers['annapurna@yumzy.demo'];

    // 1. A PENDING request on "Paneer Butter Masala"
    const partiallyReservedDonation = createdDonations.find(
      (d) => d.foodName.includes('Paneer Butter Masala')
    );
    if (partiallyReservedDonation) {
      await DonationRequest.create({
        donationId: partiallyReservedDonation._id,
        donorId: partiallyReservedDonation.donorId,
        ngoId: mainNgo._id,
        requestedQuantity: 10,
        unit: 'Meals',
        pickupTime: new Date(Date.now() + 2 * 3600 * 1000),
        message: 'Requesting 10 meals for our evening youth shelter distribution.',
        status: 'PENDING',
        history: [
          {
            status: 'PENDING',
            changedBy: mainNgo._id,
            note: 'Initial request submitted by Helping Hands Foundation',
            timestamp: new Date(Date.now() - 30 * 60 * 1000)
          }
        ]
      });

      // Notify donor
      await Notification.create({
        recipientId: mainDonor._id,
        title: 'New Food Donation Request',
        message: 'Helping Hands Foundation requested 10 Meals of "Paneer Butter Masala & Roti Family Packs"',
        type: 'request_created',
        relatedDonationId: partiallyReservedDonation._id
      });
    }

    // 2. An ACCEPTED & READY_FOR_PICKUP request for immediate pickup demo
    const biryaniDonation = createdDonations.find((d) => d.foodName.includes('Dum Biryani'));
    if (biryaniDonation) {
      const pickupReq = await DonationRequest.create({
        donationId: biryaniDonation._id,
        donorId: biryaniDonation.donorId,
        ngoId: mainNgo._id,
        requestedQuantity: 10,
        unit: 'Boxes',
        pickupTime: new Date(Date.now() + 1 * 3600 * 1000),
        message: 'Will collect by 4:00 PM via our volunteer van.',
        status: 'READY_FOR_PICKUP',
        pickupCode: 'YZ-PK-9A4F2',
        donorPickupConfirmed: false,
        ngoPickupConfirmed: false,
        history: [
          {
            status: 'PENDING',
            changedBy: mainNgo._id,
            note: 'Request submitted for 10 Boxes',
            timestamp: new Date(Date.now() - 2 * 3600 * 1000)
          },
          {
            status: 'ACCEPTED',
            changedBy: mainDonor._id,
            note: 'Request accepted by Green Leaf Restaurant. Code generated: YZ-PK-9A4F2',
            timestamp: new Date(Date.now() - 1.5 * 3600 * 1000)
          },
          {
            status: 'READY_FOR_PICKUP',
            changedBy: mainDonor._id,
            note: 'Food packed and ready at dispatch counter.',
            timestamp: new Date(Date.now() - 40 * 60 * 1000)
          }
        ]
      });

      // Update biryani inventory
      biryaniDonation.availableQuantity -= 10;
      biryaniDonation.reservedQuantity += 10;
      biryaniDonation.status = 'PARTIALLY_RESERVED';
      await biryaniDonation.save();

      // Notify NGO
      await Notification.create({
        recipientId: mainNgo._id,
        title: 'Food Donation Ready for Pickup!',
        message: 'Vegetable Dum Biryani is packed and ready. Code: YZ-PK-9A4F2',
        type: 'ready_for_pickup',
        relatedDonationId: biryaniDonation._id,
        relatedRequestId: pickupReq._id
      });
    }

    // 3. A COMPLETED request for instant analytics & impact charts
    const completedKhichdi = createdDonations.find((d) => d.foodName.includes('Khichdi'));
    if (completedKhichdi) {
      await DonationRequest.create({
        donationId: completedKhichdi._id,
        donorId: spiceDonor._id,
        ngoId: annapurnaNgo._id,
        requestedQuantity: 35,
        unit: 'Meals',
        pickupTime: new Date(Date.now() - 4 * 3600 * 1000),
        message: 'Collected for Musheerabad migrant worker lunch distribution.',
        status: 'COMPLETED',
        pickupCode: 'YZ-PK-3C8E1',
        donorPickupConfirmed: true,
        ngoPickupConfirmed: true,
        history: [
          {
            status: 'PENDING',
            changedBy: annapurnaNgo._id,
            note: 'Request submitted',
            timestamp: new Date(Date.now() - 7 * 3600 * 1000)
          },
          {
            status: 'ACCEPTED',
            changedBy: spiceDonor._id,
            note: 'Accepted. Code: YZ-PK-3C8E1',
            timestamp: new Date(Date.now() - 6.5 * 3600 * 1000)
          },
          {
            status: 'READY_FOR_PICKUP',
            changedBy: spiceDonor._id,
            note: 'Ready at kitchen loading dock',
            timestamp: new Date(Date.now() - 5 * 3600 * 1000)
          },
          {
            status: 'COMPLETED',
            changedBy: annapurnaNgo._id,
            note: 'Both parties confirmed handover. 35 meals distributed.',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000)
          }
        ]
      });
    }

    // Seed Sample Safety Report
    console.log('[Seeder] Seeding Sample Report for Admin Moderation...');
    const adminUser = createdUsers['admin@yumzy.demo'];
    const reportItem = createdDonations[3]; // non-veg item
    await Report.create({
      reportedBy: annapurnaNgo._id,
      targetType: 'donation',
      targetId: reportItem._id,
      reason: 'inaccurate_info',
      description: 'Requesting confirmation on whether refrigeration temperature log is available before collection.',
      status: 'pending'
    });

    // Seed Initial Activity Logs
    console.log('[Seeder] Seeding Audit Activity Logs...');
    await ActivityLog.create([
      {
        actorId: mainDonor._id,
        action: 'CREATE_DONATION',
        entityType: 'Donation',
        entityId: createdDonations[0]._id,
        details: { foodName: 'Vegetarian Deluxe Thali Meal Boxes', quantity: 30 },
        timestamp: new Date(Date.now() - 2 * 3600 * 1000)
      },
      {
        actorId: mainNgo._id,
        action: 'SUBMIT_REQUEST',
        entityType: 'DonationRequest',
        details: { requestedQuantity: 10, unit: 'Meals' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        actorId: adminUser._id,
        action: 'PLATFORM_INITIALIZATION',
        entityType: 'System',
        details: { version: '1.0.0', mode: 'HACK-P197' },
        timestamp: new Date(Date.now() - 24 * 3600 * 1000)
      }
    ]);

    console.log('====================================================');
    console.log('  YUMZY DATABASE SEEDED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('  Demo Credentials:');
    console.log(`  - Admin:  admin@yumzy.demo  /  ${DEMO_PASSWORD}`);
    console.log(`  - Donor:  donor@yumzy.demo  /  ${DEMO_PASSWORD} (Green Leaf Restaurant)`);
    console.log(`  - NGO:    ngo@yumzy.demo    /  ${DEMO_PASSWORD} (Helping Hands Foundation)`);
    console.log('====================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]', err);
    process.exit(1);
  }
};

seedDatabase();
