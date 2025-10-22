import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Star,
  Heart,
  Share2,
  CheckCircle,
  AlertTriangle,
  User,
  Award,
  TrendingUp
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import { searchApi } from '../services/searchApi';
import { useAuthStore } from '../stores/authStore';

interface ServiceDetail {
  _id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  duration: number;
  price: {
    amount: number;
    currency: string;
    type: string;
  };
  images: string[];
  tags: string[];
  requirements?: string[];
  includedItems?: string[];
  location: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  rating: {
    average: number;
    count: number;
    distribution?: { [key: number]: number };
  };
  provider?: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    businessInfo?: {
      businessName: string;
      description: string;
      website?: string;
      businessType?: string;
    };
    rating?: {
      average: number;
      count: number;
    } | number;
  };
  isFeatured: boolean;
  isPopular: boolean;
  createdAt: string;
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    if (!id) {
      setError('Service ID not provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchApi.getServiceById(id);

      if (response.success && response.data.service) {
        setService(response.data.service);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/services/${id}` } });
      return;
    }
    navigate(`/book/${id}`, { state: { service } });
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/services/${id}` } });
      return;
    }
    setIsFavorited(!isFavorited);
  };

  const shareService = async () => {
    const url = window.location.href;
    const text = `Check out this service: ${service?.name}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: service?.name, text, url });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavigationHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <NavigationHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-gradient-nilin-primary text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              Browse Services
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate rating distribution percentages
  const ratingDistribution = service.rating.distribution || {};
  const totalRatings = service.rating.count;
  const ratingPercentages = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    percentage: totalRatings > 0 ? ((ratingDistribution[stars] || 0) / totalRatings * 100) : 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationHeader />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Service Details */}
            <div className="lg:col-span-2">
              {/* Service Hero Image */}
              <div className={`relative h-96 bg-gradient-to-br from-nilin-pink to-nilin-cream rounded-2xl overflow-hidden mb-8`}>
                {service.images[0] ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-8xl opacity-40">
                    🏠
                  </div>
                )}

                {/* Badges */}
                {service.isFeatured && (
                  <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <TrendingUp className="h-4 w-4 text-gray-900" />
                    <span className="text-sm font-semibold">Featured</span>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="bg-white rounded-xl p-6 mb-6 border">
                {/* Header */}
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full mb-3">
                    {service.category}
                  </span>

                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex-1">{service.name}</h1>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleFavorite}
                        className={`p-2 rounded-full transition-colors ${
                          isFavorited ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={shareService}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.round(service.rating.average) ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">{service.rating.average.toFixed(1)}</span>
                      <span>({service.rating.count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location.address.city}, {service.location.address.state}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this service</h3>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>

                {/* What's Included */}
                {service.includedItems && service.includedItems.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">What's included</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {service.includedItems.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {service.requirements && service.requirements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {service.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                          <span className="text-gray-400">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {service.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-xl p-6 border">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

                {/* Reviews Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl mb-6">
                  <div className="text-center md:border-r border-gray-200">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{service.rating.average.toFixed(1)}</div>
                    <div className="flex justify-center text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < Math.round(service.rating.average) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">{service.rating.count} reviews</div>
                  </div>

                  <div className="space-y-2">
                    {ratingPercentages.map(({ stars, percentage }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-12">{stars} stars</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List Placeholder */}
                <div className="text-center py-8 text-gray-500">
                  <p>Reviews will be displayed here</p>
                  <p className="text-sm mt-2">API integration pending</p>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card & Provider Info */}
            <div className="lg:col-span-1">
              {/* Booking Card */}
              <div className="bg-white rounded-xl p-6 border sticky top-24 mb-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ${service.price.amount}
                  </div>
                  <div className="text-gray-600 text-sm">per {service.price.type}</div>
                </div>

                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-nilin-primary text-gray-900 py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-shadow mb-3"
                >
                  Book Now
                </button>

                <div className="text-center text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Instant booking available</span>
                  </div>
                </div>
              </div>

              {/* Provider Info */}
              {service.provider && (
                <div className="bg-white rounded-xl p-6 border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the provider</h3>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-nilin-pink to-nilin-lavender rounded-full flex items-center justify-center">
                      {service.provider.avatar ? (
                        <img
                          src={service.provider.avatar}
                          alt={service.provider.businessInfo?.businessName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {service.provider.businessInfo?.businessName ||
                         `${service.provider.firstName} ${service.provider.lastName}`}
                      </h4>
                      {service.provider.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span>
                            {typeof service.provider.rating === 'number'
                              ? service.provider.rating.toFixed(1)
                              : `${service.provider.rating.average.toFixed(1)} (${service.provider.rating.count} reviews)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {service.provider.businessInfo?.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                      {service.provider.businessInfo.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {service.provider.businessInfo?.businessType && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>{service.provider.businessInfo.businessType}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{service.location.address.city}, {service.location.address.state}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
