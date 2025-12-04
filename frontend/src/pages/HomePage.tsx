import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { searchApi } from '../services/searchApi';
import type { Service } from '../types/service';
import { useCategories } from '../hooks/useCategories';
import { CATEGORY_LIST } from '../constants/categories';

// Category icons for NILIN master categories
const CATEGORY_ICONS: Record<string, string> = {
  // NILIN master categories
  'beauty-wellness': '💅',
  'fitness-personal-health': '💪',
  'mobile-medical-care': '🏥',
  'education-personal-development': '📚',
  'corporate-services': '🏢',
  'home-maintenance': '🏠',
  // Fallback for old category names
  'Cleaning': '🧹',
  'Beauty': '💅',
  'Fitness': '💪',
  'Tutoring': '📚',
  'Home Repair': '🔧',
  'Electrical': '⚡',
  'Plumbing': '🚿',
  'Painting': '🎨',
  'Pet Care': '🐕',
  'Technology': '💻',
  'Landscaping': '🌿',
  'Moving': '📦',
  'Assembly': '🪑',
  'Automotive': '🚗',
};

// Service images for NILIN categories
const SERVICE_IMAGES: Record<string, string> = {
  // NILIN master categories
  'beauty-wellness': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'fitness-personal-health': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'mobile-medical-care': 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=400&h=300&fit=crop',
  'education-personal-development': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
  'corporate-services': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
  'home-maintenance': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  // Fallback for old category names
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'Fitness': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'Home Repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
  'Tutoring': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
  'Pet Care': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  'Painting': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&h=300&fit=crop',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
};

// Hero banner image
const HERO_BANNER_IMAGE = 'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=600&h=400&fit=crop';

// Testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul S.',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Excellent service! The plumber fixed everything in one visit. Very professional.',
  },
  {
    id: 2,
    name: 'Priya M.',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Amazing beauty service at home. The professional was skilled and brought all equipment.',
  },
  {
    id: 3,
    name: 'Amit K.',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Found an excellent tutor for my daughter. The booking process was simple!',
  },
];

