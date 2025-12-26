/**
 * Seed Script for Test Providers
 * Creates 6 verified providers, one for each master category,
 * with services covering all subcategories
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../models/user.model';
import ProviderProfile from '../models/providerProfile.model';
import Service from '../models/service.model';
import ServiceCategory from '../models/serviceCategory.model';
import Availability from '../models/availability.model';

// NILIN Category Data (matching database)
const CATEGORIES = [
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    color: '#FF6B9D',
    provider: {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.beauty@nilin.test',
      businessName: 'Priya\'s Beauty Studio',
      tagline: 'Your beauty, our passion',
      bio: 'Expert beautician with 10+ years of experience in hair, makeup, and skincare. Certified from Lakme Academy.',
    },
    subcategories: [
      { name: 'Hair', slug: 'hair', services: ['Haircut & Styling', 'Hair Coloring', 'Keratin Treatment'] },
      { name: 'Makeup', slug: 'makeup', services: ['Bridal Makeup', 'Party Makeup', 'HD Makeup'] },
      { name: 'Nails', slug: 'nails', services: ['Manicure', 'Pedicure', 'Nail Art'] },
      { name: 'Skin & Aesthetics', slug: 'skin-aesthetics', services: ['Facial Treatment', 'Cleanup', 'Anti-Aging Treatment'] },
      { name: 'Massage & Body Treatment', slug: 'massage-body', services: ['Swedish Massage', 'Deep Tissue Massage', 'Body Wrap'] },
      { name: 'Personal Care', slug: 'personal-care', services: ['Full Body Waxing', 'Threading', 'Eyebrow Shaping'] },
    ]
  },
  {
    name: 'Fitness & Personal Health',
    slug: 'fitness-personal-health',
    color: '#FF9800',
    provider: {
      firstName: 'Arjun',
      lastName: 'Reddy',
      email: 'arjun.fitness@nilin.test',
      businessName: 'FitLife by Arjun',
      tagline: 'Transform your body, transform your life',
      bio: 'Certified personal trainer and nutrition coach. Former national level athlete with 8 years of coaching experience.',
    },
    subcategories: [
      { name: 'Personal Training', slug: 'personal-training', services: ['Strength Training', 'HIIT Sessions', 'Weight Loss Program'] },
      { name: 'Group Classes', slug: 'group-classes', services: ['Bootcamp', 'CrossFit', 'Zumba'] },
      { name: 'Yoga & Meditation', slug: 'yoga-meditation', services: ['Hatha Yoga', 'Power Yoga', 'Meditation Session'] },
      { name: 'Nutrition & Dietetics', slug: 'nutrition-dietetics', services: ['Custom Meal Plan', 'Diet Consultation', 'Macro Coaching'] },
      { name: 'Rehabilitation & Physiotherapy', slug: 'rehabilitation-physiotherapy', services: ['Injury Recovery', 'Posture Correction', 'Sports Rehab'] },
      { name: 'Wellness Coaching', slug: 'wellness-coaching', services: ['Lifestyle Coaching', 'Stress Management', 'Sleep Optimization'] },
    ]
  },
  {
    name: 'Mobile Medical Care',
    slug: 'mobile-medical-care',
    color: '#4CAF50',
    provider: {
      firstName: 'Meera',
      lastName: 'Patel',
      email: 'meera.medical@nilin.test',
      businessName: 'Dr Meera\'s CareAtHome',
      tagline: 'Quality healthcare at your doorstep',
      bio: 'MBBS, MD with 12 years of clinical experience. Passionate about making healthcare accessible through home visits.',
    },
    subcategories: [
      { name: 'Home Consultations', slug: 'home-consultations', services: ['GP Home Visit', 'Pediatric Checkup', 'Elderly Care Visit'] },
      { name: 'Nurse Services', slug: 'nurse-services', services: ['Injection Administration', 'Wound Dressing', 'IV Therapy'] },
      { name: 'Diagnostic Services', slug: 'diagnostic-services', services: ['Blood Sample Collection', 'ECG at Home', 'Rapid Testing'] },
      { name: 'Vaccination & Preventive Care', slug: 'vaccination-preventive', services: ['Flu Vaccination', 'COVID Vaccination', 'Child Immunization'] },
      { name: 'Telemedicine', slug: 'telemedicine', services: ['Video Consultation', 'Follow-up Call', 'Second Opinion'] },
      { name: 'Emergency Triage', slug: 'emergency-triage', services: ['Emergency Assessment', 'First Aid', 'Hospital Coordination'] },
    ]
  },
  {
    name: 'Education & Personal Development',
    slug: 'education-personal-development',
    color: '#9C27B0',
    provider: {
      firstName: 'Sneha',
      lastName: 'Iyer',
      email: 'sneha.education@nilin.test',
      businessName: 'BrightMinds Tutoring',
      tagline: 'Unlock your potential',
      bio: 'Education specialist with Masters in Education. 15 years of experience in tutoring and career guidance.',
    },
    subcategories: [
      { name: 'Academic Tutoring', slug: 'academic-tutoring', services: ['Math Tutoring', 'Science Tutoring', 'Exam Preparation'] },
      { name: 'Language Lessons', slug: 'language-lessons', services: ['English Conversation', 'IELTS Prep', 'Spanish Lessons'] },
      { name: 'Professional Skills', slug: 'professional-skills', services: ['Coding Basics', 'Excel Training', 'Digital Marketing'] },
      { name: 'Creative Skills', slug: 'creative-skills', services: ['Guitar Lessons', 'Art Classes', 'Photography Workshop'] },
      { name: 'Career Coaching', slug: 'career-coaching', services: ['Resume Review', 'Interview Prep', 'Career Mapping'] },
    ]
  },
  {
    name: 'Corporate Services',
    slug: 'corporate-services',
    color: '#607D8B',
    provider: {
      firstName: 'Rahul',
      lastName: 'Kapoor',
      email: 'rahul.corporate@nilin.test',
      businessName: 'ProBiz Solutions',
      tagline: 'Your trusted business partner',
      bio: 'Corporate services expert with MBA from IIM. 10 years of experience in facility management and corporate wellness.',
    },
    subcategories: [
      { name: 'Employee Wellness', slug: 'employee-wellness', services: ['Office Yoga Session', 'Health Screening Camp', 'Mental Wellness Workshop'] },
      { name: 'Facility Maintenance', slug: 'facility-maintenance', services: ['Office Deep Cleaning', 'HVAC Maintenance', 'Electrical Audit'] },
      { name: 'Medical Programs', slug: 'medical-programs', services: ['Annual Health Checkup', 'Vaccination Drive', 'First Aid Training'] },
      { name: 'Hospitality & Events', slug: 'hospitality-events', services: ['Event Staffing', 'Corporate Catering', 'Conference Setup'] },
      { name: 'Managed Services', slug: 'managed-services', services: ['Facility Management', 'Vendor Management', 'Housekeeping Contract'] },
    ]
  },
  {
    name: 'Home & Maintenance',
    slug: 'home-maintenance',
    color: '#2196F3',
    provider: {
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.home@nilin.test',
      businessName: 'HomeFix Pro',
      tagline: 'We fix everything at home',
      bio: 'Licensed contractor with 20 years of experience. Specialized in plumbing, electrical, and general home repairs.',
    },
    subcategories: [
      { name: 'Cleaning', slug: 'cleaning', services: ['Deep Cleaning', 'Regular Cleaning', 'Move-out Cleaning'] },
      { name: 'Plumbing', slug: 'plumbing', services: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning'] },
      { name: 'Electrical', slug: 'electrical', services: ['Wiring Repair', 'Light Installation', 'Socket Replacement'] },
      { name: 'HVAC & AC', slug: 'hvac-ac', services: ['AC Installation', 'AC Servicing', 'Duct Cleaning'] },
      { name: 'Carpentry & Renovation', slug: 'carpentry-renovation', services: ['Furniture Assembly', 'Door Repair', 'Kitchen Renovation'] },
      { name: 'Smart Home & Appliances', slug: 'smart-home-appliances', services: ['TV Mounting', 'Smart Lock Setup', 'WiFi Network Setup'] },
    ]
  }
];

const DEFAULT_PASSWORD = 'TestProvider@123';

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/home-service-platform';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}

async function clearTestData() {
  console.log('Clearing existing test providers...');

  // Find test users by email pattern
  const testEmails = CATEGORIES.map(c => c.provider.email);
  const testUsers = await User.find({ email: { $in: testEmails } });
  const testUserIds = testUsers.map(u => u._id);

  if (testUserIds.length > 0) {
    // Delete provider profiles
    await ProviderProfile.deleteMany({ userId: { $in: testUserIds } });

    // Delete services
    await Service.deleteMany({ providerId: { $in: testUserIds } });

    // Delete availability records
    await Availability.deleteMany({ providerId: { $in: testUserIds } });

    // Delete users
    await User.deleteMany({ _id: { $in: testUserIds } });

    console.log(`Cleared ${testUserIds.length} existing test providers`);
  }
}

async function createProvider(categoryData: typeof CATEGORIES[0]) {
  const { provider, name: categoryName, slug: categorySlug, color, subcategories } = categoryData;

  console.log(`\nCreating provider: ${provider.businessName}`);

  // 1. Create User account
  const user = await User.create({
    firstName: provider.firstName,
    lastName: provider.lastName,
    email: provider.email,
    password: DEFAULT_PASSWORD,
    phone: '+91' + Math.floor(7000000000 + Math.random() * 2999999999),
    role: 'provider',
    accountStatus: 'active',
    isEmailVerified: true,
    isPhoneVerified: true,
    isActive: true,
    address: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '400001',
      coordinates: {
        lat: 19.0760 + (Math.random() * 0.1 - 0.05),
        lng: 72.8777 + (Math.random() * 0.1 - 0.05)
      }
    }
  });

  console.log(`  Created user: ${user.email}`);

  // 2. Create ProviderProfile with embedded services
  const embeddedServices = [];
  for (const subcat of subcategories) {
    for (const serviceName of subcat.services) {
      const basePrice = 500 + Math.floor(Math.random() * 2000);
      embeddedServices.push({
        name: serviceName,
        category: categoryName,
        subcategory: subcat.name,
        description: `Professional ${serviceName.toLowerCase()} service by ${provider.businessName}. Quality guaranteed.`,
        duration: 30 + Math.floor(Math.random() * 90),
        price: {
          amount: basePrice,
          currency: 'INR',
          type: 'fixed' as const
        },
        images: [],
        isActive: true,
        isPopular: Math.random() > 0.7,
        tags: [categoryName.toLowerCase(), subcat.name.toLowerCase(), serviceName.toLowerCase()],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  const providerProfile = await ProviderProfile.create({
    userId: user._id,
    businessInfo: {
      businessName: provider.businessName,
      businessType: 'individual',
      description: provider.bio,
      tagline: provider.tagline,
      serviceRadius: 25,
      instantBooking: true,
      advanceBookingDays: 30,
      businessHours: {
        monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
        sunday: { isOpen: false }
      }
    },
    instagramStyleProfile: {
      profilePhoto: `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.firstName + '+' + provider.lastName)}&background=${color.replace('#', '')}&color=fff&size=200`,
      coverPhoto: `https://picsum.photos/seed/${categorySlug}/800/300`,
      isVerified: true, // VERIFIED!
      verificationBadges: [
        {
          type: 'identity',
          verifiedAt: new Date(),
          verifier: 'NILIN Admin'
        },
        {
          type: 'business',
          verifiedAt: new Date(),
          verifier: 'NILIN Admin'
        }
      ],
      bio: provider.bio,
      highlights: [],
      posts: [],
      followersCount: Math.floor(Math.random() * 500) + 100,
      followingCount: Math.floor(Math.random() * 100) + 20,
      totalLikes: Math.floor(Math.random() * 1000) + 200,
      engagementRate: Math.random() * 5 + 2
    },
    services: embeddedServices,
    portfolio: {
      featured: [],
      certifications: [
        {
          name: `${categoryName} Professional Certification`,
          issuingOrganization: 'NILIN Academy',
          issueDate: new Date('2023-01-01'),
          isVerified: true
        }
      ],
      awards: []
    },
    locationInfo: {
      primaryAddress: {
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        coordinates: {
          lat: 19.0760 + (Math.random() * 0.1 - 0.05),
          lng: 72.8777 + (Math.random() * 0.1 - 0.05)
        }
      },
      serviceAreas: [
        { name: 'Mumbai', type: 'city', value: 'Mumbai' }
      ],
      travelFee: {
        baseFee: 0,
        perKmFee: 10,
        maxTravelDistance: 25
      },
      mobileService: true,
      hasFixedLocation: false
    },
    reviewsData: {
      averageRating: 4.2 + Math.random() * 0.7,
      totalReviews: Math.floor(Math.random() * 50) + 10,
      ratingDistribution: {
        5: Math.floor(Math.random() * 20) + 5,
        4: Math.floor(Math.random() * 15) + 3,
        3: Math.floor(Math.random() * 5) + 1,
        2: Math.floor(Math.random() * 2),
        1: Math.floor(Math.random() * 2)
      },
      recentReviews: [],
      responseRate: 85 + Math.random() * 15,
      avgResponseTime: Math.random() * 12 + 1
    },
    analytics: {
      profileViews: [],
      bookingStats: {
        totalBookings: Math.floor(Math.random() * 100) + 20,
        completedBookings: Math.floor(Math.random() * 80) + 15,
        cancelledBookings: Math.floor(Math.random() * 5),
        noShowBookings: 0,
        averageBookingValue: 800 + Math.random() * 1000,
        repeatCustomerRate: 30 + Math.random() * 40
      },
      revenueStats: {
        totalEarnings: Math.floor(Math.random() * 100000) + 50000,
        currentMonthEarnings: Math.floor(Math.random() * 20000) + 5000,
        averageMonthlyEarnings: Math.floor(Math.random() * 15000) + 8000,
        topEarningServices: []
      },
      customerMetrics: {
        totalCustomers: Math.floor(Math.random() * 50) + 15,
        repeatCustomers: Math.floor(Math.random() * 20) + 5,
        customerRetentionRate: 40 + Math.random() * 30,
        averageCustomerLifetimeValue: 2000 + Math.random() * 3000
      },
      performanceMetrics: {
        acceptanceRate: 90 + Math.random() * 10,
        responseTime: Math.random() * 30 + 5,
        completionRate: 95 + Math.random() * 5,
        punctualityScore: 90 + Math.random() * 10,
        qualityScore: 85 + Math.random() * 15
      }
    },
    verificationStatus: {
      overall: 'approved',
      identity: {
        status: 'approved',
        submittedAt: new Date(),
        reviewedAt: new Date(),
        documents: []
      },
      business: {
        status: 'approved',
        submittedAt: new Date(),
        reviewedAt: new Date(),
        documents: []
      },
      background: {
        status: 'approved',
        submittedAt: new Date(),
        completedAt: new Date(),
        provider: 'NILIN Verification'
      }
    },
    settings: {
      autoAcceptBookings: true,
      instantBookingEnabled: true,
      requirePaymentUpfront: false,
      allowRescheduling: true,
      cancellationPolicy: {
        freeUntilHours: 24,
        partialRefundUntilHours: 12,
        noRefundAfterHours: 2
      },
      communicationPreferences: {
        bookingNotifications: true,
        reviewNotifications: true,
        marketingEmails: false,
        smsNotifications: true
      },
      privacySettings: {
        showExactLocation: false,
        showPhoneNumber: true,
        showEmail: false
      }
    },
    isProfileComplete: true,
    completionPercentage: 95,
    lastActiveAt: new Date(),
    isActive: true,
    isDeleted: false
  });

  console.log(`  Created provider profile with ${embeddedServices.length} services`);

  // 3. Also create Service model entries (for search functionality)
  const serviceDocuments = [];
  for (const subcat of subcategories) {
    for (const serviceName of subcat.services) {
      const basePrice = 500 + Math.floor(Math.random() * 2000);
      serviceDocuments.push({
        providerId: user._id,
        name: serviceName,
        category: categoryName,
        subcategory: subcat.name,
        description: `Professional ${serviceName.toLowerCase()} service by ${provider.businessName}. Quality guaranteed with experienced professionals.`,
        shortDescription: `Expert ${serviceName.toLowerCase()} service`,
        price: {
          amount: basePrice,
          currency: 'INR',
          type: 'fixed'
        },
        duration: 30 + Math.floor(Math.random() * 90),
        images: [],
        tags: [categoryName.toLowerCase(), subcat.name.toLowerCase(), serviceName.toLowerCase().split(' ')].flat(),
        location: {
          address: {
            street: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          coordinates: {
            type: 'Point',
            coordinates: [72.8777 + (Math.random() * 0.1 - 0.05), 19.0760 + (Math.random() * 0.1 - 0.05)]
          },
          serviceArea: {
            type: 'city',
            value: 'Mumbai',
            maxDistance: 25
          }
        },
        availability: {
          schedule: {
            monday: { isAvailable: true, timeSlots: ['09:00-12:00', '14:00-18:00'] },
            tuesday: { isAvailable: true, timeSlots: ['09:00-12:00', '14:00-18:00'] },
            wednesday: { isAvailable: true, timeSlots: ['09:00-12:00', '14:00-18:00'] },
            thursday: { isAvailable: true, timeSlots: ['09:00-12:00', '14:00-18:00'] },
            friday: { isAvailable: true, timeSlots: ['09:00-12:00', '14:00-18:00'] },
            saturday: { isAvailable: true, timeSlots: ['10:00-16:00'] },
            sunday: { isAvailable: false, timeSlots: [] }
          },
          exceptions: [],
          bufferTime: 15,
          instantBooking: true,
          advanceBookingDays: 30
        },
        rating: {
          average: 4.2 + Math.random() * 0.7,
          count: Math.floor(Math.random() * 20) + 5,
          distribution: {
            5: Math.floor(Math.random() * 10) + 2,
            4: Math.floor(Math.random() * 8) + 1,
            3: Math.floor(Math.random() * 3),
            2: Math.floor(Math.random() * 2),
            1: 0
          }
        },
        searchMetadata: {
          searchCount: Math.floor(Math.random() * 100),
          clickCount: Math.floor(Math.random() * 50),
          bookingCount: Math.floor(Math.random() * 20),
          popularityScore: Math.floor(Math.random() * 500) + 100,
          searchKeywords: [categoryName.toLowerCase(), subcat.name.toLowerCase(), ...serviceName.toLowerCase().split(' ')]
        },
        isActive: true,
        isFeatured: Math.random() > 0.8,
        isPopular: Math.random() > 0.7,
        status: 'active'
      });
    }
  }

  await Service.insertMany(serviceDocuments);
  console.log(`  Created ${serviceDocuments.length} Service documents`);

  // 4. Create Availability record for booking
  const defaultTimeSlots = [
    { start: '09:00', end: '10:00', isActive: true },
    { start: '10:00', end: '11:00', isActive: true },
    { start: '11:00', end: '12:00', isActive: true },
    { start: '14:00', end: '15:00', isActive: true },
    { start: '15:00', end: '16:00', isActive: true },
    { start: '16:00', end: '17:00', isActive: true },
    { start: '17:00', end: '18:00', isActive: true },
  ];

  const saturdayTimeSlots = [
    { start: '10:00', end: '11:00', isActive: true },
    { start: '11:00', end: '12:00', isActive: true },
    { start: '12:00', end: '13:00', isActive: true },
    { start: '14:00', end: '15:00', isActive: true },
    { start: '15:00', end: '16:00', isActive: true },
  ];

  await Availability.create({
    providerId: user._id,
    weeklySchedule: {
      monday: { isAvailable: true, timeSlots: defaultTimeSlots },
      tuesday: { isAvailable: true, timeSlots: defaultTimeSlots },
      wednesday: { isAvailable: true, timeSlots: defaultTimeSlots },
      thursday: { isAvailable: true, timeSlots: defaultTimeSlots },
      friday: { isAvailable: true, timeSlots: defaultTimeSlots },
      saturday: { isAvailable: true, timeSlots: saturdayTimeSlots },
      sunday: { isAvailable: false, timeSlots: [] }
    },
    dateOverrides: [],
    blockedPeriods: [],
    timezone: 'Asia/Kolkata',
    bufferTime: {
      beforeBooking: 15,
      afterBooking: 15,
      minimumGap: 30
    },
    maxAdvanceBookingDays: 30,
    autoAcceptBookings: true
  });

  console.log(`  Created availability schedule`);

  return {
    user,
    providerProfile,
    servicesCount: serviceDocuments.length
  };
}

async function updateCategoryMetadata() {
  console.log('\nUpdating category metadata...');

  for (const catData of CATEGORIES) {
    const serviceCount = await Service.countDocuments({
      category: catData.name,
      isActive: true
    });

    const providerCount = await ProviderProfile.countDocuments({
      'services.category': catData.name,
      isActive: true,
      'instagramStyleProfile.isVerified': true
    });

    await ServiceCategory.updateOne(
      { slug: catData.slug },
      {
        $set: {
          'metadata.totalServices': serviceCount,
          'metadata.totalProviders': providerCount
        }
      }
    );

    console.log(`  ${catData.name}: ${providerCount} providers, ${serviceCount} services`);
  }
}

async function main() {
  try {
    await connectDB();
    await clearTestData();

    console.log('\n========================================');
    console.log('Creating 6 Test Providers');
    console.log('========================================');

    const results = [];
    for (const categoryData of CATEGORIES) {
      const result = await createProvider(categoryData);
      results.push(result);
    }

    await updateCategoryMetadata();

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log(`Created ${results.length} providers`);
    console.log(`Total services: ${results.reduce((sum, r) => sum + r.servicesCount, 0)}`);
    console.log('\nTest Credentials:');
    console.log(`Password for all providers: ${DEFAULT_PASSWORD}`);
    console.log('\nProvider Emails:');
    results.forEach(r => {
      console.log(`  - ${r.user.email}`);
    });

    console.log('\n✅ Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
