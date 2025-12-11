import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { searchApi } from '../services/searchApi';
import type { Service } from '../types/service';

// Import new home components
import {
  HeroSlider,
  CategoryCards,
  AskNilinAI,
  AIChatWidget,
  ChatToggleButton,
  HowItWorks,
  ProviderCTA,
} from '../components/home';

// Service images for categories with colors
const SERVICE_DATA: Record<string, { image: string; gradient: string; badge: string }> = {
  'beauty-wellness': {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-500',
  },
  'fitness-personal-health': {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    gradient: 'from-emerald-500 to-green-500',
    badge: 'bg-emerald-500',
  },
  'mobile-medical-care': {
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&h=300&fit=crop',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'bg-blue-500',
  },
  'education-personal-development': {
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
    gradient: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-500',
  },
  'corporate-services': {
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    gradient: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-500',
  },
  'home-maintenance': {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'bg-amber-500',
  },
  'Cleaning': {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    gradient: 'from-cyan-500 to-teal-500',
    badge: 'bg-cyan-500',
  },
  'Beauty': {
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-500',
  },
  'Fitness': {
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    gradient: 'from-emerald-500 to-green-500',
    badge: 'bg-emerald-500',
  },
  'Home Repair': {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'bg-amber-500',
  },
  'Electrical': {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    gradient: 'from-yellow-500 to-orange-500',
    badge: 'bg-yellow-500',
  },
  'Plumbing': {
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
    gradient: 'from-blue-500 to-indigo-500',
    badge: 'bg-blue-500',
  },
  'Tutoring': {
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
    gradient: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-500',
  },
  'Pet Care': {
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    gradient: 'from-rose-500 to-pink-500',
    badge: 'bg-rose-500',
  },
  'Painting': {
    image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop',
    gradient: 'from-purple-500 to-violet-500',
    badge: 'bg-purple-500',
  },
  'Technology': {
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    gradient: 'from-slate-500 to-gray-500',
    badge: 'bg-slate-500',
  },
};

