import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Category card data matching the design with consistent NILIN pastel colors
const CATEGORY_CARDS = [
  {
    id: 'get-doctor',
    slug: 'mobile-medical-care',
    icon: '👨‍⚕️',
    title: 'Get Doctor',
    description: 'Nurses, Doctors, Lab Tests',
    bgGradient: 'from-nilin-blue/60 to-nilin-blue',
    iconBg: 'bg-gradient-to-br from-nilin-blue to-blue-200',
    accentColor: 'bg-nilin-primary',
    hoverBorder: 'hover:border-nilin-primary/50',
  },
  {
    id: 'beauty-at-home',
    slug: 'beauty-wellness',
    icon: '💅',
    title: 'Beauty at Home',
    description: 'Hair, Nails, Makeup, Massage',
    bgGradient: 'from-nilin-pink/60 to-nilin-pink',
    iconBg: 'bg-gradient-to-br from-nilin-pink to-pink-200',
    accentColor: 'bg-nilin-accent',
    hoverBorder: 'hover:border-nilin-accent/50',
  },
  {
    id: 'fitness-trainer',
    slug: 'fitness-personal-health',
    icon: '💪',
    title: 'Fitness Trainer',
    description: 'Personal coaching at home.',
    bgGradient: 'from-nilin-cream/60 to-nilin-cream',
    iconBg: 'bg-gradient-to-br from-nilin-cream to-amber-200',
    accentColor: 'bg-nilin-secondary',
    hoverBorder: 'hover:border-nilin-secondary/50',
  },
  {
    id: 'for-businesses',
    slug: 'corporate-services',
    icon: '🏢',
    title: 'For Businesses',
    description: 'Corporate care & on-site services',
    bgGradient: 'from-nilin-lavender/60 to-nilin-lavender',
    iconBg: 'bg-gradient-to-br from-nilin-lavender to-purple-200',
    accentColor: 'bg-nilin-primary',
    hoverBorder: 'hover:border-nilin-primary/50',
  },
  {
    id: 'browse-all',
    slug: 'all',
    icon: '🔍',
    title: 'Browse All',
    description: 'View all services',
    bgGradient: 'from-white to-gray-50',
    iconBg: 'bg-gradient-to-br from-nilin-primary/30 to-nilin-secondary/30',
    accentColor: 'bg-gradient-to-r from-nilin-primary to-nilin-secondary',
    hoverBorder: 'hover:border-nilin-primary/40',
    isViewAll: true,
  },
];

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
  isViewAll
}) => (
  <button
    onClick={onClick}
    className={`group relative w-full text-left p-4 sm:p-5 rounded-2xl border border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${bgGradient} ${hoverBorder} overflow-hidden`}
  >
    {/* Decorative circle */}
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

    {/* Icon */}
    <div className="relative flex items-start justify-between mb-3">
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${iconBg} flex items-center justify-center text-2xl sm:text-3xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
        {icon}
      </div>
      <div className={`w-8 h-8 rounded-full bg-white/60 flex items-center justify-center group-hover:bg-white transition-colors`}>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-nilin-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>

    {/* Title */}
    <h3 className="relative font-bold text-gray-900 text-sm sm:text-base mb-1 group-hover:text-nilin-dark transition-colors">
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

const CategoryCards: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string, isViewAll?: boolean) => {
    if (isViewAll) {
      navigate('/search');
    } else {
      navigate(`/category/${slug}`);
    }
  };

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

        {/* Category Grid - 5 cards: 2 cols mobile, 5 cols desktop */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {CATEGORY_CARDS.map((category) => (
            <CategoryCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              bgGradient={category.bgGradient}
              iconBg={category.iconBg}
              accentColor={category.accentColor}
              hoverBorder={category.hoverBorder}
              isViewAll={category.isViewAll}
              onClick={() => handleCategoryClick(category.slug, category.isViewAll)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
