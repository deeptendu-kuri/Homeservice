import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../layout/NavigationHeader';
import Footer from '../layout/Footer';
import CategoryGrid from '../customer/CategoryGrid';
import ServiceCard from '../customer/ServiceCard';
import PromoCard from '../customer/PromoCard';
import type { Service } from '../../types/service';
import type { Promo } from '../customer/PromoCard';
import { searchApi } from '../../services/searchApi';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [newServices, setNewServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Default promotions (in production, these would come from API)
  const promos: Promo[] = [
    {
      id: '1',
      title: 'First Booking Offer',
      description: 'Get 20% off on your first home service booking',
      badge: 'NEW USER',
      ctaText: 'Book Now',
      ctaLink: '/search',
      colorScheme: 'pink'
    },
    {
      id: '2',
      title: 'Weekend Special',
      description: 'Flat 15% off on all beauty & spa services this weekend',
      badge: 'LIMITED TIME',
      ctaText: 'Explore Offers',
      ctaLink: '/search?category=beauty',
      colorScheme: 'lavender'
    },
    {
      id: '3',
      title: 'Refer & Earn',
      description: 'Refer a friend and both get AED 50 in your wallet',
      badge: 'REWARDS',
      ctaText: 'Refer Now',
      ctaLink: '/customer/rewards',
      colorScheme: 'blue'
    }
  ];

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        // Fetch popular services
        const popularResponse = await searchApi.getPopularServices();
        if (popularResponse.success && Array.isArray(popularResponse.data)) {
          setPopularServices(popularResponse.data.slice(0, 4));
        }

        // Fetch trending services
        const trendingResponse = await searchApi.getTrendingServices();
        if (trendingResponse.success && Array.isArray(trendingResponse.data)) {
          setTrendingServices(trendingResponse.data.slice(0, 6));
        }

        // For new services, we'll use search with sorting
        const newResponse = await searchApi.searchServices({
          sortBy: 'newest',
          limit: 6
        });
        if (newResponse.success && newResponse.data?.services) {
          setNewServices(newResponse.data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationHeader showSearch={true} onSearch={handleSearch} />

      {/* Hero Section with Category Grid */}
      <section className="bg-gradient-nilin-primary py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Home services at your doorstep
            </h1>
            <p className="text-lg text-gray-700">
              Professional, reliable, and affordable service providers
            </p>
          </div>

          {/* Category Grid */}
          <CategoryGrid />
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((promo, index) => (
              <PromoCard key={promo.id} promo={promo} colorIndex={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Most Booked Services Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Most booked services
              </h2>
              <p className="text-gray-600">Trusted by thousands of happy customers</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all
              <span>→</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-gray-100 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : popularServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No popular services available at the moment
            </div>
          )}
        </div>
      </section>

      {/* New & Noteworthy Section */}
      <section className="py-12 bg-gradient-nilin-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              New and noteworthy
            </h2>
            <p className="text-gray-700">Recently added services you'll love</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-xl h-48 animate-pulse"></div>
              ))}
            </div>
          ) : newServices.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {newServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-700">
              No new services available
            </div>
          )}
        </div>
      </section>

      {/* Large Promotional Banner */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-nilin-lavender via-nilin-blue to-nilin-cream rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quality you can trust
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              All our service providers are verified, background-checked, and highly rated by thousands of customers
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* Thoughtful Curation Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thoughtful curation
            </h2>
            <p className="text-gray-600">Handpicked services for you</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : trendingServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingServices.slice(0, 4).map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No curated services available
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
