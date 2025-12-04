import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import ServiceCategory from '../models/serviceCategory.model';
import database from '../config/database';

/**
 * NILIN Master Categories
 * As per NILIN Phase 2 document - 6 master categories with subcategories
 */
const NILIN_CATEGORIES = [
  {
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Professional beauty and wellness services at your doorstep',
    icon: 'beauty',
    color: '#FF6B9D',
    sortOrder: 1,
    isFeatured: true,
    subcategories: [
      {
        name: 'Hair',
        slug: 'hair',
        description: 'Hair cutting, styling, coloring, balayage, keratin treatment, extensions',
        icon: 'scissors',
        color: '#FF8A80',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 500,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['hair_cutting', 'color_theory', 'styling']
        }
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'Bridal, event, daily glam, HD photography makeup',
        icon: 'palette',
        color: '#F48FB1',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 800,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['makeup_artistry', 'color_matching', 'event_makeup']
        }
      },
      {
        name: 'Nails',
        slug: 'nails',
        description: 'Manicure, pedicure, gel, acrylic, nail art, nail repair',
        icon: 'hand',
        color: '#CE93D8',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 400,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['manicure', 'pedicure', 'nail_art']
        }
      },
      {
        name: 'Skin & Aesthetics',
        slug: 'skin-aesthetics',
        description: 'Facials, chemical peels, microdermabrasion, LED therapy',
        icon: 'sparkles',
        color: '#B39DDB',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 700,
          averageDuration: 75,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['skincare', 'facial_massage', 'product_knowledge']
        }
      },
      {
        name: 'Massage & Body Treatment',
        slug: 'massage-body',
        description: 'Swedish, deep tissue, hot stone, lymphatic drainage',
        icon: 'massage',
        color: '#90CAF9',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 900,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['massage_therapy', 'anatomy', 'pressure_techniques']
        }
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Waxing, threading, eyebrow shaping, eyelash extensions',
        icon: 'eye',
        color: '#A5D6A7',
        sortOrder: 6,
        isActive: true,
        metadata: {
          averagePrice: 350,
          averageDuration: 30,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['threading', 'waxing', 'lash_extensions']
        }
      }
    ],
    seo: {
      metaTitle: 'Beauty & Wellness Services - NILIN',
      metaDescription: 'Book professional beauty services at home - hair styling, makeup, nails, skin care, massage & more.',
      keywords: ['beauty services', 'hair styling', 'makeup', 'facial', 'nail care', 'massage', 'wellness']
    }
  },

  {
    name: 'Fitness & Personal Health',
    slug: 'fitness-personal-health',
    description: 'Personal training, fitness coaching, and health optimization',
    icon: 'dumbbell',
    color: '#FF9800',
    sortOrder: 2,
    isFeatured: true,
    subcategories: [
      {
        name: 'Personal Training',
        slug: 'personal-training',
        description: 'In-home or park sessions, strength/HIIT, tailored regimens',
        icon: 'person-running',
        color: '#FFB74D',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 800,
          averageDuration: 60,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['personal_training', 'exercise_physiology', 'nutrition']
        }
      },
      {
        name: 'Group Classes',
        slug: 'group-classes',
        description: 'Small private group yoga, Pilates, bootcamps',
        icon: 'users',
        color: '#FFCC02',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 500,
          averageDuration: 60,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['group_instruction', 'motivation', 'class_management']
        }
      },
      {
        name: 'Yoga & Meditation',
        slug: 'yoga-meditation',
        description: 'Vinyasa, Hatha, guided mindfulness sessions',
        icon: 'yoga',
        color: '#FFE082',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 600,
          averageDuration: 75,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['yoga_instruction', 'meditation', 'breathing_techniques']
        }
      },
      {
        name: 'Nutrition & Dietetics',
        slug: 'nutrition-dietetics',
        description: 'Meal plans, follow-ups, macro tracking',
        icon: 'apple',
        color: '#FFF176',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 1000,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['nutrition', 'meal_planning', 'dietary_counseling']
        }
      },
      {
        name: 'Rehabilitation & Physiotherapy',
        slug: 'rehabilitation-physiotherapy',
        description: 'Post-injury sessions with licensed physiotherapists',
        icon: 'medical',
        color: '#81C784',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 1200,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['physiotherapy', 'rehabilitation', 'anatomy']
        }
      },
      {
        name: 'Wellness Coaching',
        slug: 'wellness-coaching',
        description: 'Holistic plans covering sleep, stress, lifestyle',
        icon: 'heart',
        color: '#A5D6A7',
        sortOrder: 6,
        isActive: true,
        metadata: {
          averagePrice: 900,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['wellness_coaching', 'stress_management', 'lifestyle_planning']
        }
      }
    ],
    seo: {
      metaTitle: 'Fitness & Personal Health - NILIN',
      metaDescription: 'Find certified personal trainers, yoga instructors, nutritionists & wellness coaches for your health goals.',
      keywords: ['personal training', 'yoga', 'fitness', 'nutrition', 'physiotherapy', 'wellness']
    }
  },

  {
    name: 'Mobile Medical Care',
    slug: 'mobile-medical-care',
    description: 'Healthcare services delivered to your home',
    icon: 'medical',
    color: '#4CAF50',
    sortOrder: 3,
    isFeatured: true,
    subcategories: [
      {
        name: 'Home Consultations',
        slug: 'home-consultations',
        description: 'GP visits, pediatric checkups, elderly care visits',
        icon: 'stethoscope',
        color: '#66BB6A',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 1500,
          averageDuration: 30,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['general_medicine', 'diagnosis', 'patient_care']
        }
      },
      {
        name: 'Nurse Services',
        slug: 'nurse-services',
        description: 'Injections, wound care, IV therapies, post-op care',
        icon: 'syringe',
        color: '#81C784',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 800,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['nursing', 'wound_care', 'iv_therapy']
        }
      },
      {
        name: 'Diagnostic Services',
        slug: 'diagnostic-services',
        description: 'Blood draws, ECG, rapid tests, mobile imaging partnerships',
        icon: 'test-tube',
        color: '#A5D6A7',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 600,
          averageDuration: 30,
          popularTimes: ['morning'],
          requiredSkills: ['phlebotomy', 'ecg', 'diagnostics']
        }
      },
      {
        name: 'Vaccination & Preventive Care',
        slug: 'vaccination-preventive',
        description: 'Seasonal vaccines, routine immunizations',
        icon: 'shield',
        color: '#C8E6C9',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 500,
          averageDuration: 20,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['vaccination', 'immunization', 'preventive_care']
        }
      },
      {
        name: 'Telemedicine',
        slug: 'telemedicine',
        description: 'Remote consults with specialists and referral coordination',
        icon: 'video',
        color: '#90CAF9',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 400,
          averageDuration: 20,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['telemedicine', 'consultation', 'referral_management']
        }
      },
      {
        name: 'Emergency Triage',
        slug: 'emergency-triage',
        description: 'Emergency assessment and transport coordination',
        icon: 'ambulance',
        color: '#EF5350',
        sortOrder: 6,
        isActive: true,
        metadata: {
          averagePrice: 2000,
          averageDuration: 30,
          popularTimes: ['morning', 'afternoon', 'evening', 'night'],
          requiredSkills: ['emergency_medicine', 'triage', 'first_aid']
        }
      }
    ],
    seo: {
      metaTitle: 'Mobile Medical Care - NILIN',
      metaDescription: 'Book home healthcare services - doctor visits, nursing care, diagnostics, vaccinations & telemedicine.',
      keywords: ['home doctor', 'nurse services', 'blood test at home', 'vaccination', 'telemedicine']
    }
  },

  {
    name: 'Education & Personal Development',
    slug: 'education-personal-development',
    description: 'Learning and skill development services',
    icon: 'book',
    color: '#9C27B0',
    sortOrder: 4,
    isFeatured: true,
    subcategories: [
      {
        name: 'Academic Tutoring',
        slug: 'academic-tutoring',
        description: 'K-12 subjects, exam prep, university-level tutoring',
        icon: 'graduation-cap',
        color: '#AB47BC',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 500,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['subject_expertise', 'teaching', 'student_assessment']
        }
      },
      {
        name: 'Language Lessons',
        slug: 'language-lessons',
        description: 'Conversational and exam-oriented (IELTS, TOEFL)',
        icon: 'globe',
        color: '#BA68C8',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 600,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['language_fluency', 'cultural_knowledge', 'exam_prep']
        }
      },
      {
        name: 'Professional Skills',
        slug: 'professional-skills',
        description: 'Coding, design, digital marketing, project management',
        icon: 'laptop',
        color: '#CE93D8',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 800,
          averageDuration: 90,
          popularTimes: ['evening'],
          requiredSkills: ['technical_skills', 'industry_knowledge', 'mentoring']
        }
      },
      {
        name: 'Creative Skills',
        slug: 'creative-skills',
        description: 'Music lessons, art, photography workshops',
        icon: 'music-note',
        color: '#D1C4E9',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 700,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['artistic_technique', 'creativity', 'instruction']
        }
      },
      {
        name: 'Career Coaching',
        slug: 'career-coaching',
        description: 'CV/resume reviews, interview prep, career mapping',
        icon: 'briefcase',
        color: '#E1BEE7',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 1500,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['career_coaching', 'resume_writing', 'interview_prep']
        }
      }
    ],
    seo: {
      metaTitle: 'Education & Tutoring - NILIN',
      metaDescription: 'Find expert tutors for academics, languages, professional skills, creative arts & career coaching.',
      keywords: ['tutoring', 'education', 'language learning', 'coding', 'career coaching']
    }
  },

  {
    name: 'Corporate Services',
    slug: 'corporate-services',
    description: 'B2B services for businesses and enterprises',
    icon: 'building',
    color: '#607D8B',
    sortOrder: 5,
    isFeatured: false,
    subcategories: [
      {
        name: 'Employee Wellness',
        slug: 'employee-wellness',
        description: 'On-site health checks, mental wellness workshops, fitness classes',
        icon: 'heart-pulse',
        color: '#78909C',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 5000,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['wellness_programs', 'corporate_training', 'health_assessment']
        }
      },
      {
        name: 'Facility Maintenance',
        slug: 'facility-maintenance',
        description: 'Scheduled cleaning, HVAC servicing, general repairs',
        icon: 'building-maintenance',
        color: '#90A4AE',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 3000,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['facility_management', 'maintenance', 'cleaning']
        }
      },
      {
        name: 'Medical Programs',
        slug: 'medical-programs',
        description: 'Periodic screening, vaccination drives, occupational health',
        icon: 'medical-cross',
        color: '#B0BEC5',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 10000,
          averageDuration: 240,
          popularTimes: ['morning'],
          requiredSkills: ['occupational_health', 'screening', 'corporate_medical']
        }
      },
      {
        name: 'Hospitality & Events',
        slug: 'hospitality-events',
        description: 'On-demand staffing, housekeeping, VIP guest services',
        icon: 'concierge',
        color: '#CFD8DC',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 8000,
          averageDuration: 480,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['hospitality', 'event_management', 'customer_service']
        }
      },
      {
        name: 'Managed Services',
        slug: 'managed-services',
        description: 'Subscription-based facility management and vendor coordination',
        icon: 'settings',
        color: '#ECEFF1',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 15000,
          averageDuration: 0,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['vendor_management', 'contract_management', 'operations']
        }
      }
    ],
    seo: {
      metaTitle: 'Corporate Services - NILIN',
      metaDescription: 'Enterprise solutions for employee wellness, facility maintenance, medical programs & managed services.',
      keywords: ['corporate wellness', 'facility management', 'employee health', 'B2B services']
    }
  },

  {
    name: 'Home & Maintenance',
    slug: 'home-maintenance',
    description: 'Home repair, cleaning, and maintenance services',
    icon: 'home',
    color: '#2196F3',
    sortOrder: 6,
    isFeatured: true,
    subcategories: [
      {
        name: 'Cleaning',
        slug: 'cleaning',
        description: 'Routine cleaning, deep cleaning, move-in/move-out, carpet & upholstery',
        icon: 'broom',
        color: '#42A5F5',
        sortOrder: 1,
        isActive: true,
        metadata: {
          averagePrice: 500,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['residential_cleaning', 'time_management', 'attention_to_detail']
        }
      },
      {
        name: 'Plumbing',
        slug: 'plumbing',
        description: 'Leak repair, toilet repair, pipe replacement, emergency plumbing',
        icon: 'wrench',
        color: '#64B5F6',
        sortOrder: 2,
        isActive: true,
        metadata: {
          averagePrice: 600,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['plumbing', 'pipe_repair', 'water_systems']
        }
      },
      {
        name: 'Electrical',
        slug: 'electrical',
        description: 'Wiring, lighting installation, socket repair, appliance troubleshooting',
        icon: 'zap',
        color: '#90CAF9',
        sortOrder: 3,
        isActive: true,
        metadata: {
          averagePrice: 700,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['electrical_work', 'wiring', 'safety_protocols']
        }
      },
      {
        name: 'HVAC & AC',
        slug: 'hvac-ac',
        description: 'Installation, servicing, filter replacement, emergency fixes',
        icon: 'thermometer',
        color: '#BBDEFB',
        sortOrder: 4,
        isActive: true,
        metadata: {
          averagePrice: 800,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['hvac', 'ac_repair', 'refrigeration']
        }
      },
      {
        name: 'Carpentry & Renovation',
        slug: 'carpentry-renovation',
        description: 'Furniture assembly, door/window repair, small refurbishments',
        icon: 'hammer',
        color: '#E3F2FD',
        sortOrder: 5,
        isActive: true,
        metadata: {
          averagePrice: 900,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['carpentry', 'woodworking', 'renovation']
        }
      },
      {
        name: 'Smart Home & Appliances',
        slug: 'smart-home-appliances',
        description: 'Smart device installation, TV mounting, network setup',
        icon: 'wifi',
        color: '#1E88E5',
        sortOrder: 6,
        isActive: true,
        metadata: {
          averagePrice: 600,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['smart_home', 'networking', 'installation']
        }
      }
    ],
    seo: {
      metaTitle: 'Home & Maintenance Services - NILIN',
      metaDescription: 'Book reliable home services - cleaning, plumbing, electrical, AC repair, carpentry & smart home installation.',
      keywords: ['home services', 'cleaning', 'plumbing', 'electrical', 'AC repair', 'handyman']
    }
  }
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log('Starting NILIN service categories seeding...');

    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories with full metadata
    await ServiceCategory.insertMany(NILIN_CATEGORIES);
    console.log('NILIN service categories seeded successfully');

    // Log statistics
    const totalSubcategories = NILIN_CATEGORIES.reduce((acc, cat) => acc + cat.subcategories.length, 0);
    console.log(`Seeding Statistics:`);
    console.log(`   Master Categories: ${NILIN_CATEGORIES.length}`);
    console.log(`   Total Subcategories: ${totalSubcategories}`);
    console.log(`   Featured Categories: ${NILIN_CATEGORIES.filter(cat => cat.isFeatured).length}`);

    // Show category breakdown
    console.log(`NILIN Category Breakdown:`);
    NILIN_CATEGORIES.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.subcategories.length} subcategories)`);
    });

    return Promise.resolve();
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

// Advanced seeding with user audit
export const seedCategoriesWithAudit = async (adminUserId?: string): Promise<void> => {
  try {
    console.log('Starting NILIN service categories seeding with audit...');

    // Add audit information if admin user provided
    const categoriesWithAudit = NILIN_CATEGORIES.map(cat => ({
      ...cat,
      createdBy: adminUserId ? new mongoose.Types.ObjectId(adminUserId) : undefined,
      updatedBy: adminUserId ? new mongoose.Types.ObjectId(adminUserId) : undefined
    }));

    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    await ServiceCategory.insertMany(categoriesWithAudit);
    console.log('NILIN service categories seeded successfully with audit trail');

  } catch (error) {
    console.error('Error seeding categories with audit:', error);
    throw error;
  }
};

// Export the categories for use in migration scripts
export const NILIN_MASTER_CATEGORIES = NILIN_CATEGORIES;

// Run seeder if called directly
if (require.main === module) {
  (async () => {
    try {
      await database.connect();
      await seedCategories();
      console.log('NILIN category seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  })();
}
