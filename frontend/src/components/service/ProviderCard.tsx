import React from 'react';
import { Star, BadgeCheck, User } from 'lucide-react';

interface Provider {
  id: string;
  firstName: string;
  lastName?: string;
  businessName?: string;
  profilePhoto?: string;
  tier?: 'elite' | 'premium' | 'standard';
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  startingPrice?: number;
  maxPrice?: number;
}

interface ProviderCardProps {
  provider: Provider;
  onClick: () => void;
  onViewProfile: () => void;
  currency?: string;
}

const TIER_CONFIG = {
  elite: {
    badge: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white',
    label: 'Elite',
    levelText: 'Elite Level',
    glow: 'ring-2 ring-amber-200',
  },
  premium: {
    badge: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
    label: 'Premium',
    levelText: 'Premium Level',
    glow: 'ring-2 ring-violet-200',
  },
  standard: {
    badge: 'bg-gray-600 text-white',
    label: 'Standard',
    levelText: 'Standard Level',
    glow: '',
  },
};

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onClick,
  onViewProfile,
  currency = 'AED'
}) => {
  const tier = provider.tier || 'standard';
  const tierConfig = TIER_CONFIG[tier];
  const displayName = provider.businessName || provider.firstName || 'Professional';
  const minPrice = provider.startingPrice || 500;
  const maxPrice = provider.maxPrice || minPrice + 150;
  const rating = provider.rating || 0;
  const reviewCount = provider.reviewCount || 0;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300 ease-out
        cursor-pointer group
        ${tierConfig.glow}
      `}
    >
      {/* Provider Photo */}
      <div className="relative h-52 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        {provider.profilePhoto ? (
          <img
            src={provider.profilePhoto}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        )}

        {/* Tier Badge - Overlay */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold
            shadow-lg backdrop-blur-sm
            ${tierConfig.badge}
          `}>
            {tierConfig.label}
          </span>
        </div>
      </div>

      {/* Provider Info */}
      <div className="p-5">
        {/* Name */}
        <h3 className="font-bold text-gray-900 text-lg mb-0.5 truncate group-hover:text-indigo-600 transition-colors">
          {displayName}
        </h3>

        {/* Level Text */}
        <p className="text-gray-400 text-sm mb-3">
          {tierConfig.levelText}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-amber-700 text-sm">
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </span>
          </div>
          {reviewCount > 0 && (
            <span className="text-gray-400 text-sm">
              ({reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Verified Badge */}
        {provider.isVerified && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm mb-4">
            <BadgeCheck className="w-4 h-4 fill-emerald-100" />
            <span className="font-medium">Verified by NILIN</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          {/* Price Range */}
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-gray-900">
              {currency} {minPrice}
            </span>
            <span className="text-gray-400 text-sm">–</span>
            <span className="text-lg font-semibold text-gray-600">
              {maxPrice}
            </span>
          </div>

          {/* View Profile Link */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile();
            }}
            className="
              w-full py-2.5 px-4 rounded-xl
              bg-gray-50 hover:bg-indigo-50
              text-indigo-600 font-semibold text-sm
              border border-gray-200 hover:border-indigo-200
              transition-all duration-200
            "
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
