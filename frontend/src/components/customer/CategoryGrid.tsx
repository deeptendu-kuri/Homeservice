import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wrench, Zap, Paintbrush, Droplet, Home } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: string;
  serviceCount?: number;
  slug: string;
}

interface CategoryGridProps {
  categories?: Category[];
  onCategoryClick?: (category: Category) => void;
}

// Default categories if none provided
const defaultCategories: Category[] = [
  { id: '1', name: 'Cleaning', icon: 'sparkles', serviceCount: 45, slug: 'cleaning' },
  { id: '2', name: 'Plumbing', icon: 'wrench', serviceCount: 32, slug: 'plumbing' },
  { id: '3', name: 'Electrical', icon: 'zap', serviceCount: 28, slug: 'electrical' },
  { id: '4', name: 'Painting', icon: 'paintbrush', serviceCount: 18, slug: 'painting' },
  { id: '5', name: 'AC Repair', icon: 'droplet', serviceCount: 24, slug: 'ac-repair' },
  { id: '6', name: 'Home Repair', icon: 'home', serviceCount: 36, slug: 'home-repair' },
];

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-8 w-8" />,
  wrench: <Wrench className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  paintbrush: <Paintbrush className="h-8 w-8" />,
  droplet: <Droplet className="h-8 w-8" />,
  home: <Home className="h-8 w-8" />,
};

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories = defaultCategories,
  onCategoryClick
}) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
      {categories.map((category, index) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category)}
          className="group relative"
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

            {/* Service Count Badge */}
            {category.serviceCount && (
              <span className="absolute top-2 right-2 bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                {category.serviceCount}+
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
