import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface SubcategoryMetadata {
  displayName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  iconImage?: string;
  averagePrice?: number;
  averageDuration?: number;
}

interface Subcategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  metadata?: SubcategoryMetadata;
}

interface SubcategoryCardProps {
  subcategory: Subcategory;
  onClick: () => void;
}

// Map icon names to emojis as fallback
const getIconEmoji = (iconName?: string): string => {
  const iconMap: Record<string, string> = {
    'scissors': '✂️',
    'palette': '🎨',
    'hand': '💅',
    'sparkles': '✨',
    'massage': '🪷',
    'eye': '👁️',
    'person-running': '🏃',
    'users': '👥',
    'yoga': '🧘',
    'apple': '🍎',
    'medical': '🩺',
    'heart': '❤️',
    'stethoscope': '🩺',
    'syringe': '💉',
    'test-tube': '🧪',
    'shield': '🛡️',
    'video': '📹',
    'ambulance': '🚑',
    'graduation-cap': '🎓',
    'globe': '🌍',
    'laptop': '💻',
    'music-note': '🎵',
    'briefcase': '💼',
    'heart-pulse': '💓',
    'building-maintenance': '🏗️',
    'medical-cross': '➕',
    'concierge': '🛎️',
    'settings': '⚙️',
    'broom': '🧹',
    'wrench': '🔧',
    'zap': '⚡',
    'thermometer': '🌡️',
    'hammer': '🔨',
    'wifi': '📶',
  };
  return iconMap[iconName || ''] || '📦';
};

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({ subcategory, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        bg-white rounded-2xl p-5 md:p-6 text-left w-full
        border border-gray-100
        shadow-sm hover:shadow-lg
        hover:border-gray-200 hover:-translate-y-0.5
        transition-all duration-300 ease-out
        group relative overflow-hidden
      "
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300" />

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors">
            {subcategory.metadata?.iconImage ? (
              <img
                src={subcategory.metadata.iconImage}
                alt=""
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-3xl">${getIconEmoji(subcategory.icon)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-3xl">{getIconEmoji(subcategory.icon)}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1.5 group-hover:text-indigo-600 transition-colors">
          {subcategory.metadata?.displayName || subcategory.name}
        </h3>

        {/* Description + Arrow */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-2">
            {subcategory.description || 'At-home premium experience'}
          </p>
          <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </button>
  );
};

export default SubcategoryCard;
