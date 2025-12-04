import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  User
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { useCategory } from '../hooks/useCategories';
import { useProvidersBySubcategory } from '../hooks/useProvider';
import type { ProviderCard as ProviderCardType } from '../types/provider';

// Provider Card Component - Updated for real data
const ProviderCard: React.FC<{
  provider: ProviderCardType;
  categoryColor?: string;
}> = ({ provider, categoryColor }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/provider/${provider.id}`)}
      className="flex-shrink-0 w-44 md:w-56 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Provider Image */}
      <div className="relative h-32 md:h-40 overflow-hidden bg-gray-100">
        {provider.profilePhoto ? (
          <img
            src={provider.profilePhoto}
            alt={provider.businessName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-300" />
          </div>
        )}
        {provider.isVerified && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-medium text-green-700">Verified</span>
          </div>
        )}
      </div>
      {/* Provider Info */}
      <div className="p-3 md:p-4">
        <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
          {provider.businessName || `${provider.firstName} ${provider.lastName}`}
        </h4>
        {provider.tagline && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{provider.tagline}</p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900">
            {provider.rating?.toFixed(1) || '0.0'}
          </span>
          <span className="text-xs text-gray-500">({provider.reviewCount || 0})</span>
        </div>
        {provider.location && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{provider.location.city}, {provider.location.state}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">{provider.servicesCount} services</span>
          {provider.startingPrice && (
            <span
              className="font-bold text-sm"
              style={{ color: categoryColor || '#6366f1' }}
            >
              From ₹{provider.startingPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Empty State Provider Card (placeholder)
const EmptyProviderCard: React.FC<{ categoryColor?: string }> = ({ categoryColor }) => (
  <div className="flex-shrink-0 w-44 md:w-56 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center" style={{ minHeight: '280px' }}>
    <User className="w-12 h-12 text-gray-300 mb-3" />
    <p className="text-sm text-gray-500">No providers yet</p>
    <p className="text-xs text-gray-400 mt-1">Be the first to join!</p>
  </div>
);

// Subcategory Section with Real Data
const SubcategorySection: React.FC<{
  subcategory: { name: string; slug: string; description: string };
  categoryColor?: string;
  categorySlug: string;
}> = ({ subcategory, categoryColor, categorySlug }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch real providers for this subcategory
  const { providers, isLoading } = useProvidersBySubcategory(
    categorySlug,
    subcategory.slug,
    { limit: 10 }
  );

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8 md:mb-12">
      {/* Subcategory Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: categoryColor || '#6366f1' }}
          />
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{subcategory.name}</h3>
            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{subcategory.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigate(`/search?category=${categorySlug}&subcategory=${subcategory.slug}`)}
            className="text-sm font-medium hover:underline"
            style={{ color: categoryColor || '#6366f1' }}
          >
            View all
          </button>
        </div>
      </div>

      {/* Providers Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          // Loading skeleton
          [...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 md:w-56 h-64 bg-gray-200 rounded-2xl animate-pulse snap-start" />
          ))
        ) : providers && providers.length > 0 ? (
          // Real provider cards
          <>
            {providers.map((provider) => (
              <div key={provider.id} className="snap-start">
                <ProviderCard provider={provider} categoryColor={categoryColor} />
              </div>
            ))}
            {/* View More Card */}
            <button
              onClick={() => navigate(`/search?category=${categorySlug}&subcategory=${subcategory.slug}`)}
              className="flex-shrink-0 w-44 md:w-56 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all snap-start"
              style={{ minHeight: '280px' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: categoryColor ? `${categoryColor}20` : '#f3f4f6' }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: categoryColor || '#6366f1' }} />
              </div>
              <span className="font-medium text-gray-600">View all</span>
              <span className="text-sm text-gray-400 mt-1">{subcategory.name}</span>
            </button>
          </>
        ) : (
          // Empty state
          <>
            <EmptyProviderCard categoryColor={categoryColor} />
            <button
              onClick={() => navigate(`/search?category=${categorySlug}&subcategory=${subcategory.slug}`)}
              className="flex-shrink-0 w-44 md:w-56 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all snap-start"
              style={{ minHeight: '280px' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: categoryColor ? `${categoryColor}20` : '#f3f4f6' }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: categoryColor || '#6366f1' }} />
              </div>
              <span className="font-medium text-gray-600">Browse services</span>
              <span className="text-sm text-gray-400 mt-1">in {subcategory.name}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { category, isLoading, error } = useCategory(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-3xl mb-8" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="w-56 h-64 bg-gray-200 rounded-2xl flex-shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationHeader />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-nilin-primary text-white rounded-xl font-medium hover:bg-nilin-primary-dark transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationHeader />

      {/* Category Hero */}
      <section
        className="relative py-12 md:py-20"
        style={{ backgroundColor: category.color ? `${category.color}10` : '#f9fafb' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              {/* Category Icon/Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ backgroundColor: category.color ? `${category.color}20` : '#f3f4f6' }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color || '#6366f1' }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: category.color || '#6366f1' }}
                >
                  {category.subcategories?.length || 0} Subcategories
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                {category.name}
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl">
                {category.description || `Explore our curated selection of ${category.name.toLowerCase()} services and find the perfect professional for your needs.`}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">{category.serviceCount || 0}</strong> Services Available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">Quick</strong> Response
                  </span>
                </div>
              </div>
            </div>

            {/* Category Image */}
            {category.imageUrl && (
              <div className="w-full md:w-80 h-48 md:h-64 rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subcategories with Providers */}
      <section className="py-8 md:py-16 flex-1">
        <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 px-4 md:px-0">
            Browse by Service Type
          </h2>

          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories.map((subcategory) => (
              <SubcategorySection
                key={subcategory.slug}
                subcategory={subcategory}
                categoryColor={category.color}
                categorySlug={category.slug}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No subcategories available</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-12 md:py-16"
        style={{ backgroundColor: category.color || '#6366f1' }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-white/80 mb-8">
            Browse all services or let us help you find the perfect professional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse All Services
            </button>
            <button
              onClick={() => navigate('/search?q=' + category.name)}
              className="px-8 py-3 bg-white/20 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              Search in {category.name}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
