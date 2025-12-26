import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  MessageCircle,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Award,
  Briefcase,
  Users,
  ThumbsUp,
  User
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { useProvider } from '../hooks/useProvider';
import type { Provider, ProviderService, ProviderReview, PortfolioItem, Certification } from '../types/provider';

// Service Card Component - Updated for real data
const ServiceCard: React.FC<{
  service: ProviderService;
  providerId: string;
  onBook: () => void;
  onViewDetails: () => void;
}> = ({ service, onBook, onViewDetails }) => (
  <div
    onClick={onViewDetails}
    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
  >
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
      {service.images && service.images.length > 0 ? (
        <img
          src={service.images[0]}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Briefcase className="w-12 h-12 text-gray-300" />
        </div>
      )}
      {service.isPopular && (
        <span className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full shadow-sm">
          Popular
        </span>
      )}
      {service.isFeatured && !service.isPopular && (
        <span className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-full shadow-sm">
          Featured
        </span>
      )}
      {/* View details hint on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-sm">
          View Details
        </span>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
        {service.name}
      </h4>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
        {service.shortDescription || service.description}
      </p>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-gray-900">
            AED {service.price.amount}
          </span>
          <span className="text-sm text-gray-400 ml-2">· {service.duration} mins</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onBook();
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
        >
          Book
        </button>
      </div>
    </div>
  </div>
);

// Review Card Component - Updated for real data
const ReviewCard: React.FC<{
  review: ProviderReview;
}> = ({ review }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="w-6 h-6 text-gray-400" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900">
            {review.isVerified ? 'Verified Customer' : 'Customer'}
          </h4>
          <span className="text-sm text-gray-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
            />
          ))}
          {review.title && (
            <span className="text-sm text-gray-500 ml-2">{review.title}</span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{review.comment}</p>
        {review.response && (
          <div className="mt-3 pl-4 border-l-2 border-gray-200">
            <p className="text-sm text-gray-500 italic">
              <strong>Response:</strong> {review.response.text}
            </p>
          </div>
        )}
        <button className="flex items-center gap-1 mt-3 text-sm text-gray-400 hover:text-gray-600">
          <ThumbsUp className="w-4 h-4" />
          <span>Helpful</span>
        </button>
      </div>
    </div>
  </div>
);

// Certification Card Component
const CertificationCard: React.FC<{
  certification: Certification;
}> = ({ certification }) => (
  <div className="flex items-center gap-3">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      certification.isVerified ? 'bg-green-100' : 'bg-gray-100'
    }`}>
      <Award className={`w-4 h-4 ${certification.isVerified ? 'text-green-600' : 'text-gray-500'}`} />
    </div>
    <div>
      <span className="text-sm text-gray-700">{certification.name}</span>
      <p className="text-xs text-gray-400">{certification.issuingOrganization}</p>
    </div>
  </div>
);

// Portfolio Gallery Item
const PortfolioGalleryItem: React.FC<{
  item: PortfolioItem;
}> = ({ item }) => (
  <div className="flex-shrink-0 w-48 h-48 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
    {item.images && item.images.length > 0 ? (
      <img
        src={item.images[0].url}
        alt={item.title}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
    )}
  </div>
);

// Loading Skeleton
const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <NavigationHeader />
    <div className="animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="h-48 md:h-72 bg-gray-200" />

      {/* Provider Info Card Skeleton */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gray-200 -mt-20 md:-mt-24 mx-auto md:mx-0" />
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4 mx-auto md:mx-0" />
              <div className="h-4 bg-gray-200 rounded w-64 mb-4 mx-auto md:mx-0" />
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl" />
            <div className="h-48 bg-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 rounded-2xl" />
            <div className="h-32 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error State
const ErrorState: React.FC<{ message: string; onBack: () => void }> = ({ message, onBack }) => (
  <div className="min-h-screen bg-gray-50">
    <NavigationHeader />
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider Not Found</h1>
      <p className="text-gray-600 mb-8">{message}</p>
      <button
        onClick={onBack}
        className="px-6 py-3 bg-nilin-primary text-white rounded-xl font-medium hover:bg-nilin-primary-dark transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Helper function to calculate experience
const calculateExperience = (establishedDate?: string, memberSince?: string): string => {
  const date = establishedDate || memberSince;
  if (!date) return 'New';

  const start = new Date(date);
  const now = new Date();
  const years = Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (years < 1) return 'New';
  if (years === 1) return '1 year';
  return `${years} years`;
};

// Helper function to format response time
const formatResponseTime = (minutes?: number): string => {
  if (!minutes) return 'Usually quick';
  if (minutes < 60) return `< ${minutes} mins`;
  if (minutes < 1440) return `< ${Math.round(minutes / 60)} hours`;
  return `< ${Math.round(minutes / 1440)} days`;
};

const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAllServices, setShowAllServices] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Fetch provider data from API
  const { provider, isLoading, error } = useProvider(id);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error || !provider) {
    return (
      <ErrorState
        message={error || "The provider you're looking for doesn't exist or has been removed."}
        onBack={() => navigate(-1)}
      />
    );
  }

  // Prepare display name
  const displayName = provider.businessName || `${provider.firstName} ${provider.lastName}`;

  // Filter services
  const filteredServices = selectedFilter === 'all'
    ? provider.services
    : selectedFilter === 'popular'
    ? provider.services.filter(s => s.isPopular)
    : provider.services.filter(s => s.subcategory?.toLowerCase() === selectedFilter.toLowerCase());

  const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 4);

  // Get unique subcategories for filter
  const subcategories = [...new Set(provider.services.map(s => s.subcategory).filter(Boolean))];

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  // Get all portfolio images
  const galleryImages = provider.portfolio?.featured?.flatMap(item => item.images) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationHeader />

      {/* Cover Image */}
      <div className="relative h-48 md:h-72 overflow-hidden bg-gray-200">
        {provider.coverPhoto ? (
          <img
            src={provider.coverPhoto}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-nilin-primary to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-900 hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Back</span>
        </button>
        {/* Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-600 hover:bg-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Provider Info Card */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 w-full">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-24 mx-auto md:mx-0">
              {provider.profilePhoto ? (
                <img
                  src={provider.profilePhoto}
                  alt={displayName}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {provider.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h1>
                {provider.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mx-auto md:mx-0">
                    <Shield className="w-4 h-4" />
                    Verified Pro
                  </span>
                )}
              </div>
              <p className="text-gray-500 mb-4">{provider.tagline}</p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-900">
                    {provider.reviewsData?.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-gray-400">
                    ({provider.reviewsData?.totalReviews || 0} reviews)
                  </span>
                </div>
                {provider.location && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {provider.location.city}, {provider.location.state}
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  {formatResponseTime(provider.stats?.responseTime)}
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Briefcase className="w-4 h-4" />
                  {calculateExperience(provider.establishedDate, provider.memberSince)}
                </div>
              </div>
            </div>

            {/* CTA Buttons - Desktop */}
            <div className="hidden md:flex flex-col gap-3">
              <button
                onClick={() => {
                  if (provider.services.length > 0) {
                    navigate(`/book/${provider.services[0]._id}`);
                  }
                }}
                disabled={provider.services.length === 0}
                className="px-8 py-3 bg-nilin-primary text-white font-semibold rounded-xl hover:bg-nilin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Now
              </button>
              <button className="px-8 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Message
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.stats?.completionRate || 0}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.stats?.repeatCustomerRate || 0}%
              </div>
              <div className="text-sm text-gray-500">Repeat Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {provider.stats?.totalBookings || 0}+
              </div>
              <div className="text-sm text-gray-500">Total Bookings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Services & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Services Offered ({provider.services.length})
                </h2>
                {subcategories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-nilin-primary/20"
                    >
                      <option value="all">All Services</option>
                      <option value="popular">Popular</option>
                      {subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {displayedServices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedServices.map(service => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      providerId={provider.id}
                      onBook={() => navigate(`/book/${service._id}`)}
                      onViewDetails={() => navigate(`/services/${service._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No services available</p>
                </div>
              )}

              {filteredServices.length > 4 && (
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="w-full mt-4 py-3 text-nilin-primary font-medium hover:bg-nilin-primary/5 rounded-xl transition-colors"
                >
                  {showAllServices ? 'Show Less' : `View All ${filteredServices.length} Services`}
                </button>
              )}
            </section>

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollGallery('left')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => scrollGallery('right')}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div
                  ref={galleryRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-48 h-48 rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={img.url} alt={img.caption || `Work ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews ({provider.reviewsData?.totalReviews || 0})
                </h2>
                {provider.reviewsData && provider.reviewsData.totalReviews > 0 && (
                  <button className="text-nilin-primary font-medium hover:underline">
                    See all
                  </button>
                )}
              </div>

              {provider.reviewsData?.recentReviews && provider.reviewsData.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {provider.reviewsData.recentReviews.map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to review this provider!</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {provider.bio || provider.description || 'No description available.'}
              </p>

              {/* Business Type */}
              {provider.businessType && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Business Type</h4>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full capitalize">
                    {provider.businessType.replace('_', ' ')}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              {provider.contact && (provider.contact.website) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Contact</h4>
                  {provider.contact.website && (
                    <a
                      href={provider.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-nilin-primary hover:underline"
                    >
                      {provider.contact.website}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Specializations */}
            {provider.specializations && provider.specializations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.specializations.map(spec => (
                    <span key={spec} className="px-3 py-1 bg-nilin-primary/10 text-nilin-primary text-sm font-medium rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {provider.portfolio?.certifications && provider.portfolio.certifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-3">
                  {provider.portfolio.certifications.map((cert, idx) => (
                    <CertificationCard key={idx} certification={cert} />
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {provider.portfolio?.awards && provider.portfolio.awards.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Awards</h3>
                <div className="space-y-3">
                  {provider.portfolio.awards.map((award, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-700">{award.title}</span>
                        <p className="text-xs text-gray-400">{award.organization} · {award.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Badges */}
            {provider.verificationBadges && provider.verificationBadges.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Verifications</h3>
                <div className="space-y-3">
                  {provider.verificationBadges.map((badge, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="text-sm text-gray-700 capitalize">
                          {badge.type.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-gray-400">
                          Verified {new Date(badge.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
              {provider.availability?.instantBooking && (
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Instant booking available</span>
                </div>
              )}
              <p className="text-sm text-gray-500 mb-4">
                Book up to {provider.availability?.advanceBookingDays || 30} days in advance
              </p>
              <button
                onClick={() => {
                  if (provider.services.length > 0) {
                    navigate(`/book/${provider.services[0]._id}`);
                  }
                }}
                disabled={provider.services.length === 0}
                className="w-full py-3 bg-nilin-primary text-white font-semibold rounded-xl hover:bg-nilin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check Full Availability
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-50">
        <div className="flex items-center gap-3">
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <MessageCircle className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => {
              if (provider.services.length > 0) {
                navigate(`/book/${provider.services[0]._id}`);
              }
            }}
            disabled={provider.services.length === 0}
            className="flex-1 py-3 bg-nilin-primary text-white font-semibold rounded-xl hover:bg-nilin-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="pb-24 md:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default ProviderDetailPage;
