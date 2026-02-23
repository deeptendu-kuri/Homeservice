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

// Category image lookup by slug or name
const getCategoryImage = (category: string): string => {
  const CATEGORY_IMAGES: Record<string, string> = {
    'hair': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    'makeup': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400',
    'nails': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    'skin-aesthetics': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    'massage-body': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    'personal-care': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
    'Hair': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    'Makeup': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400',
    'Nails': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    'Skin & Aesthetics': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    'Massage & Body': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    'Personal Care': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
  };
  return CATEGORY_IMAGES[category] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400';
};

// Get styling for category by slug or name
const getCategoryStyle = (category: string): { gradient: string; badge: string } => {
  const styles: Record<string, { gradient: string; badge: string }> = {
    'hair': { gradient: 'from-pink-500 to-rose-500', badge: 'bg-pink-500' },
    'makeup': { gradient: 'from-rose-400 to-pink-500', badge: 'bg-rose-500' },
    'nails': { gradient: 'from-purple-400 to-violet-500', badge: 'bg-purple-500' },
    'skin-aesthetics': { gradient: 'from-violet-500 to-purple-500', badge: 'bg-violet-500' },
    'massage-body': { gradient: 'from-blue-400 to-cyan-500', badge: 'bg-blue-500' },
    'personal-care': { gradient: 'from-emerald-400 to-green-500', badge: 'bg-emerald-500' },
    'Hair': { gradient: 'from-pink-500 to-rose-500', badge: 'bg-pink-500' },
    'Makeup': { gradient: 'from-rose-400 to-pink-500', badge: 'bg-rose-500' },
    'Nails': { gradient: 'from-purple-400 to-violet-500', badge: 'bg-purple-500' },
    'Skin & Aesthetics': { gradient: 'from-violet-500 to-purple-500', badge: 'bg-violet-500' },
    'Massage & Body': { gradient: 'from-blue-400 to-cyan-500', badge: 'bg-blue-500' },
    'Personal Care': { gradient: 'from-emerald-400 to-green-500', badge: 'bg-emerald-500' },
  };
  return styles[category] || { gradient: 'from-pink-500 to-rose-500', badge: 'bg-pink-500' };
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

  // Display services - use real data only (no placeholders)
  const displayFeatured = featuredServices;
  const displayPopular = popularServices;

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
              displayPopular.length > 0 ? displayPopular.map((service, index) => {
                const categoryStyle = getCategoryStyle(service.category);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service._id)}
                    className="flex-shrink-0 w-44 md:w-60 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer snap-start border border-gray-100 group hover:-translate-y-1"
                  >
                    <div className="relative h-28 md:h-36">
                      <img
                        src={getCategoryImage(service.category)}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${categoryStyle.gradient} opacity-20`} />
                      {index === 0 && (
                        <span className={`absolute top-2 left-2 px-2.5 py-1 ${categoryStyle.badge} text-white text-[10px] md:text-xs font-bold rounded-lg shadow-md`}>
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
                          AED {service.price?.amount || 499}
                        </span>
                        {index % 2 === 0 && (
                          <span className="text-xs text-gray-400 line-through">
                            AED {Math.round((service.price?.amount || 499) * 1.2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex-shrink-0 w-full text-center py-8 text-gray-500">
                  No services available yet. Check back soon!
                </div>
              )
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
              displayFeatured.length > 0 ? displayFeatured.map((service) => {
                const categoryStyle = getCategoryStyle(service.category);
                return (
                  <div
                    key={service._id}
                    onClick={() => handleServiceClick(service._id)}
                    className="flex-shrink-0 w-44 md:w-60 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer snap-start group hover:-translate-y-1"
                  >
                    <div className="relative h-28 md:h-36">
                      <img
                        src={getCategoryImage(service.category)}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${categoryStyle.gradient} opacity-20`} />
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
                        AED {service.price?.amount || 399}
                      </span>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex-shrink-0 w-full text-center py-8 text-gray-500">
                  No services available yet. Check back soon!
                </div>
              )
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
