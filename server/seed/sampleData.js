/**
 * Sample Seeding Data for YUMZY (HACK-P197)
 * Realistic Telangana/Hyderabad localities: Banjara Hills, Jubilee Hills, Madhapur, Hitec City, Begumpet, Secunderabad, Gachibowli, Kukatpally.
 */

const DEMO_PASSWORD = 'YumzyDemo@123';

const users = [
  // 1. Admin
  {
    name: 'Yumzy Platform Administrator',
    email: 'admin@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'admin',
    phone: '+91 98765 43210',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en'
  },
  // 2. Main Demo Donor
  {
    name: 'Green Leaf Restaurant',
    email: 'donor@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'donor',
    phone: '+91 91234 56789',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en',
    org: {
      organizationName: 'Green Leaf Fine Dining & Kitchen',
      organizationType: 'restaurant',
      description: 'Award-winning multicuisine restaurant specializing in South & North Indian healthy culinary meals.',
      registrationNumber: 'FSSAI-23624029000142',
      verificationStatus: 'verified',
      address: 'Plot 42, Road No. 12, Banjara Hills',
      locality: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      coordinates: { lat: 17.4156, lng: 78.4357 },
      foodPreferences: ['Vegetarian', 'Cooked meals', 'Fruits'],
      capacity: 150,
      operatingHours: '11:00 AM - 11:30 PM',
      contactInformation: {
        contactPerson: 'K. Rajeshwar Rao',
        phone: '+91 91234 56789',
        email: 'donor@yumzy.demo'
      }
    }
  },
  // 3. Second Donor
  {
    name: 'Spice Garden Kitchen',
    email: 'spicegarden@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'donor',
    phone: '+91 94401 23456',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en',
    org: {
      organizationName: 'Spice Garden Heritage Kitchen',
      organizationType: 'hotel',
      description: 'Luxury hotel buffet and banquet dining committed to zero edible food waste.',
      registrationNumber: 'FSSAI-13622014000319',
      verificationStatus: 'verified',
      address: 'Survey 64, Hitec City Main Road, Madhapur',
      locality: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      coordinates: { lat: 17.4483, lng: 78.3915 },
      foodPreferences: ['Vegetarian', 'Non-vegetarian', 'Cooked meals'],
      capacity: 300,
      operatingHours: '07:00 AM - 11:00 PM',
      contactInformation: {
        contactPerson: 'Arun Varma',
        phone: '+91 94401 23456',
        email: 'spicegarden@yumzy.demo'
      }
    }
  },
  // 4. Third Donor
  {
    name: 'FreshBake Bakery',
    email: 'freshbake@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'donor',
    phone: '+91 98850 78901',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'te',
    org: {
      organizationName: 'FreshBake Artisanal Bakery & Confectionery',
      organizationType: 'bakery',
      description: 'Artisanal daily fresh sourdough, sandwich breads, buns, and evening pastries.',
      registrationNumber: 'FSSAI-23623038000981',
      verificationStatus: 'verified',
      address: 'Street 4, Jubilee Hills Checkpost',
      locality: 'Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      coordinates: { lat: 17.4319, lng: 78.4073 },
      foodPreferences: ['Bakery', 'Vegetarian'],
      capacity: 80,
      operatingHours: '08:00 AM - 10:00 PM',
      contactInformation: {
        contactPerson: 'P. Sneha Reddy',
        phone: '+91 98850 78901',
        email: 'freshbake@yumzy.demo'
      }
    }
  },
  // 5. Fourth Donor
  {
    name: 'Urban Meals Caterers',
    email: 'urbanmeals@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'donor',
    phone: '+91 99080 34567',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en',
    org: {
      organizationName: 'Urban Meals Event & Corporate Caterers',
      organizationType: 'caterer',
      description: 'Corporate dining and grand wedding catering with hygienic surplus packing facilities.',
      registrationNumber: 'FSSAI-13621008000452',
      verificationStatus: 'verified',
      address: 'Near Cyber Towers, Gachibowli Ring Road',
      locality: 'Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500032',
      coordinates: { lat: 17.4401, lng: 78.3489 },
      foodPreferences: ['Cooked meals', 'Vegetarian', 'Non-vegetarian'],
      capacity: 400,
      operatingHours: '09:00 AM - 10:30 PM',
      contactInformation: {
        contactPerson: 'Vikram Chandra',
        phone: '+91 99080 34567',
        email: 'urbanmeals@yumzy.demo'
      }
    }
  },
  // 6. Fifth Donor
  {
    name: 'Daily Fresh Supermarket',
    email: 'dailyfresh@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'donor',
    phone: '+91 93910 65432',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'te',
    org: {
      organizationName: 'Daily Fresh Gourmet Supermarket',
      organizationType: 'supermarket',
      description: 'Farm-fresh grocery store redistributing surplus packaged goods, fruits, and dairy daily.',
      registrationNumber: 'FSSAI-23624001000673',
      verificationStatus: 'verified',
      address: 'KPHB Colony Phase 3, Kukatpally',
      locality: 'Kukatpally',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500072',
      coordinates: { lat: 17.4938, lng: 78.3995 },
      foodPreferences: ['Fruits', 'Vegetables', 'Dairy', 'Packaged food'],
      capacity: 250,
      operatingHours: '07:30 AM - 10:30 PM',
      contactInformation: {
        contactPerson: 'M. Ramesh Gupta',
        phone: '+91 93910 65432',
        email: 'dailyfresh@yumzy.demo'
      }
    }
  },
  // 7. Main Demo NGO
  {
    name: 'Helping Hands Foundation',
    email: 'ngo@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'ngo',
    phone: '+91 98480 11223',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en',
    org: {
      organizationName: 'Helping Hands Foundation & Shelter Home',
      organizationType: 'ngo',
      description: 'Registered charitable trust operating 3 shelter homes and distributing wholesome meals to underprivileged children and families.',
      registrationNumber: 'REG-TS-HYD-4482/2018',
      verificationStatus: 'verified',
      address: 'Door 12-2-417, Mehdipatnam',
      locality: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500028',
      coordinates: { lat: 17.3916, lng: 78.4398 },
      foodPreferences: ['Vegetarian', 'Cooked meals', 'Bakery', 'Fruits'],
      capacity: 200,
      operatingHours: '08:00 AM - 09:00 PM',
      contactInformation: {
        contactPerson: 'Sister Mary Teresa / K. Srinivas',
        phone: '+91 98480 11223',
        email: 'ngo@yumzy.demo'
      }
    }
  },
  // 8. Second NGO
  {
    name: 'Annapurna Community Trust',
    email: 'annapurna@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'ngo',
    phone: '+91 97012 33445',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'te',
    org: {
      organizationName: 'Annapurna Community Kitchen Trust',
      organizationType: 'community_kitchen',
      description: 'Community network feeding daytime migrant workers, elderly centers, and children across Hyderabad.',
      registrationNumber: 'REG-TS-SEC-1092/2019',
      verificationStatus: 'verified',
      address: 'Opposite Gandhi Hospital, Musheerabad',
      locality: 'Secunderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500003',
      coordinates: { lat: 17.4399, lng: 78.4983 },
      foodPreferences: ['Cooked meals', 'Vegetarian', 'Vegetables', 'Fruits'],
      capacity: 350,
      operatingHours: '06:30 AM - 09:30 PM',
      contactInformation: {
        contactPerson: 'P. Anand Kumar',
        phone: '+91 97012 33445',
        email: 'annapurna@yumzy.demo'
      }
    }
  },
  // 9. Third NGO
  {
    name: 'Hope Food Care NGO',
    email: 'hopefood@yumzy.demo',
    password: DEMO_PASSWORD,
    role: 'ngo',
    phone: '+91 99890 55667',
    isActive: true,
    isVerified: true,
    preferredLanguage: 'en',
    org: {
      organizationName: 'Hope Food Care & Nutrition Foundation',
      organizationType: 'food_bank',
      description: 'Emergency food rescue relief organization serving municipal shelters and slum welfare centers.',
      registrationNumber: 'REG-TS-CYB-3319/2021',
      verificationStatus: 'verified',
      address: 'Near Shilparamam, Hitec City',
      locality: 'Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      coordinates: { lat: 17.4504, lng: 78.3808 },
      foodPreferences: ['Vegetarian', 'Non-vegetarian', 'Packaged food', 'Bakery'],
      capacity: 180,
      operatingHours: '08:00 AM - 10:00 PM',
      contactInformation: {
        contactPerson: 'Dr. Fatima Begum',
        phone: '+91 99890 55667',
        email: 'hopefood@yumzy.demo'
      }
    }
  }
];

