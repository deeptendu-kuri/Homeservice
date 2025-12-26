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
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200',
    sortOrder: 1,
    isFeatured: true,
    metadata: {
      displayConfig: {
        tagline: 'Premium services, handpicked by NILIN',
        heroImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400',
        iconEmoji: '💅',
        gradient: 'from-nilin-pink/60 to-nilin-pink',
        accentColor: 'bg-nilin-accent'
      }
    },
    subcategories: [
      {
        name: 'Hair',
        slug: 'hair',
        description: 'At-home premium experience',
        icon: 'scissors',
        color: '#FF8A80',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Hair Styling (At Home)',
          heroTitle: 'Professional Hair Styling at Home',
          heroSubtitle: 'Expert stylists at your doorstep for cuts, color, and styling',
          heroImage: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1400',
          iconImage: '/icons/hair-styling.svg',
          averagePrice: 500,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['hair_cutting', 'color_theory', 'styling']
        }
      },
      {
        name: 'Makeup',
        slug: 'makeup',
        description: 'At-home premium experience',
        icon: 'palette',
        color: '#F48FB1',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Professional Makeup',
          heroTitle: 'Professional Makeup Artistry at Home',
          heroSubtitle: 'Bridal, event, and everyday glam by certified artists',
          heroImage: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=1400',
          iconImage: '/icons/makeup.svg',
          averagePrice: 800,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['makeup_artistry', 'color_matching', 'event_makeup']
        }
      },
      {
        name: 'Nails',
        slug: 'nails',
        description: 'At-home premium experience',
        icon: 'hand',
        color: '#CE93D8',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Nail Care & Extensions',
          heroTitle: 'Professional Nail Care at Home',
          heroSubtitle: 'Manicures, pedicures, and nail art by skilled technicians',
          heroImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1400',
          iconImage: '/icons/nails.svg',
          averagePrice: 400,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['manicure', 'pedicure', 'nail_art']
        }
      },
      {
        name: 'Skin & Aesthetics',
        slug: 'skin-aesthetics',
        description: 'At-home premium experience',
        icon: 'sparkles',
        color: '#B39DDB',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'Skin & Facial Treatments',
          heroTitle: 'Luxury Facial Treatments at Home',
          heroSubtitle: 'Rejuvenating facials and skin treatments by estheticians',
          heroImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1400',
          iconImage: '/icons/facial.svg',
          averagePrice: 700,
          averageDuration: 75,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['skincare', 'facial_massage', 'product_knowledge']
        }
      },
      {
        name: 'Massage & Body Treatment',
        slug: 'massage-body',
        description: 'At-home premium experience',
        icon: 'massage',
        color: '#90CAF9',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Luxury Massage Therapy',
          heroTitle: 'Luxury Massage Therapy at Home',
          heroSubtitle: 'Professional, verified massage therapists at your location',
          heroImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400',
          iconImage: '/icons/massage.svg',
          averagePrice: 900,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['massage_therapy', 'anatomy', 'pressure_techniques']
        }
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'At-home premium experience',
        icon: 'eye',
        color: '#A5D6A7',
        sortOrder: 6,
        isActive: true,
        metadata: {
          displayName: 'Bridal & Event Beauty',
          heroTitle: 'Complete Bridal & Event Beauty',
          heroSubtitle: 'Comprehensive beauty services for your special occasions',
          heroImage: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1400',
          iconImage: '/icons/bridal.svg',
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
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200',
    sortOrder: 2,
    isFeatured: true,
    metadata: {
      displayConfig: {
        tagline: 'Achieve your fitness goals with expert guidance',
        heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400',
        iconEmoji: '💪',
        gradient: 'from-orange-100/60 to-orange-200',
        accentColor: 'bg-orange-500'
      }
    },
    subcategories: [
      {
        name: 'Personal Training',
        slug: 'personal-training',
        description: 'At-home premium experience',
        icon: 'person-running',
        color: '#FFB74D',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Personal Training',
          heroTitle: 'Personal Training at Your Location',
          heroSubtitle: 'Certified trainers for strength, HIIT, and tailored fitness regimens',
          heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400',
          iconImage: '/icons/personal-training.svg',
          averagePrice: 800,
          averageDuration: 60,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['personal_training', 'exercise_physiology', 'nutrition']
        }
      },
      {
        name: 'Group Classes',
        slug: 'group-classes',
        description: 'At-home premium experience',
        icon: 'users',
        color: '#FFCC02',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Group Fitness Classes',
          heroTitle: 'Private Group Fitness Classes',
          heroSubtitle: 'Yoga, Pilates, and bootcamp sessions for small groups',
          heroImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1400',
          iconImage: '/icons/group-fitness.svg',
          averagePrice: 500,
          averageDuration: 60,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['group_instruction', 'motivation', 'class_management']
        }
      },
      {
        name: 'Yoga & Meditation',
        slug: 'yoga-meditation',
        description: 'At-home premium experience',
        icon: 'yoga',
        color: '#FFE082',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Yoga & Meditation',
          heroTitle: 'Private Yoga & Meditation Sessions',
          heroSubtitle: 'Vinyasa, Hatha, and guided mindfulness with certified instructors',
          heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400',
          iconImage: '/icons/yoga.svg',
          averagePrice: 600,
          averageDuration: 75,
          popularTimes: ['morning', 'evening'],
          requiredSkills: ['yoga_instruction', 'meditation', 'breathing_techniques']
        }
      },
      {
        name: 'Nutrition & Dietetics',
        slug: 'nutrition-dietetics',
        description: 'At-home premium experience',
        icon: 'apple',
        color: '#FFF176',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'Nutrition Consulting',
          heroTitle: 'Personalized Nutrition & Diet Planning',
          heroSubtitle: 'Custom meal plans and dietary guidance by certified nutritionists',
          heroImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400',
          iconImage: '/icons/nutrition.svg',
          averagePrice: 1000,
          averageDuration: 60,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['nutrition', 'meal_planning', 'dietary_counseling']
        }
      },
      {
        name: 'Rehabilitation & Physiotherapy',
        slug: 'rehabilitation-physiotherapy',
        description: 'At-home premium experience',
        icon: 'medical',
        color: '#81C784',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Physiotherapy',
          heroTitle: 'Physiotherapy & Rehabilitation at Home',
          heroSubtitle: 'Licensed physiotherapists for injury recovery and mobility',
          heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
          iconImage: '/icons/physiotherapy.svg',
          averagePrice: 1200,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['physiotherapy', 'rehabilitation', 'anatomy']
        }
      },
      {
        name: 'Wellness Coaching',
        slug: 'wellness-coaching',
        description: 'At-home premium experience',
        icon: 'heart',
        color: '#A5D6A7',
        sortOrder: 6,
        isActive: true,
        metadata: {
          displayName: 'Wellness Coaching',
          heroTitle: 'Holistic Wellness Coaching',
          heroSubtitle: 'Comprehensive lifestyle guidance for sleep, stress, and balance',
          heroImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1400',
          iconImage: '/icons/wellness.svg',
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
    imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200',
    sortOrder: 3,
    isFeatured: true,
    metadata: {
      displayConfig: {
        tagline: 'Quality healthcare in the comfort of your home',
        heroImage: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1400',
        iconEmoji: '🏥',
        gradient: 'from-green-100/60 to-green-200',
        accentColor: 'bg-green-500'
      }
    },
    subcategories: [
      {
        name: 'Home Consultations',
        slug: 'home-consultations',
        description: 'At-home premium experience',
        icon: 'stethoscope',
        color: '#66BB6A',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Doctor Home Visits',
          heroTitle: 'Doctor Consultations at Home',
          heroSubtitle: 'Licensed physicians for GP visits, pediatric checkups, and elderly care',
          heroImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400',
          iconImage: '/icons/doctor.svg',
          averagePrice: 1500,
          averageDuration: 30,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['general_medicine', 'diagnosis', 'patient_care']
        }
      },
      {
        name: 'Nurse Services',
        slug: 'nurse-services',
        description: 'At-home premium experience',
        icon: 'syringe',
        color: '#81C784',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Nursing Care',
          heroTitle: 'Professional Nursing Care at Home',
          heroSubtitle: 'Qualified nurses for injections, wound care, IV therapy, and post-op care',
          heroImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400',
          iconImage: '/icons/nurse.svg',
          averagePrice: 800,
          averageDuration: 45,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['nursing', 'wound_care', 'iv_therapy']
        }
      },
      {
        name: 'Diagnostic Services',
        slug: 'diagnostic-services',
        description: 'At-home premium experience',
        icon: 'test-tube',
        color: '#A5D6A7',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Lab & Diagnostics',
          heroTitle: 'Home Lab Tests & Diagnostics',
          heroSubtitle: 'Blood draws, ECG, rapid tests, and comprehensive health screenings',
          heroImage: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?w=1400',
          iconImage: '/icons/lab.svg',
          averagePrice: 600,
          averageDuration: 30,
          popularTimes: ['morning'],
          requiredSkills: ['phlebotomy', 'ecg', 'diagnostics']
        }
      },
      {
        name: 'Vaccination & Preventive Care',
        slug: 'vaccination-preventive',
        description: 'At-home premium experience',
        icon: 'shield',
        color: '#C8E6C9',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'Vaccinations',
          heroTitle: 'Home Vaccination Services',
          heroSubtitle: 'Seasonal vaccines and routine immunizations by certified nurses',
          heroImage: 'https://images.unsplash.com/photo-1615631648086-325025c9e51e?w=1400',
          iconImage: '/icons/vaccine.svg',
          averagePrice: 500,
          averageDuration: 20,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['vaccination', 'immunization', 'preventive_care']
        }
      },
      {
        name: 'Telemedicine',
        slug: 'telemedicine',
        description: 'At-home premium experience',
        icon: 'video',
        color: '#90CAF9',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Telemedicine',
          heroTitle: 'Virtual Doctor Consultations',
          heroSubtitle: 'Connect with specialists remotely for consultations and referrals',
          heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
          iconImage: '/icons/telemedicine.svg',
          averagePrice: 400,
          averageDuration: 20,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['telemedicine', 'consultation', 'referral_management']
        }
      },
      {
        name: 'Emergency Triage',
        slug: 'emergency-triage',
        description: 'At-home premium experience',
        icon: 'ambulance',
        color: '#EF5350',
        sortOrder: 6,
        isActive: true,
        metadata: {
          displayName: 'Emergency Care',
          heroTitle: 'Emergency Medical Assessment',
          heroSubtitle: 'Rapid emergency assessment and transport coordination',
          heroImage: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1400',
          iconImage: '/icons/emergency.svg',
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
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200',
    sortOrder: 4,
    isFeatured: true,
    metadata: {
      displayConfig: {
        tagline: 'Learn and grow with expert instructors',
        heroImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1400',
        iconEmoji: '📚',
        gradient: 'from-purple-100/60 to-purple-200',
        accentColor: 'bg-purple-500'
      }
    },
    subcategories: [
      {
        name: 'Academic Tutoring',
        slug: 'academic-tutoring',
        description: 'At-home premium experience',
        icon: 'graduation-cap',
        color: '#AB47BC',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Academic Tutoring',
          heroTitle: 'Expert Academic Tutoring at Home',
          heroSubtitle: 'Qualified tutors for K-12, exam prep, and university subjects',
          heroImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1400',
          iconImage: '/icons/tutoring.svg',
          averagePrice: 500,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['subject_expertise', 'teaching', 'student_assessment']
        }
      },
      {
        name: 'Language Lessons',
        slug: 'language-lessons',
        description: 'At-home premium experience',
        icon: 'globe',
        color: '#BA68C8',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Language Lessons',
          heroTitle: 'Private Language Lessons',
          heroSubtitle: 'Native speakers for conversational and exam-oriented learning (IELTS, TOEFL)',
          heroImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=1400',
          iconImage: '/icons/language.svg',
          averagePrice: 600,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['language_fluency', 'cultural_knowledge', 'exam_prep']
        }
      },
      {
        name: 'Professional Skills',
        slug: 'professional-skills',
        description: 'At-home premium experience',
        icon: 'laptop',
        color: '#CE93D8',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Professional Skills',
          heroTitle: 'Professional Skills Training',
          heroSubtitle: 'Learn coding, design, digital marketing, and project management',
          heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400',
          iconImage: '/icons/professional.svg',
          averagePrice: 800,
          averageDuration: 90,
          popularTimes: ['evening'],
          requiredSkills: ['technical_skills', 'industry_knowledge', 'mentoring']
        }
      },
      {
        name: 'Creative Skills',
        slug: 'creative-skills',
        description: 'At-home premium experience',
        icon: 'music-note',
        color: '#D1C4E9',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'Creative Arts',
          heroTitle: 'Creative Arts Lessons at Home',
          heroSubtitle: 'Music lessons, art classes, and photography workshops',
          heroImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1400',
          iconImage: '/icons/creative.svg',
          averagePrice: 700,
          averageDuration: 60,
          popularTimes: ['afternoon', 'evening'],
          requiredSkills: ['artistic_technique', 'creativity', 'instruction']
        }
      },
      {
        name: 'Career Coaching',
        slug: 'career-coaching',
        description: 'At-home premium experience',
        icon: 'briefcase',
        color: '#E1BEE7',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Career Coaching',
          heroTitle: 'Professional Career Coaching',
          heroSubtitle: 'CV reviews, interview prep, and career mapping with experts',
          heroImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400',
          iconImage: '/icons/career.svg',
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
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    sortOrder: 5,
    isFeatured: false,
    metadata: {
      displayConfig: {
        tagline: 'Enterprise solutions for your business',
        heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400',
        iconEmoji: '🏢',
        gradient: 'from-gray-100/60 to-gray-200',
        accentColor: 'bg-gray-600'
      }
    },
    subcategories: [
      {
        name: 'Employee Wellness',
        slug: 'employee-wellness',
        description: 'Enterprise wellness solutions',
        icon: 'heart-pulse',
        color: '#78909C',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Employee Wellness Programs',
          heroTitle: 'Corporate Wellness Programs',
          heroSubtitle: 'On-site health checks, mental wellness workshops, and fitness classes',
          heroImage: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=1400',
          iconImage: '/icons/corporate-wellness.svg',
          averagePrice: 5000,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['wellness_programs', 'corporate_training', 'health_assessment']
        }
      },
      {
        name: 'Facility Maintenance',
        slug: 'facility-maintenance',
        description: 'Enterprise maintenance solutions',
        icon: 'building-maintenance',
        color: '#90A4AE',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Facility Maintenance',
          heroTitle: 'Professional Facility Maintenance',
          heroSubtitle: 'Scheduled cleaning, HVAC servicing, and general repairs for businesses',
          heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400',
          iconImage: '/icons/facility.svg',
          averagePrice: 3000,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['facility_management', 'maintenance', 'cleaning']
        }
      },
      {
        name: 'Medical Programs',
        slug: 'medical-programs',
        description: 'Enterprise health solutions',
        icon: 'medical-cross',
        color: '#B0BEC5',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Corporate Medical Programs',
          heroTitle: 'Corporate Health Programs',
          heroSubtitle: 'Periodic screening, vaccination drives, and occupational health services',
          heroImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400',
          iconImage: '/icons/corporate-medical.svg',
          averagePrice: 10000,
          averageDuration: 240,
          popularTimes: ['morning'],
          requiredSkills: ['occupational_health', 'screening', 'corporate_medical']
        }
      },
      {
        name: 'Hospitality & Events',
        slug: 'hospitality-events',
        description: 'Enterprise event solutions',
        icon: 'concierge',
        color: '#CFD8DC',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'Hospitality & Events',
          heroTitle: 'Professional Event Staffing',
          heroSubtitle: 'On-demand staffing, housekeeping, and VIP guest services',
          heroImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1400',
          iconImage: '/icons/hospitality.svg',
          averagePrice: 8000,
          averageDuration: 480,
          popularTimes: ['morning', 'afternoon', 'evening'],
          requiredSkills: ['hospitality', 'event_management', 'customer_service']
        }
      },
      {
        name: 'Managed Services',
        slug: 'managed-services',
        description: 'Enterprise management solutions',
        icon: 'settings',
        color: '#ECEFF1',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Managed Services',
          heroTitle: 'Comprehensive Managed Services',
          heroSubtitle: 'Subscription-based facility management and vendor coordination',
          heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400',
          iconImage: '/icons/managed.svg',
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
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200',
    sortOrder: 6,
    isFeatured: true,
    metadata: {
      displayConfig: {
        tagline: 'Reliable home services at your fingertips',
        heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400',
        iconEmoji: '🏠',
        gradient: 'from-blue-100/60 to-blue-200',
        accentColor: 'bg-blue-500'
      }
    },
    subcategories: [
      {
        name: 'Cleaning',
        slug: 'cleaning',
        description: 'At-home premium experience',
        icon: 'broom',
        color: '#42A5F5',
        sortOrder: 1,
        isActive: true,
        metadata: {
          displayName: 'Home Cleaning',
          heroTitle: 'Professional Home Cleaning',
          heroSubtitle: 'Routine cleaning, deep cleaning, move-in/move-out services',
          heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400',
          iconImage: '/icons/cleaning.svg',
          averagePrice: 500,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['residential_cleaning', 'time_management', 'attention_to_detail']
        }
      },
      {
        name: 'Plumbing',
        slug: 'plumbing',
        description: 'At-home premium experience',
        icon: 'wrench',
        color: '#64B5F6',
        sortOrder: 2,
        isActive: true,
        metadata: {
          displayName: 'Plumbing Services',
          heroTitle: 'Expert Plumbing Services',
          heroSubtitle: 'Leak repair, toilet repair, pipe replacement, and emergency plumbing',
          heroImage: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1400',
          iconImage: '/icons/plumbing.svg',
          averagePrice: 600,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['plumbing', 'pipe_repair', 'water_systems']
        }
      },
      {
        name: 'Electrical',
        slug: 'electrical',
        description: 'At-home premium experience',
        icon: 'zap',
        color: '#90CAF9',
        sortOrder: 3,
        isActive: true,
        metadata: {
          displayName: 'Electrical Services',
          heroTitle: 'Professional Electrical Services',
          heroSubtitle: 'Wiring, lighting installation, socket repair, and troubleshooting',
          heroImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1400',
          iconImage: '/icons/electrical.svg',
          averagePrice: 700,
          averageDuration: 90,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['electrical_work', 'wiring', 'safety_protocols']
        }
      },
      {
        name: 'HVAC & AC',
        slug: 'hvac-ac',
        description: 'At-home premium experience',
        icon: 'thermometer',
        color: '#BBDEFB',
        sortOrder: 4,
        isActive: true,
        metadata: {
          displayName: 'AC & HVAC Services',
          heroTitle: 'AC & HVAC Maintenance',
          heroSubtitle: 'Installation, servicing, filter replacement, and emergency repairs',
          heroImage: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400',
          iconImage: '/icons/ac.svg',
          averagePrice: 800,
          averageDuration: 120,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['hvac', 'ac_repair', 'refrigeration']
        }
      },
      {
        name: 'Carpentry & Renovation',
        slug: 'carpentry-renovation',
        description: 'At-home premium experience',
        icon: 'hammer',
        color: '#E3F2FD',
        sortOrder: 5,
        isActive: true,
        metadata: {
          displayName: 'Carpentry & Renovation',
          heroTitle: 'Carpentry & Home Renovation',
          heroSubtitle: 'Furniture assembly, door/window repair, and refurbishments',
          heroImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1400',
          iconImage: '/icons/carpentry.svg',
          averagePrice: 900,
          averageDuration: 180,
          popularTimes: ['morning', 'afternoon'],
          requiredSkills: ['carpentry', 'woodworking', 'renovation']
        }
      },
      {
        name: 'Smart Home & Appliances',
        slug: 'smart-home-appliances',
        description: 'At-home premium experience',
        icon: 'wifi',
        color: '#1E88E5',
        sortOrder: 6,
        isActive: true,
        metadata: {
          displayName: 'Smart Home Setup',
          heroTitle: 'Smart Home Installation',
          heroSubtitle: 'Smart device installation, TV mounting, and network setup',
          heroImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1400',
          iconImage: '/icons/smart-home.svg',
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
