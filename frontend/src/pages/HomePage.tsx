import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  TrendingUp,
  Award,
  Users,
  Clock,
  Star
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { searchApi } from '../services/searchApi';
import type { Service } from '../types/service';
import { CATEGORY_LIST, getCategoryIcon } from '../constants/categories';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Show first 6 categories on home page
  const categories = CATEGORY_LIST.slice(0, 6).map(cat => ({
    icon: cat.icon,
    name: cat.label,
    value: cat.value
  }));

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);

      // Fetch featured services (high rating)
      const featuredResponse = await searchApi.searchServices({
        minRating: 4.5,
        limit: 4,
        sortBy: 'rating'
      });
      if (featuredResponse.success && featuredResponse.data.services) {
        setFeaturedServices(featuredResponse.data.services);
      }

      // Fetch new services (recently added)
      const newResponse = await searchApi.searchServices({
        limit: 5,
        sortBy: 'newest'
      });
      if (newResponse.success && newResponse.data.services) {
        setNewServices(newResponse.data.services);
      }

      // Fetch popular services (most bookings)
      const popularResponse = await searchApi.searchServices({
        limit: 4,
        sortBy: 'popularity'
      });
      if (popularResponse.success && popularResponse.data.services) {
        setPopularServices(popularResponse.data.services);
      }

    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (categoryValue: string) => {
    navigate(`/search?category=${categoryValue}`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const handleViewAll = (section: string) => {
    if (section === 'featured') {
      navigate('/search?sortBy=rating');
    } else if (section === 'new') {
      navigate('/search?sortBy=createdAt');
    } else if (section === 'popular') {
      navigate('/search?sortBy=bookings');
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Home services at your doorstep
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Browse services, book instantly, and get it done
            </p>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100"
              >
                <div className="text-4xl md:text-5xl mb-3">{category.icon}</div>
                <div className="text-sm font-bold text-gray-900">{category.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Promo Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-8 mb-16">
          <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8 border border-pink-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
            <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg uppercase mb-4">
              New Customer
            </span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Get 20% off on your first booking
            </h3>
            <p className="text-gray-600 text-sm mb-5">Use code: WELCOME20</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              Browse All Services
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
            <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg uppercase mb-4">
              Limited Time
            </span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Deep cleaning starting at ₹45
            </h3>
            <p className="text-gray-600 text-sm mb-5">Professional eco-friendly service</p>
            <button
              onClick={() => navigate('/search?category=cleaning')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              Explore
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
            <span className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg uppercase mb-4">
              Premium
            </span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Salon services at home
            </h3>
            <p className="text-gray-600 text-sm mb-5">Hair, spa, and beauty experts</p>
            <button
              onClick={() => navigate('/search?category=salon')}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors"
            >
              View Services
            </button>
          </div>
        </div>

        {/* Thoughtful Curation */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Thoughtful curation
            </h2>
            <button
              onClick={() => handleViewAll('featured')}
              className="text-gray-600 hover:text-gray-900 font-bold text-sm flex items-center gap-2"
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-gray-100 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
                >
                  <div
                    className={`h-48 flex items-center justify-center text-6xl ${
                      index % 4 === 0 ? 'bg-gradient-to-br from-pink-50 to-yellow-50' :
                      index % 4 === 1 ? 'bg-gradient-to-br from-purple-50 to-pink-50' :
                      index % 4 === 2 ? 'bg-gradient-to-br from-blue-50 to-purple-50' :
                      'bg-gradient-to-br from-yellow-50 to-blue-50'
                    }`}
                  >
                    {getCategoryIcon(service.category)}
                    {service.rating?.average >= 4.5 && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-lg text-xs font-bold text-green-600">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">
                      {service.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-900">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {service.rating?.average?.toFixed(1) || '0.0'}
                      <span className="text-gray-400">({service.rating?.count || 0})</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">
                      ₹{service.price?.amount || 0}
                      <span className="text-sm text-gray-400 font-semibold"> /service</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* New and Noteworthy */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              New and noteworthy
            </h2>
            <button
              onClick={() => handleViewAll('new')}
              className="text-gray-600 hover:text-gray-900 font-bold text-sm flex items-center gap-2"
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div className="flex gap-5 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="min-w-[280px] bg-gray-100 rounded-2xl h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {newServices.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="min-w-[280px] bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex-shrink-0"
                >
                  <div className={`h-44 flex items-center justify-center text-5xl bg-gradient-to-br from-yellow-50 to-blue-50`}>
                    {getCategoryIcon(service.category)}
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                      {service.name}
                    </h3>
                    <div className="text-lg font-black text-gray-900">
                      ₹{service.price?.amount || 0}/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Large Banner */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-12 md:p-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Premium cleaning packages
              </h2>
              <p className="text-gray-300 text-lg mb-7">
                Get your entire home professionally cleaned with our eco-friendly products.
                Book 3 sessions and save 25%.
              </p>
              <button
                onClick={() => navigate('/search?category=cleaning')}
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-black text-base hover:bg-gray-100 transition-colors"
              >
                Explore Packages
              </button>
            </div>
            <div className="bg-white/10 rounded-2xl h-64 lg:h-80 flex items-center justify-center text-8xl lg:text-9xl">
              🏠
            </div>
          </div>
        </div>

        {/* Most Booked Services */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              Most booked services
            </h2>
            <button
              onClick={() => handleViewAll('popular')}
              className="text-gray-600 hover:text-gray-900 font-bold text-sm flex items-center gap-2"
            >
              View all →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-gray-100 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer"
                >
                  <div className={`h-48 flex items-center justify-center text-6xl bg-gradient-to-br ${
                    index % 4 === 0 ? 'from-pink-50 to-purple-50' :
                    index % 4 === 1 ? 'from-blue-50 to-green-50' :
                    index % 4 === 2 ? 'from-yellow-50 to-pink-50' :
                    'from-purple-50 to-blue-50'
                  }`}>
                    {getCategoryIcon(service.category)}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-2">
                      {service.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-900">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {service.rating?.average?.toFixed(1) || '0.0'}
                      <span className="text-gray-400">({service.rating?.count || 0})</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">
                      ₹{service.price?.amount || 0}
                      <span className="text-sm text-gray-400 font-semibold"> /service</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          <div className="text-center p-7 bg-gray-50 rounded-2xl">
            <div className="text-4xl font-black text-gray-900 mb-2">1000+</div>
            <div className="text-sm text-gray-600 font-semibold">Verified Professionals</div>
          </div>
          <div className="text-center p-7 bg-gray-50 rounded-2xl">
            <div className="text-4xl font-black text-gray-900 mb-2">50k+</div>
            <div className="text-sm text-gray-600 font-semibold">Happy Customers</div>
          </div>
          <div className="text-center p-7 bg-gray-50 rounded-2xl">
            <div className="text-4xl font-black text-gray-900 mb-2">4.8★</div>
            <div className="text-sm text-gray-600 font-semibold">Average Rating</div>
          </div>
          <div className="text-center p-7 bg-gray-50 rounded-2xl">
            <div className="text-4xl font-black text-gray-900 mb-2">24/7</div>
            <div className="text-sm text-gray-600 font-semibold">Customer Support</div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
