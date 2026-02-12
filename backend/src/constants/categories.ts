/**
 * SERVICE CATEGORIES
 * Single source of truth for all service categories across the platform.
 * These match the 6 NILIN categories stored in the ServiceCategory MongoDB collection.
 * Used by: Provider service creation, Search/filtering, Backend validation
 */

export const SERVICE_CATEGORIES = [
  'Beauty & Wellness',
  'Fitness & Personal Health',
  'Mobile Medical Care',
  'Education & Personal Development',
  'Corporate Services',
  'Home & Maintenance'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

/**
 * Category slug to name mapping (for URL-based lookups)
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'beauty-wellness': 'Beauty & Wellness',
  'fitness-personal-health': 'Fitness & Personal Health',
  'mobile-medical-care': 'Mobile Medical Care',
  'education-personal-development': 'Education & Personal Development',
  'corporate-services': 'Corporate Services',
  'home-maintenance': 'Home & Maintenance',
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