const DEFAULT_SERVICE_DATA = {
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  gradient: 'from-nilin-primary to-nilin-secondary',
  badge: 'bg-nilin-primary',
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Refs for horizontal scroll
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const popularScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const [featuredRes, popularRes] = await Promise.all([
        searchApi.searchServices({ minRating: 4, limit: 6, sortBy: 'rating' }),
        searchApi.searchServices({ limit: 6, sortBy: 'popularity' })
      ]);

      if (featuredRes.success && featuredRes.data.services) {
        setFeaturedServices(featuredRes.data.services);
      }
      if (popularRes.success && popularRes.data.services) {
        setPopularServices(popularRes.data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getServiceData = (category: string) => {
    return SERVICE_DATA[category] || DEFAULT_SERVICE_DATA;
  };

  // Placeholder services when none from API
  const placeholderServices = [
    { _id: '1', name: 'Deep Home Cleaning', category: 'Cleaning', price: { amount: 499 }, rating: { average: 4.9, count: 813 } },
    { _id: '2', name: 'Hair Styling & Spa', category: 'Beauty', price: { amount: 299 }, rating: { average: 4.8, count: 1200 } },
    { _id: '3', name: 'Personal Training', category: 'Fitness', price: { amount: 599 }, rating: { average: 4.7, count: 450 } },
    { _id: '4', name: 'AC Service & Repair', category: 'Home Repair', price: { amount: 399 }, rating: { average: 4.9, count: 2100 } },
    { _id: '5', name: 'Plumbing Repair', category: 'Plumbing', price: { amount: 349 }, rating: { average: 4.8, count: 890 } },
    { _id: '6', name: 'Math Tutoring', category: 'Tutoring', price: { amount: 449 }, rating: { average: 4.9, count: 340 } },
  ];

  const displayFeatured = featuredServices.length > 0 ? featuredServices : placeholderServices;
  const displayPopular = popularServices.length > 0 ? popularServices : placeholderServices;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationHeader showSearch={false} />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Category Cards */}
      <CategoryCards />

      {/* Ask NILIN AI Section */}
      <AskNilinAI onStartChat={() => setIsChatOpen(true)} />

      {/* Most Booked Services - Horizontal Scroll */}
      <section className="py-8 md:py-14 bg-gradient-to-b from-nilin-pink/30 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Most booked services</h2>
              <p className="hidden md:block text-gray-500 text-sm mt-1">Popular services loved by customers</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll(popularScrollRef, 'left')}
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-nilin-primary hover:bg-nilin-pink/50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => scroll(popularScrollRef, 'right')}
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-nilin-primary hover:bg-nilin-pink/50 transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div
            ref={popularScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 md:w-60 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-56 md:h-72 animate-pulse" />
              ))
            ) : (
              displayPopular.map((service, index) => {
                const serviceData = getServiceData(service.category);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service._id)}
                    className="flex-shrink-0 w-44 md:w-60 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer snap-start border border-gray-100 group hover:-translate-y-1"
                  >
                    <div className="relative h-28 md:h-36">
                      <img
                        src={serviceData.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${serviceData.gradient} opacity-20`} />
                      {index === 0 && (
                        <span className={`absolute top-2 left-2 px-2.5 py-1 ${serviceData.badge} text-white text-[10px] md:text-xs font-bold rounded-lg shadow-md`}>
                          New launch
                        </span>
                      )}
                      {/* Category tag */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-md">
                        {service.category}
                      </span>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-nilin-primary transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-50 rounded">
                          <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-600 fill-green-600" />
                          <span className="text-xs font-semibold text-green-700">
                            {service.rating?.average?.toFixed(1) || '4.8'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          ({service.rating?.count ? `${(service.rating.count / 1000).toFixed(1)}K` : '3.7K'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm md:text-base">
                          ₹{service.price?.amount || 499}
                        </span>
                        {index % 2 === 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{Math.round((service.price?.amount || 499) * 1.2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Services - Horizontal Scroll */}
      <section className="py-8 md:py-14 bg-gradient-to-b from-white via-nilin-lavender/20 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-6 md:mb-8">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Top rated services</h2>
              <p className="hidden md:block text-gray-500 text-sm mt-1">Handpicked by our experts</p>
            </div>
            <button
              onClick={() => navigate('/search?sortBy=rating')}
              className="flex items-center gap-1 px-4 py-2 bg-nilin-lavender/50 hover:bg-nilin-lavender text-nilin-primary font-semibold text-sm rounded-lg transition-colors"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div
            ref={featuredScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 md:w-60 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-56 md:h-72 animate-pulse" />
              ))
            ) : (
              displayFeatured.map((service) => {
                const serviceData = getServiceData(service.category);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service._id)}
                    className="flex-shrink-0 w-44 md:w-60 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer snap-start group hover:-translate-y-1"
                  >
                    <div className="relative h-28 md:h-36">
                      <img
                        src={serviceData.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${serviceData.gradient} opacity-20`} />
                      {service.rating?.average >= 4.8 && (
                        <span className="absolute top-2 left-2 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] md:text-xs font-bold rounded-lg shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          Top Rated
                        </span>
                      )}
                      {/* Category tag */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium rounded-md">
                        {service.category}
                      </span>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-nilin-primary transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded">
                          <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-semibold text-amber-700">
                            {service.rating?.average?.toFixed(1) || '4.9'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          ({service.rating?.count || 100}+ reviews)
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        ₹{service.price?.amount || 399}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Provider CTA */}
      <ProviderCTA />

      {/* Original Footer */}
      <Footer />

      {/* AI Chat Widget */}
      <AIChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Chat Toggle Button (when chat is closed) */}
      {!isChatOpen && <ChatToggleButton onClick={() => setIsChatOpen(true)} />}
    </div>
  );
};

export default HomePage;
