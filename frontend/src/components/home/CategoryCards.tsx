import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';

// Static "Browse All" card - kept in frontend as per plan
const BROWSE_ALL_CARD = {
  id: 'browse-all',
  slug: 'all',
  icon: '🔍',
  title: 'Browse All',
  description: 'View all services',
  bgGradient: 'from-white to-gray-50',
  iconBg: 'bg-gradient-to-br from-indigo-100 to-purple-100',
  accentColor: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  hoverBorder: 'hover:border-indigo-500/40',
  isViewAll: true,
};

// Gradient and color mappings for categories
const CATEGORY_STYLES: Record<string, { bgGradient: string; iconBg: string; accentColor: string; hoverBorder: string }> = {
  'mobile-medical-care': {
    bgGradient: 'from-nilin-blue/60 to-nilin-blue',
    iconBg: 'bg-gradient-to-br from-nilin-blue to-blue-200',
    accentColor: 'bg-nilin-primary',
    hoverBorder: 'hover:border-nilin-primary/50',
  },
  'beauty-wellness': {
    bgGradient: 'from-nilin-pink/60 to-nilin-pink',
    iconBg: 'bg-gradient-to-br from-nilin-pink to-pink-200',
    accentColor: 'bg-nilin-accent',
    hoverBorder: 'hover:border-nilin-accent/50',
  },
  'fitness-personal-health': {
    bgGradient: 'from-nilin-cream/60 to-nilin-cream',
    iconBg: 'bg-gradient-to-br from-nilin-cream to-amber-200',
    accentColor: 'bg-nilin-secondary',
    hoverBorder: 'hover:border-nilin-secondary/50',
  },
  'corporate-services': {
    bgGradient: 'from-nilin-lavender/60 to-nilin-lavender',
    iconBg: 'bg-gradient-to-br from-nilin-lavender to-purple-200',
    accentColor: 'bg-nilin-primary',
    hoverBorder: 'hover:border-nilin-primary/50',
  },
  'education-personal-development': {
    bgGradient: 'from-purple-100/60 to-purple-100',
    iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
    accentColor: 'bg-purple-500',
    hoverBorder: 'hover:border-purple-500/50',
  },
  'home-maintenance': {
    bgGradient: 'from-blue-100/60 to-blue-100',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
    accentColor: 'bg-blue-500',
    hoverBorder: 'hover:border-blue-500/50',
  },
};

const DEFAULT_STYLE = {
  bgGradient: 'from-gray-100/60 to-gray-100',
  iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
  accentColor: 'bg-gray-500',
  hoverBorder: 'hover:border-gray-500/50',
};

// Category display titles mapping
const CATEGORY_DISPLAY_TITLES: Record<string, string> = {
  'mobile-medical-care': 'Get Doctor',
  'beauty-wellness': 'Beauty at Home',
  'fitness-personal-health': 'Fitness Trainer',
  'corporate-services': 'For Businesses',
  'education-personal-development': 'Education',
  'home-maintenance': 'Home Services',
};

interface CategoryCardProps {
  icon: string;
  title: string;
  description: string;
  bgGradient: string;
  iconBg: string;
  accentColor: string;
  hoverBorder: string;
  onClick: () => void;
  isViewAll?: boolean;
  comingSoon?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  description,
  bgGradient,
  iconBg,
  accentColor,
  hoverBorder,
  onClick,
  comingSoon,
}) => (
  <button
    onClick={onClick}
    className={`group relative w-full text-left p-4 sm:p-5 rounded-2xl border border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${bgGradient} ${hoverBorder} overflow-hidden ${comingSoon ? 'opacity-80' : ''}`}
  >
    {/* Coming Soon Badge */}
    {comingSoon && (
      <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-gray-900/80 text-white text-[10px] font-semibold rounded-full">
        Coming Soon
      </div>
    )}

    {/* Decorative circle */}
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

    {/* Icon */}
    <div className="relative flex items-start justify-between mb-3">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${iconBg} flex items-center justify-center text-2xl sm:text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
        {icon}
      </div>
      <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center group-hover:bg-white transition-colors">
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>

    {/* Title */}
    <h3 className="relative font-bold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-gray-800 transition-colors">
      {title}
    </h3>

    {/* Description */}
    <p className="relative text-xs sm:text-sm text-gray-600 line-clamp-2">
      {description}
    </p>

    {/* Bottom accent line */}
    <div className={`absolute bottom-0 left-0 right-0 h-1 ${accentColor} scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300`} />
  </button>
);

