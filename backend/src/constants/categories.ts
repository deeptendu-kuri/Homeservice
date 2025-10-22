/**
 * UNIFIED SERVICE CATEGORIES
 * Single source of truth for all service categories across the platform
 * Used by: Provider service creation, Search/filtering, Frontend displays
 */

export const SERVICE_CATEGORIES = [
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

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

/**
 * Category metadata for enhanced UX
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
 * Get category display name (for case-insensitive matching)
 */
export function normalizeCategoryName(category: string): ServiceCategory | null {
  const normalized = category.trim();
  const found = SERVICE_CATEGORIES.find(
    cat => cat.toLowerCase() === normalized.toLowerCase()
  );
  return found || null;
}

/**
 * Check if a category is valid
 */
export function isValidCategory(category: string): boolean {
  return SERVICE_CATEGORIES.includes(category as ServiceCategory);
}
