import mongoose from 'mongoose';
import ServiceCategory from '../models/serviceCategory.model';
import database from '../config/database';

const categories = [
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Professional beauty and personal care services including hair, makeup, skincare, and nail care',
    icon: 'beauty',
    color: '#FF6B9D',
    sortOrder: 1,
    isFeatured: true,
    subcategories: [
      {
        name: 'Hair Styling',
        slug: 'hair-styling',
        description: 'Professional hair cutting, styling, coloring, and treatments',
        icon: 'scissors',
        color: '#FF8A80',
        sortOrder: 1,
        metadata: {
          averagePrice: 75,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['hair_cutting', 'color_theory', 'styling']
        }
      },
      {
        name: 'Makeup Services',
        slug: 'makeup-services',
        description: 'Professional makeup for events, weddings, and special occasions',
        icon: 'palette',
        color: '#F48FB1',
        sortOrder: 2,
        metadata: {
          averagePrice: 100,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['makeup_artistry', 'color_matching', 'event_makeup']
        }
      },
      {
        name: 'Facial Treatments',
        slug: 'facial-treatments',
        description: 'Professional facial treatments, skincare, and anti-aging services',
        icon: 'sparkles',
        color: '#CE93D8',
        sortOrder: 3,
        metadata: {
          averagePrice: 85,
          averageDuration: 75,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['skincare', 'facial_massage', 'product_knowledge']
        }
      },
      {
        name: 'Nail Care',
        slug: 'nail-care',
        description: 'Manicure, pedicure, nail art, and nail enhancement services',
        icon: 'hand',
        color: '#B39DDB',
        sortOrder: 4,
        metadata: {
          averagePrice: 45,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['manicure', 'pedicure', 'nail_art']
        }
      },
      {
        name: 'Eyebrows & Lashes',
        slug: 'eyebrows-lashes',
        description: 'Eyebrow shaping, threading, tinting, and eyelash extensions',
        icon: 'eye',
        color: '#90CAF9',
        sortOrder: 5,
        metadata: {
          averagePrice: 55,
          averageDuration: 30,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['threading', 'waxing', 'lash_extensions']
        }
      }
    ],
    seo: {
      metaTitle: 'Professional Beauty Services - Hair, Makeup & Skincare',
      metaDescription: 'Book professional beauty services including hair styling, makeup, facials, and nail care with verified beauty professionals.',
      keywords: ['beauty services', 'hair styling', 'makeup', 'facial', 'nail care', 'eyebrows']
    }
  },
  
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Comprehensive health and wellness services for mind, body, and spirit',
    icon: 'heart',
    color: '#4CAF50',
    sortOrder: 2,
    isFeatured: true,
    subcategories: [
      {
        name: 'Massage Therapy',
        slug: 'massage-therapy',
        description: 'Therapeutic and relaxation massage services including deep tissue, Swedish, and hot stone',
        icon: 'massage',
        color: '#66BB6A',
        sortOrder: 1,
        metadata: {
          averagePrice: 90,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['massage_therapy', 'anatomy', 'pressure_techniques']
        }
      },
      {
        name: 'Spa Treatments',
        slug: 'spa-treatments',
        description: 'Comprehensive spa experiences including body wraps, scrubs, and aromatherapy',
        icon: 'flower',
        color: '#81C784',
        sortOrder: 2,
        metadata: {
          averagePrice: 120,
          averageDuration: 90,
          popularTimes: ['afternoon'],
          requiredSkills: ['spa_treatments', 'aromatherapy', 'body_treatments']
        }
      },
      {
        name: 'Acupuncture',
        slug: 'acupuncture',
        description: 'Traditional acupuncture and alternative healing therapies',
        icon: 'target',
        color: '#A5D6A7',
        sortOrder: 3,
        metadata: {
          averagePrice: 85,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['acupuncture', 'tcm', 'holistic_healing']
        }
      },
      {
        name: 'Meditation & Mindfulness',
        slug: 'meditation-mindfulness',
        description: 'Guided meditation, mindfulness coaching, and stress reduction techniques',
        icon: 'zen',
        color: '#C8E6C9',
        sortOrder: 4,
        metadata: {
          averagePrice: 60,
          averageDuration: 45,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['meditation', 'mindfulness', 'stress_management']
        }
      }
    ],
    seo: {
      metaTitle: 'Health & Wellness Services - Massage, Spa & Therapy',
      metaDescription: 'Find certified health and wellness professionals for massage therapy, spa treatments, acupuncture, and meditation services.',
      keywords: ['massage therapy', 'spa treatments', 'wellness', 'acupuncture', 'meditation']
    }
  },

  {
    name: 'Fitness & Training',
    slug: 'fitness-training',
    description: 'Personal training, fitness coaching, and specialized workout programs',
    icon: 'dumbbell',
    color: '#FF9800',
    sortOrder: 3,
    isFeatured: true,
    subcategories: [
      {
        name: 'Personal Training',
        slug: 'personal-training',
        description: 'One-on-one fitness training sessions tailored to your goals',
        icon: 'person-running',
        color: '#FFB74D',
        sortOrder: 1,
        metadata: {
          averagePrice: 70,
          averageDuration: 60,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['personal_training', 'exercise_physiology', 'nutrition']
        }
      },
      {
        name: 'Yoga Instruction',
        slug: 'yoga-instruction',
        description: 'Private and group yoga sessions for all levels and styles',
        icon: 'yoga',
        color: '#FFCC02',
        sortOrder: 2,
        metadata: {
          averagePrice: 55,
          averageDuration: 75,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['yoga_instruction', 'anatomy', 'meditation']
        }
      },
      {
        name: 'Pilates',
        slug: 'pilates',
        description: 'Pilates instruction focusing on core strength and flexibility',
        icon: 'pilates',
        color: '#FFE082',
        sortOrder: 3,
        metadata: {
          averagePrice: 65,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['pilates', 'core_training', 'flexibility']
        }
      },
      {
        name: 'Nutrition Coaching',
        slug: 'nutrition-coaching',
        description: 'Personalized nutrition counseling and meal planning services',
        icon: 'apple',
        color: '#FFF176',
        sortOrder: 4,
        metadata: {
          averagePrice: 80,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['nutrition', 'meal_planning', 'dietary_counseling']
        }
      },
      {
        name: 'Dance Instruction',
        slug: 'dance-instruction',
        description: 'Private dance lessons in various styles and skill levels',
        icon: 'music',
        color: '#FFEB3B',
        sortOrder: 5,
        metadata: {
          averagePrice: 50,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['dance_instruction', 'choreography', 'rhythm']
        }
      }
    ],
    seo: {
      metaTitle: 'Fitness & Training - Personal Trainers & Yoga Instructors',
      metaDescription: 'Connect with certified fitness professionals, personal trainers, yoga instructors, and nutrition coaches for personalized health coaching.',
      keywords: ['personal training', 'yoga', 'pilates', 'fitness coaching', 'nutrition']
    }
  },

  {
    name: 'Home Services',
    slug: 'home-services',
    description: 'Professional home maintenance, repair, and improvement services',
    icon: 'home',
    color: '#2196F3',
    sortOrder: 4,
    isFeatured: true,
    subcategories: [
      {
        name: 'House Cleaning',
        slug: 'house-cleaning',
        description: 'Residential cleaning services including deep cleaning and maintenance',
        icon: 'broom',
        color: '#42A5F5',
        sortOrder: 1,
        metadata: {
          averagePrice: 120,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['residential_cleaning', 'time_management', 'attention_to_detail']
        }
      },
      {
        name: 'Plumbing Services',
        slug: 'plumbing-services',
        description: 'Professional plumbing repairs, installations, and maintenance',
        icon: 'wrench',
        color: '#64B5F6',
        sortOrder: 2,
        metadata: {
          averagePrice: 150,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['plumbing', 'pipe_repair', 'water_systems']
        }
      },
      {
        name: 'Electrical Services',
        slug: 'electrical-services',
        description: 'Electrical repairs, installations, and safety inspections',
        icon: 'zap',
        color: '#90CAF9',
        sortOrder: 3,
        metadata: {
          averagePrice: 175,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['electrical_work', 'wiring', 'safety_protocols']
        }
      },
      {
        name: 'Landscaping & Gardening',
        slug: 'landscaping-gardening',
        description: 'Garden maintenance, landscaping design, and outdoor beautification',
        icon: 'leaf',
        color: '#BBDEFB',
        sortOrder: 4,
        metadata: {
          averagePrice: 100,
          averageDuration: 240,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['landscaping', 'horticulture', 'garden_design']
        }
      },
      {
        name: 'Handyman Services',
        slug: 'handyman-services',
        description: 'General home repairs, installations, and maintenance tasks',
        icon: 'tools',
        color: '#E3F2FD',
        sortOrder: 5,
        metadata: {
          averagePrice: 85,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['general_repairs', 'carpentry', 'problem_solving']
        }
      }
    ],
    seo: {
      metaTitle: 'Home Services - Cleaning, Plumbing & Maintenance',
      metaDescription: 'Find reliable home service professionals for cleaning, plumbing, electrical work, and general maintenance needs.',
      keywords: ['home services', 'house cleaning', 'plumbing', 'electrical', 'handyman']
    }
  },

  {
    name: 'Education & Tutoring',
    slug: 'education-tutoring',
    description: 'Educational services, tutoring, and skill development programs',
    icon: 'book',
    color: '#9C27B0',
    sortOrder: 5,
    isFeatured: false,
    subcategories: [
      {
        name: 'Academic Tutoring',
        slug: 'academic-tutoring',
        description: 'Subject-specific tutoring for students of all ages and levels',
        icon: 'graduation-cap',
        color: '#AB47BC',
        sortOrder: 1,
        metadata: {
          averagePrice: 45,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['subject_expertise', 'teaching', 'student_assessment']
        }
      },
      {
        name: 'Language Learning',
        slug: 'language-learning',
        description: 'Foreign language instruction and conversation practice',
        icon: 'globe',
        color: '#BA68C8',
        sortOrder: 2,
        metadata: {
          averagePrice: 50,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['language_fluency', 'cultural_knowledge', 'conversation']
        }
      },
      {
        name: 'Music Lessons',
        slug: 'music-lessons',
        description: 'Private music instruction for various instruments and voice',
        icon: 'music-note',
        color: '#CE93D8',
        sortOrder: 3,
        metadata: {
          averagePrice: 60,
          averageDuration: 45,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['musical_instrument', 'music_theory', 'performance']
        }
      },
      {
        name: 'Art & Drawing',
        slug: 'art-drawing',
        description: 'Art instruction including drawing, painting, and creative techniques',
        icon: 'palette',
        color: '#D1C4E9',
        sortOrder: 4,
        metadata: {
          averagePrice: 55,
          averageDuration: 90,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['artistic_technique', 'creativity', 'art_history']
        }
      },
      {
        name: 'Test Preparation',
        slug: 'test-preparation',
        description: 'Standardized test prep for SAT, ACT, GRE, and other exams',
        icon: 'clipboard',
        color: '#E1BEE7',
        sortOrder: 5,
        metadata: {
          averagePrice: 70,
          averageDuration: 90,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['test_strategies', 'subject_mastery', 'time_management']
        }
      }
    ],
    seo: {
      metaTitle: 'Education & Tutoring - Academic & Skill Development',
      metaDescription: 'Find qualified tutors and educators for academic subjects, language learning, music, art, and test preparation.',
      keywords: ['tutoring', 'education', 'language learning', 'music lessons', 'test prep']
    }
  }
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log('🌱 Starting service categories seeding...');

    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories with full metadata
    await ServiceCategory.insertMany(categories);
    console.log('✅ Service categories seeded successfully');
    
    // Log statistics
    const totalSubcategories = categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
    console.log(`📊 Seeding Statistics:`);
    console.log(`   └── Categories: ${categories.length}`);
    console.log(`   └── Subcategories: ${totalSubcategories}`);
    console.log(`   └── Featured Categories: ${categories.filter(cat => cat.isFeatured).length}`);
    
    // Show category breakdown
    console.log(`📋 Category Breakdown:`);
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.subcategories.length} subcategories)`);
    });

    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Advanced seeding with user audit
export const seedCategoriesWithAudit = async (adminUserId?: string): Promise<void> => {
  try {
    console.log('🌱 Starting service categories seeding with audit...');

    // Add audit information if admin user provided
    const categoriesWithAudit = categories.map(cat => ({
      ...cat,
      createdBy: adminUserId ? new mongoose.Types.ObjectId(adminUserId) : undefined,
      updatedBy: adminUserId ? new mongoose.Types.ObjectId(adminUserId) : undefined
    }));

    // Clear existing categories
    await ServiceCategory.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Insert new categories
    await ServiceCategory.insertMany(categoriesWithAudit);
    console.log('✅ Service categories seeded successfully with audit trail');

  } catch (error) {
    console.error('❌ Error seeding categories with audit:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  (async () => {
    try {
      await database.connect();
      await seedCategories();
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    }
  })();
}