// Loading skeleton
const CategoryCardSkeleton: React.FC = () => (
  <div className="w-full p-4 sm:p-5 rounded-2xl bg-gray-100 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gray-200" />
      <div className="w-8 h-8 rounded-full bg-gray-200" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-full" />
  </div>
);

const CategoryCards: React.FC = () => {
  const navigate = useNavigate();
  const { categories, isLoading } = useCategories(undefined, true);
  const [comingSoonPopup, setComingSoonPopup] = useState<string | null>(null);

  const handleCategoryClick = (slug: string, isViewAll?: boolean, comingSoon?: boolean) => {
    if (comingSoon) {
      const cat = categories.find((c: any) => c.slug === slug);
      setComingSoonPopup(cat?.name || slug);
      return;
    }
    if (isViewAll) {
      navigate('/search');
    } else {
      navigate(`/category/${slug}`);
    }
  };

  // Get card config from category data
  const getCardConfig = (category: any) => {
    const styles = CATEGORY_STYLES[category.slug] || DEFAULT_STYLE;
    const displayConfig = category.metadata?.displayConfig || {};

    return {
      id: category._id || category.slug,
      slug: category.slug,
      icon: displayConfig.iconEmoji || '📦',
      title: CATEGORY_DISPLAY_TITLES[category.slug] || category.name,
      description: category.description?.slice(0, 40) || 'Professional services',
      comingSoon: category.comingSoon || false,
      ...styles,
    };
  };

  // Show all 6 categories (not just featured)
  const allCategories = categories.slice(0, 6);

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What do you need today?
          </h2>
          <p className="text-sm text-gray-500">Choose from our wide range of professional services</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <CategoryCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              {/* Dynamic category cards from API */}
              {allCategories.map((category: any) => {
                const config = getCardConfig(category);
                return (
                  <CategoryCard
                    key={config.id}
                    icon={config.icon}
                    title={config.title}
                    description={config.description}
                    bgGradient={config.bgGradient}
                    iconBg={config.iconBg}
                    accentColor={config.accentColor}
                    hoverBorder={config.hoverBorder}
                    comingSoon={config.comingSoon}
                    onClick={() => handleCategoryClick(config.slug, false, config.comingSoon)}
                  />
                );
              })}

              {/* Static "Browse All" card */}
              <CategoryCard
                icon={BROWSE_ALL_CARD.icon}
                title={BROWSE_ALL_CARD.title}
                description={BROWSE_ALL_CARD.description}
                bgGradient={BROWSE_ALL_CARD.bgGradient}
                iconBg={BROWSE_ALL_CARD.iconBg}
                accentColor={BROWSE_ALL_CARD.accentColor}
                hoverBorder={BROWSE_ALL_CARD.hoverBorder}
                isViewAll={BROWSE_ALL_CARD.isViewAll}
                onClick={() => handleCategoryClick(BROWSE_ALL_CARD.slug, BROWSE_ALL_CARD.isViewAll)}
              />
            </>
          )}
        </div>
      </div>

      {/* Coming Soon Popup */}
      {comingSoonPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setComingSoonPopup(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-nilin-lavender to-nilin-pink flex items-center justify-center text-2xl">
                🚀
              </div>
              <button onClick={() => setComingSoonPopup(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon!</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{comingSoonPopup}</strong> services are coming to Dubai soon. We're working hard to bring you the best professionals in this category.
            </p>
            <button
              onClick={() => setComingSoonPopup(null)}
              className="w-full py-2.5 bg-gradient-to-r from-nilin-primary to-nilin-secondary text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryCards;
