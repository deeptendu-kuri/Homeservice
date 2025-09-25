import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  ChevronLeft,
  Heart,
  Share2,
  MessageCircle,
  Shield,
  Award,
  CheckCircle,
  Image as ImageIcon,
  User,
  AlertTriangle
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
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
  addOns?: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
  location: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    serviceArea: {
      type: string;
      value: number;
      maxDistance: number;
    };
  };
  availability: {
    schedule: {
      [key: string]: {
        isAvailable: boolean;
        timeSlots: string[];
      };
    };
    instantBooking: boolean;
    advanceBookingDays: number;
  };
  rating: {
    average: number;
    count: number;
    distribution: { [key: number]: number };
  };
  provider: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    businessInfo: {
      businessName: string;
      description: string;
      website?: string;
      businessType: string;
    };
    rating: {
      average: number;
      count: number;
    };
  };
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
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
      
      const response = await fetch(`${API_BASE_URL}/search/service/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service not found');
        }
        throw new Error('Failed to fetch service details');
      }

      const data = await response.json();
      setService(data.data.service);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { returnTo: `/services/${id}` } 
      });
      return;
    }
    
    // Navigate to booking page with service details
    navigate(`/book/${id}`, { state: { service } });
  };

  const handleContactProvider = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { returnTo: `/services/${id}` } 
      });
      return;
    }
    
    // TODO: Open messaging/contact flow
    console.log('Contact provider:', service?.provider.businessInfo.businessName);
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { returnTo: `/services/${id}` } 
      });
      return;
    }
    
    setIsFavorited(!isFavorited);
    // TODO: API call to add/remove from favorites
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <PageLayout showBreadcrumb={true}>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        showBreadcrumb={true}
        title="Service Not Found"
      >
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Search
          </button>
        </div>
      </PageLayout>
    );
  }

  if (!service) {
    return null;
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search Services', href: '/search' },
    { label: service.name, current: true }
  ];

  return (
    <PageLayout 
      showBreadcrumb={true} 
      breadcrumbItems={breadcrumbItems}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {service.images.length > 0 ? (
                <img
                  src={service.images[selectedImage]}
                  alt={service.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-100">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                  <span className="ml-4 text-gray-500">No image available</span>
                </div>
              )}
            </div>
            
            {service.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {service.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${service.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {service.category}
                  </span>
                  {service.subcategory && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {service.subcategory}
                    </span>
                  )}
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span>{service.rating.average.toFixed(1)} ({service.rating.count} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${
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

            <div className="flex items-center space-x-6 mb-6 text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{service.duration} minutes</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                <span>${service.price.amount} {service.price.type}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{service.location.address.city}, {service.location.address.state}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{service.description}</p>
            </div>

            {service.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.includedItems && service.includedItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {service.includedItems.map((item, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service.requirements && service.requirements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {service.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <Shield className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Booking Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${service.price.amount}
              </div>
              <div className="text-gray-600 text-sm">per {service.price.type}</div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Book Now
              </button>
              <button
                onClick={handleContactProvider}
                className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-md font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Contact Provider
              </button>
            </div>

            <div className="border-t pt-4 text-center text-sm text-gray-600">
              {service.availability.instantBooking ? (
                <div className="flex items-center justify-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Instant booking available
                </div>
              ) : (
                <div>Response within 24 hours</div>
              )}
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                {service.provider.avatar ? (
                  <img
                    src={service.provider.avatar}
                    alt={service.provider.businessInfo.businessName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {service.provider.businessInfo.businessName}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                  <span>{service.provider.rating.average.toFixed(1)} ({service.provider.rating.count} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 line-clamp-3">
              {service.provider.businessInfo.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>
                  {service.location.address.city}, {service.location.address.state}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                <span>{service.provider.businessInfo.businessType}</span>
              </div>
              {service.provider.businessInfo.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="w-4 h-4 mr-2" />
                  <a
                    href={service.provider.businessInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ServiceDetailPage;