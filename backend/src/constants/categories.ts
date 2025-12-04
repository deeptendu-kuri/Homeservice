/**
 * UNIFIED SERVICE CATEGORIES
 * Single source of truth for all service categories across the platform
 * Used by: Provider service creation, Search/filtering, Frontend displays
 *
 * NOTE: This includes both legacy categories and NILIN categories for compatibility
 */

// Legacy categories (for backward compatibility)
export const LEGACY_CATEGORIES = [
  'Cleaning',
  'Home Repair',
  'Plumbing',
  'Electrical',
  'Painting',
  'Landscaping',
  'Pet Care',
  'Tutoring',
  'Fitness',
  'Beauty',
  'Moving',
  'Assembly',
  'Technology',
  'Automotive',
  'Other'
] as const;

// NILIN Categories (new architecture)
export const NILIN_CATEGORIES = [
  'Beauty & Wellness',
  'Fitness & Personal Health',
  'Mobile Medical Care',
  'Education & Personal Development',
  'Corporate Services',
  'Home & Maintenance'
] as const;

// Combined categories for validation
export const SERVICE_CATEGORIES = [
  ...LEGACY_CATEGORIES,
  ...NILIN_CATEGORIES
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
export type NilinCategory = typeof NILIN_CATEGORIES[number];
export type LegacyCategory = typeof LEGACY_CATEGORIES[number];

/**
 * Category slug to name mapping (for URL-based lookups)
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  // NILIN categories
  'beauty-wellness': 'Beauty & Wellness',
  'fitness-personal-health': 'Fitness & Personal Health',
  'mobile-medical-care': 'Mobile Medical Care',
  'education-personal-development': 'Education & Personal Development',
  'corporate-services': 'Corporate Services',
  'home-maintenance': 'Home & Maintenance',
  // Legacy categories (slug versions)
  'cleaning': 'Cleaning',
  'home-repair': 'Home Repair',
  'plumbing': 'Plumbing',
  'electrical': 'Electrical',
  'painting': 'Painting',
  'landscaping': 'Landscaping',
  'pet-care': 'Pet Care',
  'tutoring': 'Tutoring',
  'fitness': 'Fitness',
  'beauty': 'Beauty',
  'moving': 'Moving',
  'assembly': 'Assembly',
  'technology': 'Technology',
  'automotive': 'Automotive',
  'other': 'Other'
};

/**
 * Category metadata for enhanced UX (Legacy)
 */
export const CATEGORY_METADATA: Record<string, { icon: string; description: string; subcategories: string[] }> = {
  'Cleaning': {
    icon: '🧹',
    description: 'Professional cleaning services for homes and offices',
    subcategories: ['Deep Cleaning', 'Regular Cleaning', 'Move-in/Move-out', 'Post-Construction']
  },
  'Home Repair': {
    icon: '🔧',
    description: 'General home repair and maintenance services',
    subcategories: ['General Repair', 'Assembly', 'Installation', 'Maintenance']
  },
  'Plumbing': {
    icon: '🚰',
    description: 'Plumbing repairs, installations, and maintenance',
    subcategories: ['Repair', 'Installation', 'Emergency', 'Maintenance']
  },
  'Electrical': {
    icon: '⚡',
    description: 'Electrical wiring, repairs, and installations',
    subcategories: ['Wiring', 'Lighting', 'Repair', 'Installation']
  },
  'Painting': {
    icon: '🎨',
    description: 'Interior and exterior painting services',
    subcategories: ['Interior', 'Exterior', 'Commercial', 'Touch-up']
  },
  'Landscaping': {
    icon: '🌳',
    description: 'Lawn care, garden design, and outdoor maintenance',
    subcategories: ['Lawn Care', 'Garden Design', 'Tree Service', 'Irrigation']
  },
  'Pet Care': {
    icon: '🐕',
    description: 'Pet sitting, walking, grooming, and training',
    subcategories: ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training']
  },
  'Tutoring': {
    icon: '📚',
    description: 'Educational tutoring and test preparation',
    subcategories: ['Math', 'Science', 'Languages', 'Test Prep']
  },
  'Fitness': {
    icon: '💪',
    description: 'Personal training and fitness coaching',
    subcategories: ['Personal Training', 'Group Classes', 'Yoga', 'Nutrition']
  },
  'Beauty': {
    icon: '💇',
    description: 'Beauty and personal care services',
    subcategories: ['Hair', 'Nails', 'Skincare', 'Makeup']
  },
  'Moving': {
    icon: '📦',
    description: 'Moving and relocation services',
    subcategories: ['Packing', 'Loading', 'Transportation', 'Unpacking']
  },
  'Assembly': {
    icon: '🔩',
    description: 'Furniture and equipment assembly',
    subcategories: ['Furniture', 'Electronics', 'Appliances', 'Equipment']
  },
  'Technology': {
    icon: '💻',
    description: 'Computer and tech support services',
    subcategories: ['Computer Repair', 'Setup', 'Training', 'Support']
  },
  'Automotive': {
    icon: '🚗',
    description: 'Vehicle maintenance and repair services',
    subcategories: ['Maintenance', 'Repair', 'Detailing', 'Mobile Service']
  },
  'Other': {
    icon: '📋',
    description: 'Other specialized services',
    subcategories: []
  }
};

/**
 * Get category name from slug
 */
export function getCategoryFromSlug(slug: string): string | null {
  return CATEGORY_SLUG_MAP[slug.toLowerCase()] || null;
}

/**
 * Get category display name (for case-insensitive matching)
 */
export function normalizeCategoryName(category: string): ServiceCategory | null {
  const normalized = category.trim();

  // First check if it's a slug
  const fromSlug = getCategoryFromSlug(normalized);
  if (fromSlug) {
    return fromSlug as ServiceCategory;
  }

  // Then check direct match (case-insensitive)
  const found = SERVICE_CATEGORIES.find(
    cat => cat.toLowerCase() === normalized.toLowerCase()
  );
  return found || null;
}

/**
 * Check if a category is valid (accepts both names and slugs)
 */
export function isValidCategory(category: string): boolean {
  // Check if it's a valid slug
  if (CATEGORY_SLUG_MAP[category.toLowerCase()]) {
    return true;
  }
  // Check if it's a valid category name
  return SERVICE_CATEGORIES.some(
    cat => cat.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Check if a category is a NILIN category
 */
export function isNilinCategory(category: string): boolean {
  return NILIN_CATEGORIES.some(
    cat => cat.toLowerCase() === category.toLowerCase()
  );
}
