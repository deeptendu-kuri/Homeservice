/**
 * UNIFIED SERVICE CATEGORIES
 * Single source of truth for all service categories across the platform
 * MUST match backend/src/constants/categories.ts
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
export interface CategoryMetadata {
  value: string;
  label: string;
  icon: string;
  description: string;
  subcategories: string[];
}

export const CATEGORY_LIST: CategoryMetadata[] = [
  {
    value: 'Cleaning',
    label: 'Cleaning',
    icon: '🧹',
    description: 'Professional cleaning services for homes and offices',
    subcategories: ['Deep Cleaning', 'Regular Cleaning', 'Move-in/Move-out', 'Post-Construction']
  },
  {
    value: 'Home Repair',
    label: 'Home Repair',
    icon: '🔧',
    description: 'General home repair and maintenance services',
    subcategories: ['General Repair', 'Assembly', 'Installation', 'Maintenance']
  },
  {
    value: 'Plumbing',
    label: 'Plumbing',
    icon: '🚰',
    description: 'Plumbing repairs, installations, and maintenance',
    subcategories: ['Repair', 'Installation', 'Emergency', 'Maintenance']
  },
  {
    value: 'Electrical',
    label: 'Electrical',
    icon: '⚡',
    description: 'Electrical wiring, repairs, and installations',
    subcategories: ['Wiring', 'Lighting', 'Repair', 'Installation']
  },
  {
    value: 'Painting',
    label: 'Painting',
    icon: '🎨',
    description: 'Interior and exterior painting services',
    subcategories: ['Interior', 'Exterior', 'Commercial', 'Touch-up']
  },
  {
    value: 'Landscaping',
    label: 'Landscaping',
    icon: '🌳',
    description: 'Lawn care, garden design, and outdoor maintenance',
    subcategories: ['Lawn Care', 'Garden Design', 'Tree Service', 'Irrigation']
  },
  {
    value: 'Pet Care',
    label: 'Pet Care',
    icon: '🐕',
    description: 'Pet sitting, walking, grooming, and training',
    subcategories: ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training']
  },
  {
    value: 'Tutoring',
    label: 'Tutoring',
    icon: '📚',
    description: 'Educational tutoring and test preparation',
    subcategories: ['Math', 'Science', 'Languages', 'Test Prep']
  },
  {
    value: 'Fitness',
    label: 'Fitness',
    icon: '💪',
    description: 'Personal training and fitness coaching',
    subcategories: ['Personal Training', 'Group Classes', 'Yoga', 'Nutrition']
  },
  {
    value: 'Beauty',
    label: 'Beauty',
    icon: '💇',
    description: 'Beauty and personal care services',
    subcategories: ['Hair', 'Nails', 'Skincare', 'Makeup']
  },
  {
    value: 'Moving',
    label: 'Moving',
    icon: '📦',
    description: 'Moving and relocation services',
    subcategories: ['Packing', 'Loading', 'Transportation', 'Unpacking']
  },
  {
    value: 'Assembly',
    label: 'Assembly',
    icon: '🔩',
    description: 'Furniture and equipment assembly',
    subcategories: ['Furniture', 'Electronics', 'Appliances', 'Equipment']
  },
  {
    value: 'Technology',
    label: 'Technology',
    icon: '💻',
    description: 'Computer and tech support services',
    subcategories: ['Computer Repair', 'Setup', 'Training', 'Support']
  },
  {
    value: 'Automotive',
    label: 'Automotive',
    icon: '🚗',
    description: 'Vehicle maintenance and repair services',
    subcategories: ['Maintenance', 'Repair', 'Detailing', 'Mobile Service']
  },
  {
    value: 'Other',
    label: 'Other',
    icon: '📋',
    description: 'Other specialized services',
    subcategories: []
  }
];

/**
 * Get category metadata by value
 */
export function getCategoryMetadata(category: string): CategoryMetadata | undefined {
  return CATEGORY_LIST.find(cat => cat.value.toLowerCase() === category.toLowerCase());
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const metadata = getCategoryMetadata(category);
  return metadata?.icon || '📋';
}

/**
 * Get category subcategories
 */
export function getCategorySubcategories(category: string): string[] {
  const metadata = getCategoryMetadata(category);
  return metadata?.subcategories || [];
}
