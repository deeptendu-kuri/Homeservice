import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wrench, Zap, Paintbrush, Heart, Home, Brain, Briefcase, Dumbbell, Stethoscope, X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

export interface Category {
  id: string;
  name: string;
  icon: string;
  serviceCount?: number;
  slug: string;
  comingSoon?: boolean;
}

interface CategoryGridProps {
  categories?: Category[];
  onCategoryClick?: (category: Category) => void;
}

// Icon mapping for NILIN categories
const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-8 w-8" />,
  heart: <Heart className="h-8 w-8" />,
  dumbbell: <Dumbbell className="h-8 w-8" />,
  stethoscope: <Stethoscope className="h-8 w-8" />,
  brain: <Brain className="h-8 w-8" />,
  briefcase: <Briefcase className="h-8 w-8" />,
  home: <Home className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  paintbrush: <Paintbrush className="h-8 w-8" />,
};

// Slug-to-icon fallback for API categories that don't have an icon field matching our map
const slugIconMap: Record<string, string> = {
  'beauty-wellness': 'heart',
  'fitness-personal-health': 'dumbbell',
  'mobile-medical-care': 'stethoscope',
  'education-personal-development': 'brain',
  'corporate-services': 'briefcase',
  'home-maintenance': 'home',
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories: propCategories,
  onCategoryClick
}) => {
  const navigate = useNavigate();
  const { categories: apiCategories, isLoading } = useCategories(undefined, true);
  const [comingSoonPopup, setComingSoonPopup] = useState<string | null>(null);

  // Map API categories to the component's Category interface
  const resolvedCategories: Category[] = propCategories ?? apiCategories.map(cat => ({
    id: cat._id,
    name: cat.name,
    icon: cat.icon || slugIconMap[cat.slug] || 'home',
    serviceCount: cat.subcategoryCount,
    slug: cat.slug,
    comingSoon: cat.comingSoon || false,
  }));

  const handleCategoryClick = (category: Category) => {
    if (category.comingSoon) {
      setComingSoonPopup(category.name);
      return;
    }
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      navigate(`/search?category=${category.slug}`);
    }
  };

  const gradients = [
    'bg-gradient-nilin-primary',
    'bg-gradient-nilin-secondary',
    'bg-gradient-nilin-tertiary',
    'bg-gradient-nilin-lavender-blue',
    'bg-gradient-nilin-pink-lavender',
    'bg-gradient-nilin-secondary',
  ];

  // Loading skeleton
  if (!propCategories && isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl h-32 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        {resolvedCategories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`group relative ${category.comingSoon ? 'opacity-75' : ''}`}
          >
            <div className={`
              ${gradients[index % gradients.length]}
              rounded-2xl p-6 h-32 flex flex-col items-center justify-center
              transition-all duration-300 ease-in-out
              hover:shadow-lg hover:scale-105
              border border-gray-100
            `}>
              {/* Icon */}
              <div className="text-gray-700 mb-2 group-hover:scale-110 transition-transform">
                {iconMap[category.icon] || iconMap.home}
              </div>

              {/* Category Name */}
              <h3 className="text-sm font-semibold text-gray-900 text-center">
                {category.name}
              </h3>

              {/* Coming Soon Badge */}
              {category.comingSoon ? (
                <span className="absolute top-2 right-2 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              ) : category.serviceCount ? (
                <span className="absolute top-2 right-2 bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  {category.serviceCount}+
                </span>
              ) : null}
            </div>
          </button>
        ))}
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
    </>
  );
};

export default CategoryGrid;