// Food listings generator with dynamic dates relative to now
const generateFoodListings = (donorMap) => {
  const now = new Date();

  // Helper for hours in future
  const futureHours = (h) => new Date(now.getTime() + h * 3600 * 1000);
  const pastHours = (h) => new Date(now.getTime() - h * 3600 * 1000);

  return [
    {
      donorKey: 'donor@yumzy.demo',
      foodName: 'Vegetarian Deluxe Thali Meal Boxes',
      description: 'Nutritious lunch meal boxes prepared with paneer butter masala, dal tadka, jeera rice, 2 rotis, and gulab jamun. Freshly packed in food-grade compartmental containers.',
      category: 'Vegetarian',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      quantity: 30,
      availableQuantity: 30,
      unit: 'Meals',
      preparationDateTime: pastHours(2),
      pickupStartTime: pastHours(0.5),
      pickupDeadline: futureHours(5),
      useByDateTime: futureHours(7),
      storageInstructions: 'Store in insulated heat-retention bags or consume within 4 hours at room temperature.',
      allergenInformation: 'Contains Dairy (Paneer, Ghee, Milk Solids) and Wheat (Gluten).',
      packagingInformation: '30 individual tamper-evident 5-compartment recyclable trays.',
      pickupLocation: {
        address: 'Green Leaf Restaurant, Road No. 12',
        locality: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500034',
        landmark: 'Near Cancer Hospital circle'
      },
      coordinates: { lat: 17.4156, lng: 78.4357 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'donor@yumzy.demo',
      foodName: 'Fragrant Vegetable Dum Biryani Boxes',
      description: 'Slow-cooked aromatic basmati rice cooked with fresh seasonal vegetables and whole spices, served with fresh cooling mint raita.',
      category: 'Cooked meals',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      quantity: 25,
      availableQuantity: 25,
      unit: 'Boxes',
      preparationDateTime: pastHours(1.5),
      pickupStartTime: pastHours(0.2),
      pickupDeadline: futureHours(6),
      useByDateTime: futureHours(8),
      storageInstructions: 'Keep warm in thermal container until distribution.',
      allergenInformation: 'Raita contains dairy yogurt. Biryani is nut-free.',
      packagingInformation: 'Sealed heat-resistant polypropylene lunch containers.',
      pickupLocation: {
        address: 'Green Leaf Restaurant, Road No. 12',
        locality: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500034',
        landmark: 'Opposite City Center Mall entrance'
      },
      coordinates: { lat: 17.4156, lng: 78.4357 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'spicegarden@yumzy.demo',
      foodName: 'South Indian Rice & Sambar Meal Packs',
      description: 'Steamed Sona Masoori rice packed with home-style lentil vegetable sambar, potato fry, and crispy papad. Hearty and wholesome.',
      category: 'Vegetarian',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      quantity: 40,
      availableQuantity: 40,
      unit: 'Packets',
      preparationDateTime: pastHours(2.5),
      pickupStartTime: pastHours(1),
      pickupDeadline: futureHours(4),
      useByDateTime: futureHours(6),
      storageInstructions: 'Keep warm above 60°C or consume promptly.',
      allergenInformation: 'Mustard seeds used in tempering. 100% vegetarian.',
      packagingInformation: 'Double foil-wrapped thermal meal packets.',
      pickupLocation: {
        address: 'Spice Garden Heritage Kitchen, Survey 64',
        locality: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        landmark: 'Next to Cyber Gateway'
      },
      coordinates: { lat: 17.4483, lng: 78.3915 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'spicegarden@yumzy.demo',
      foodName: 'Mughlai Chicken Curry & Jeera Rice',
      description: 'Tender chicken pieces simmered in rich tomato-onion gravy served with tempered cumin basmati rice from our afternoon corporate buffet.',
      category: 'Non-vegetarian',
      dietaryType: 'non-veg',
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80',
      quantity: 20,
      availableQuantity: 20,
      unit: 'Meals',
      preparationDateTime: pastHours(3),
      pickupStartTime: pastHours(0.5),
      pickupDeadline: futureHours(3.5),
      useByDateTime: futureHours(5),
      storageInstructions: 'Maintain refrigeration below 5°C if not served immediately.',
      allergenInformation: 'Non-vegetarian (Chicken), contains cashew paste and dairy cream.',
      packagingInformation: 'Airtight leak-proof food containers with safety seal.',
      pickupLocation: {
        address: 'Spice Garden Heritage Kitchen, Survey 64',
        locality: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        landmark: 'Opposite Inorbit Mall back gate'
      },
      coordinates: { lat: 17.4483, lng: 78.3915 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'freshbake@yumzy.demo',
      foodName: 'Artisanal Whole Wheat Bread & Pav Buns',
      description: 'Freshly baked unsliced whole grain loaves, multigrain sandwich bread, and soft burger pav buns baked earlier this morning.',
      category: 'Bakery',
      dietaryType: 'vegan',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      quantity: 25,
      availableQuantity: 25,
      unit: 'Packets',
      preparationDateTime: pastHours(5),
      pickupStartTime: pastHours(2),
      pickupDeadline: futureHours(12),
      useByDateTime: futureHours(48),
      storageInstructions: 'Store in cool, dry ambient environment away from direct sunlight.',
      allergenInformation: 'Contains Wheat Gluten. May contain sesame seeds.',
      packagingInformation: 'Paper bakery bags with transparent viewing window.',
      pickupLocation: {
        address: 'FreshBake Bakery, Jubilee Hills Checkpost',
        locality: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        landmark: 'Near Metro Station Pillar 12'
      },
      coordinates: { lat: 17.4319, lng: 78.4073 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'freshbake@yumzy.demo',
      foodName: 'Assorted Evening Snack Pastries & Rusks',
      description: 'Nutritious eggless vegetable puffs, cinnamon rolls, sweet milk buns, and tea rusks. Ideal for evening children community snacks.',
      category: 'Bakery',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      quantity: 18,
      availableQuantity: 18,
      unit: 'Boxes',
      preparationDateTime: pastHours(4),
      pickupStartTime: pastHours(1),
      pickupDeadline: futureHours(10),
      useByDateTime: futureHours(36),
      storageInstructions: 'Dry ambient storage.',
      allergenInformation: 'Contains Gluten, Dairy. 100% Eggless.',
      packagingInformation: 'Food-grade cardboard bakery pastry cartons.',
      pickupLocation: {
        address: 'FreshBake Bakery, Jubilee Hills Checkpost',
        locality: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500033',
        landmark: 'Road No. 36 crossing'
      },
      coordinates: { lat: 17.4319, lng: 78.4073 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'urbanmeals@yumzy.demo',
      foodName: 'Hyderabadi Shahi Veg Pulao & Mix Dal',
      description: 'Slow-simmered basmati rice flavored with saffron, cardamom, bay leaves, and roasted vegetables, paired with yellow dal tadka.',
      category: 'Vegetarian',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
      quantity: 50,
      availableQuantity: 50,
      unit: 'Meals',
      preparationDateTime: pastHours(2),
      pickupStartTime: pastHours(0.5),
      pickupDeadline: futureHours(5),
      useByDateTime: futureHours(8),
      storageInstructions: 'Keep in closed thermal carriers.',
      allergenInformation: 'Pure vegetarian. Free of nuts.',
      packagingInformation: 'Individual hygienic sealed bento meal boxes.',
      pickupLocation: {
        address: 'Urban Meals Caterers, Gachibowli Ring Road',
        locality: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        landmark: 'Opposite Wipro Circle Gate 2'
      },
      coordinates: { lat: 17.4401, lng: 78.3489 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'dailyfresh@yumzy.demo',
      foodName: 'Fresh Seasonal Farm Apples & Oranges',
      description: 'Clean, Grade-A fresh seasonal fruit packs. High in vitamin C, sweet and crisp. Suitable for elder shelters and children clinics.',
      category: 'Fruits',
      dietaryType: 'vegan',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
      quantity: 15,
      availableQuantity: 15,
      unit: 'Kilograms',
      preparationDateTime: pastHours(6),
      pickupStartTime: pastHours(1),
      pickupDeadline: futureHours(24),
      useByDateTime: futureHours(72),
      storageInstructions: 'Refrigerated or cool dark room.',
      allergenInformation: 'None. Fresh raw produce.',
      packagingInformation: 'Perforated breathable fruit crates (5 kg each).',
      pickupLocation: {
        address: 'Daily Fresh Supermarket, KPHB Phase 3',
        locality: 'Kukatpally',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500072',
        landmark: 'Near Forum Sujana Mall junction'
      },
      coordinates: { lat: 17.4938, lng: 78.3995 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'dailyfresh@yumzy.demo',
      foodName: 'Mixed Organic Farm Vegetables Crate',
      description: 'Assorted carrots, potatoes, tomatoes, beans, and fresh spinach harvested from regional farmer cooperatives.',
      category: 'Vegetables',
      dietaryType: 'vegan',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      quantity: 20,
      availableQuantity: 20,
      unit: 'Kilograms',
      preparationDateTime: pastHours(5),
      pickupStartTime: pastHours(1),
      pickupDeadline: futureHours(20),
      useByDateTime: futureHours(48),
      storageInstructions: 'Dry ventilated storage.',
      allergenInformation: 'None. Raw unpeeled farm vegetables.',
      packagingInformation: 'Stackable heavy-duty ventilated agricultural crates.',
      pickupLocation: {
        address: 'Daily Fresh Supermarket, KPHB Phase 3',
        locality: 'Kukatpally',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500072',
        landmark: 'Opposite Temple bus stop'
      },
      coordinates: { lat: 17.4938, lng: 78.3995 },
      status: 'AVAILABLE'
    },
    {
      donorKey: 'dailyfresh@yumzy.demo',
      foodName: 'Nutritious Packaged Dry Rations & Lentils',
      description: 'Factory-sealed packages of toor dal, roasted peanuts, rolled oats, and fortified whole wheat flour biscuits.',
      category: 'Packaged food',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      quantity: 16,
      availableQuantity: 16,
      unit: 'Packets',
      preparationDateTime: pastHours(24),
      pickupStartTime: pastHours(2),
      pickupDeadline: futureHours(36),
      useByDateTime: futureHours(180),
      storageInstructions: 'Store in dry pantry cupboard away from moisture.',
      allergenInformation: 'Contains Peanuts and Wheat.',
      packagingInformation: 'Original manufacturers sealed moisture-barrier bags.',
      pickupLocation: {
        address: 'Daily Fresh Supermarket, KPHB Phase 3',
        locality: 'Kukatpally',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500072',
        landmark: 'Main entrance loading bay'
      },
      coordinates: { lat: 17.4938, lng: 78.3995 },
      status: 'AVAILABLE'
    },
    // Seeded item with active request for live demo
    {
      donorKey: 'donor@yumzy.demo',
      foodName: 'Paneer Butter Masala & Roti Family Packs',
      description: 'Generous portions of soft paneer cooked in cashew-tomato gravy accompanied by tandoori rotis. Seeded with an active pending request.',
      category: 'Vegetarian',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
      quantity: 20,
      availableQuantity: 10,
      reservedQuantity: 10,
      unit: 'Meals',
      preparationDateTime: pastHours(2),
      pickupStartTime: pastHours(0.5),
      pickupDeadline: futureHours(4),
      useByDateTime: futureHours(6),
      storageInstructions: 'Keep in thermal insulated containers.',
      allergenInformation: 'Contains Dairy and Cashews.',
      packagingInformation: 'Foil sealed meal trays.',
      pickupLocation: {
        address: 'Green Leaf Restaurant, Road No. 12',
        locality: 'Banjara Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500034',
        landmark: 'Behind City Center'
      },
      coordinates: { lat: 17.4156, lng: 78.4357 },
      status: 'PARTIALLY_RESERVED'
    },
    // Seeded completed item for instant analytics demonstration
    {
      donorKey: 'spicegarden@yumzy.demo',
      foodName: 'Nutritious Vegetable Khichdi & Curd',
      description: 'Comforting Moong dal and rice khichdi with ghee tempering and probiotic curd cups. Successfully completed earlier today.',
      category: 'Cooked meals',
      dietaryType: 'veg',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      quantity: 35,
      availableQuantity: 0,
      reservedQuantity: 35,
      unit: 'Meals',
      preparationDateTime: pastHours(8),
      pickupStartTime: pastHours(6),
      pickupDeadline: pastHours(1),
      useByDateTime: pastHours(0.5),
      storageInstructions: 'Immediate consumption.',
      allergenInformation: 'Contains dairy ghee and yogurt.',
      packagingInformation: 'Delivered in insulated canisters.',
      pickupLocation: {
        address: 'Spice Garden Heritage Kitchen',
        locality: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        landmark: 'Hitec City Gate 1'
      },
      coordinates: { lat: 17.4483, lng: 78.3915 },
      status: 'COMPLETED'
    }
  ];
};

module.exports = {
  DEMO_PASSWORD,
  users,
  generateFoodListings
};