// FAQ data
const FAQS = [
  {
    question: 'What is NILIN?',
    answer: 'NILIN is a trusted platform connecting you with verified professionals for all your service needs — from home maintenance to beauty, fitness to education.',
  },
  {
    question: 'How do I book a service?',
    answer: 'Search for the service you need, select a professional, choose your preferred date and time, and confirm your booking.',
  },
  {
    question: 'Are the professionals verified?',
    answer: 'Yes! All professionals go through identity verification, skill assessment, and background checks.',
  },
  {
    question: "What if I'm not satisfied?",
    answer: 'Contact our 24/7 support team. We offer a money-back guarantee and will resolve any issues promptly.',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fetch categories from API
  const { categories: apiCategories, isLoading: categoriesLoading, error: categoriesError } = useCategories(true);

  // Refs for horizontal scroll
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const popularScrollRef = useRef<HTMLDivElement>(null);

  // Use API categories if available, fallback to static list
  const categories = apiCategories.length > 0
    ? apiCategories.slice(0, 6) // NILIN has 6 master categories
    : CATEGORY_LIST.slice(0, 9);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categorySlugOrValue: string) => {
    // Navigate to category detail page for NILIN categories
    navigate(`/category/${categorySlugOrValue}`);
  };

  // Helper to get category identifier (works with both API and static categories)
  const getCategoryId = (cat: any): string => {
    return cat.slug || cat.value;
  };

  const getCategoryLabel = (cat: any): string => {
    return cat.name || cat.label;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationHeader showSearch={false} />

      {/* Mobile Search Bar */}
      <div className="bg-white px-4 py-3 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for 'AC service'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-nilin-primary/20"
            />
          </div>
        </form>
      </div>

      {/* Promotional Banner - Mobile */}
      <div className="px-4 py-4 md:hidden">
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl overflow-hidden">
          <div className="p-5 pr-32">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/90 font-semibold italic text-sm">Quick Service</span>
              <span className="px-2 py-0.5 bg-nilin-success text-white text-xs font-bold rounded-full">30 mins</span>
            </div>
            <h3 className="text-white text-xl font-bold leading-tight mb-3">
              Need help?<br />Get trained pros
            </h3>
            <button
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 bg-white text-nilin-dark rounded-lg font-semibold text-sm"
            >
              Book now
            </button>
          </div>
          <img
            src={HERO_BANNER_IMAGE}
            alt="Service Professional"
            className="absolute right-0 bottom-0 h-full w-32 object-cover object-left"
          />
        </div>
      </div>

      {/* Desktop Hero Section */}
      <section className="hidden md:block bg-gradient-nilin-hero py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-nilin-dark mb-6">
                <span className="w-2 h-2 bg-nilin-success rounded-full animate-pulse"></span>
                Trusted by 50,000+ customers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-nilin-dark leading-tight mb-6">
                Expert Services
                <br />
                <span className="bg-gradient-to-r from-nilin-primary to-nilin-accent bg-clip-text text-transparent">
                  At Your Doorstep
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Trusted professionals for every need — from home maintenance to beauty, fitness to education.
              </p>
              <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto lg:mx-0 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-nilin-primary/20 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-nilin-primary text-white rounded-2xl font-bold hover:bg-nilin-primary-dark transition-all shadow-lg shadow-nilin-primary/30"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={SERVICE_IMAGES['Cleaning']} alt="Cleaning" className="w-full h-48 object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={SERVICE_IMAGES['Beauty']} alt="Beauty" className="w-full h-56 object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={SERVICE_IMAGES['Fitness']} alt="Fitness" className="w-full h-56 object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl">
                  <img src={SERVICE_IMAGES['Home Repair']} alt="Home Repair" className="w-full h-48 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid - Clean Professional Layout */}
      <section className="bg-white py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-black text-nilin-dark mb-2 md:mb-4">
              Explore Services
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
              Choose from our curated categories of professional services
            </p>
          </div>

          {/* Mobile: 2-column clean grid */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            {categories.map((category) => {
              const catId = getCategoryId(category);
              const catLabel = getCategoryLabel(category);
              return (
                <button
                  key={category._id || category.value}
                  onClick={() => handleCategoryClick(catId)}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 text-left hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6"
                    style={{ backgroundColor: category.color || '#6366f1' }}
                  />
                  <div
                    className="w-12 h-12 mb-3 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color ? `${category.color}15` : '#f3f4f6' }}
                  >
                    {CATEGORY_ICONS[catId] || CATEGORY_ICONS[catLabel] || '🔧'}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                    {catLabel}
                  </h3>
                  {category.subcategoryCount && (
                    <p className="text-xs text-gray-400">{category.subcategoryCount} services</p>
                  )}
                  <ChevronRight
                    className="absolute bottom-4 right-4 w-4 h-4 text-gray-300"
                  />
                </button>
              );
            })}
          </div>

          {/* Desktop: Clean 3x2 grid for 6 NILIN categories */}
          <div className="hidden md:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((category) => {
              const catId = getCategoryId(category);
              const catLabel = getCategoryLabel(category);
              const imageUrl = SERVICE_IMAGES[catId] || SERVICE_IMAGES[catLabel];
              return (
                <button
                  key={category._id || category.value}
                  onClick={() => handleCategoryClick(catId)}
                  className="group relative overflow-hidden rounded-3xl bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Background */}
                  <div className="relative h-40 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={catLabel}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: category.color ? `${category.color}20` : '#f3f4f6' }}
                      >
                        <span className="text-5xl">{CATEGORY_ICONS[catId] || CATEGORY_ICONS[catLabel] || '🔧'}</span>
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {/* Category Color Accent */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: category.color || '#6366f1' }}
                    />
                  </div>
                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-nilin-primary transition-colors">
                          {catLabel}
                        </h3>
                        {category.subcategoryCount && (
                          <p className="text-sm text-gray-500">{category.subcategoryCount} subcategories</p>
                        )}
                      </div>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: category.color ? `${category.color}15` : '#f3f4f6' }}
                      >
                        <ArrowRight
                          className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                          style={{ color: category.color || '#6366f1' }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mobile: View All Link */}
          <button
            onClick={() => navigate('/search')}
            className="md:hidden flex items-center justify-center gap-2 w-full mt-6 py-3 bg-gray-50 rounded-xl text-nilin-primary font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Browse all services
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Most Booked Services - Horizontal Scroll */}
      <section className="py-6 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4 md:mb-8">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-nilin-dark">Most booked services</h2>
              <p className="hidden md:block text-gray-600 mt-1">Popular services loved by customers</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll(popularScrollRef, 'left')}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(popularScrollRef, 'right')}
                className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
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
                <div key={i} className="flex-shrink-0 w-40 md:w-64 bg-gray-200 rounded-2xl h-56 md:h-72 animate-pulse" />
              ))
            ) : (
              displayPopular.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="flex-shrink-0 w-40 md:w-64 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer snap-start"
                >
                  <div className="relative h-28 md:h-40">
                    <img
                      src={SERVICE_IMAGES[service.category] || SERVICE_IMAGES['Cleaning']}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-pink-500 text-white text-[10px] md:text-xs font-bold rounded">
                        New launch
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-1">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-gray-800 fill-gray-800" />
                      <span className="text-xs md:text-sm font-medium text-gray-800">
                        {service.rating?.average?.toFixed(2) || '4.79'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({service.rating?.count ? `${(service.rating.count / 1000).toFixed(1)}K` : '3.7M'})
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Rated Services - Horizontal Scroll */}
      <section className="py-6 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4 md:mb-8">
            <div>
              <h2 className="text-lg md:text-3xl font-bold text-nilin-dark">Top rated services</h2>
              <p className="hidden md:block text-gray-600 mt-1">Handpicked by our experts</p>
            </div>
            <button
              onClick={() => navigate('/search?sortBy=rating')}
              className="text-nilin-primary font-semibold text-sm flex items-center gap-1"
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
                <div key={i} className="flex-shrink-0 w-40 md:w-64 bg-gray-200 rounded-2xl h-56 md:h-72 animate-pulse" />
              ))
            ) : (
              displayFeatured.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="flex-shrink-0 w-40 md:w-64 bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer snap-start"
                >
                  <div className="relative h-28 md:h-40">
                    <img
                      src={SERVICE_IMAGES[service.category] || SERVICE_IMAGES['Beauty']}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    {service.rating?.average >= 4.8 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-nilin-success text-white text-[10px] md:text-xs font-bold rounded">
                        Top Rated
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-1">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs md:text-sm font-medium text-gray-800">
                        {service.rating?.average?.toFixed(1) || '4.9'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({service.rating?.count || 100}+ reviews)
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm md:text-base">
                      ₹{service.price?.amount || 399}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works - Desktop Only */}
      <section className="hidden md:block py-16 bg-gradient-to-br from-nilin-lavender/30 via-white to-nilin-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-nilin-dark mb-4">How NILIN Works</h2>
            <p className="text-gray-600">Book a service in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <Search className="w-9 h-9 text-nilin-primary" />
              </div>
              <div className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-nilin-primary text-white font-bold flex items-center justify-center">1</div>
              <h3 className="text-xl font-bold text-nilin-dark mb-2">Search & Browse</h3>
              <p className="text-gray-600">Browse from 100+ services across 15+ categories</p>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-nilin-primary to-nilin-secondary"></div>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <Calendar className="w-9 h-9 text-nilin-secondary" />
              </div>
              <div className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-nilin-secondary text-white font-bold flex items-center justify-center">2</div>
              <h3 className="text-xl font-bold text-nilin-dark mb-2">Schedule & Book</h3>
              <p className="text-gray-600">Pick your preferred date, time, and location</p>
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-nilin-secondary to-nilin-accent"></div>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-nilin-accent" />
              </div>
              <div className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-nilin-accent text-white font-bold flex items-center justify-center">3</div>
              <h3 className="text-xl font-bold text-nilin-dark mb-2">Get It Done!</h3>
              <p className="text-gray-600">Verified professional arrives on time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Mobile Compact */}
      <section className="py-6 md:py-12 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-2 md:gap-6">
            <div className="text-center">
              <div className="text-xl md:text-4xl font-black text-nilin-dark">50K+</div>
              <div className="text-[10px] md:text-sm text-gray-500">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-4xl font-black text-nilin-dark">1K+</div>
              <div className="text-[10px] md:text-sm text-gray-500">Pros</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-4xl font-black text-nilin-dark">4.8</div>
              <div className="text-[10px] md:text-sm text-gray-500">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-4xl font-black text-nilin-dark">24/7</div>
              <div className="text-[10px] md:text-sm text-gray-500">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Horizontal Scroll on Mobile */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 mb-6 md:mb-10">
            <h2 className="text-lg md:text-3xl font-bold text-nilin-dark text-center md:text-left">
              What customers say
            </h2>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-72 md:w-auto bg-white rounded-2xl p-5 md:p-6 shadow-sm snap-start"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg md:text-3xl font-bold text-nilin-dark mb-6 md:mb-10 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-2 md:space-y-3">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full p-4 text-left font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm md:text-base pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4 text-gray-600 text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-nilin-dark via-indigo-900 to-nilin-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            Get expert help in minutes
          </h2>
          <p className="text-white/70 mb-8 text-sm md:text-base max-w-xl mx-auto">
            Join 50,000+ customers who trust NILIN for their everyday service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-3.5 bg-white text-nilin-dark rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate('/register/provider')}
              className="px-8 py-3.5 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              Become a Pro
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
