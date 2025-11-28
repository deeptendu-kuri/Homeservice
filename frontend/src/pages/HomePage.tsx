import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
  Shield
} from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { searchApi } from '../services/searchApi';
import type { Service } from '../types/service';
import { CATEGORY_LIST, getCategoryIcon } from '../constants/categories';

// Service category images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop',
  'Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop',
  'Fitness': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop',
  'Tutoring': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=100&h=100&fit=crop',
  'Home Repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop',
  'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop',
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=100&h=100&fit=crop',
  'Painting': 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=100&h=100&fit=crop',
  'Pet Care': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
  'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
};

// Hero images
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=350&fit=crop',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=350&fit=crop',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
];

// Featured service images
const SERVICE_IMAGES: Record<string, string> = {
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
  'Beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop',
  'Fitness': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  'Home Repair': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
  'Electrical': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  'Plumbing': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop',
  'Tutoring': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=300&fit=crop',
};

// Testimonials data
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Excellent service! The plumber fixed everything in one visit. Very professional and on time. Will definitely use NILIN again for all my home needs.',
  },
  {
    id: 2,
    name: 'Priya Mehta',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'The beauty service was amazing! The professional was skilled and brought all the equipment. My home salon experience was better than any parlor visit.',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    text: 'Found an excellent math tutor for my daughter through NILIN. The booking process was simple and the tutor is very patient. Grades have improved significantly!',
  },
];

// FAQ data
const FAQS = [
  {
    question: 'What is NILIN?',
    answer: 'NILIN is a trusted platform that connects you with verified professionals for all your service needs — from home maintenance and cleaning to beauty, fitness, and education. Book instantly, pay securely.',
  },
  {
    question: 'How do I book a service?',
    answer: 'Simply search for the service you need, select a professional, choose your preferred date and time, and confirm your booking. The professional will arrive at your doorstep as scheduled.',
  },
  {
    question: 'Are the professionals verified?',
    answer: 'Yes! All professionals on NILIN go through a rigorous verification process including identity verification, skill assessment, and background checks. We also collect and display genuine customer reviews.',
  },
  {
    question: "What if I'm not satisfied with the service?",
    answer: 'Your satisfaction is our priority. If you\'re not happy with the service, contact our 24/7 support team. We offer a money-back guarantee and will work to resolve any issues promptly.',
  },
  {
    question: 'How do I become a NILIN professional?',
    answer: 'Click on "Become a Pro" and complete your registration. You\'ll need to submit your ID, relevant certifications, and complete our verification process. Once approved, you can start receiving bookings!',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Show first 9 categories + View All
  const categories = CATEGORY_LIST.slice(0, 9);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await searchApi.searchServices({
        minRating: 4,
        limit: 4,
        sortBy: 'rating'
      });
      if (response.success && response.data.services) {
        setFeaturedServices(response.data.services);
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

  const handleCategoryClick = (categoryValue: string) => {
    navigate(`/search?category=${categoryValue}`);
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/services/${serviceId}`);
  };

  const gradients = [
    'from-nilin-pink to-nilin-lavender',
    'from-nilin-lavender to-nilin-blue',
    'from-nilin-blue to-nilin-cream',
    'from-nilin-cream to-nilin-pink',
    'from-nilin-pink to-nilin-blue',
    'from-nilin-lavender to-nilin-pink',
    'from-nilin-blue to-nilin-lavender',
    'from-nilin-cream to-nilin-lavender',
    'from-nilin-pink to-nilin-cream',
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavigationHeader />

      {/* Hero Section */}
      <section className="bg-gradient-nilin-hero py-12 md:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-nilin-dark mb-6">
                <span className="w-2 h-2 bg-nilin-success rounded-full animate-pulse"></span>
                Trusted by 50,000+ customers
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-nilin-dark leading-tight mb-6">
                Expert Services
                <br />
                <span className="bg-gradient-to-r from-nilin-primary to-nilin-accent bg-clip-text text-transparent">
                  At Your Doorstep
                </span>
                <br />
                In Minutes
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Trusted professionals for every need — from home maintenance to beauty, fitness to education. Book instantly, pay securely.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto lg:mx-0 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-nilin-primary/20 focus:border-nilin-primary shadow-lg transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-nilin-primary text-white rounded-2xl font-bold text-base hover:bg-nilin-primary-dark transition-all shadow-lg shadow-nilin-primary/30 hover:shadow-xl hover:shadow-nilin-primary/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Search
                </button>
              </form>

              {/* Location Pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 items-center">
                <span className="text-sm text-gray-500">Available in:</span>
                <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-nilin-dark">Delhi</span>
                <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-nilin-dark">Mumbai</span>
                <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-nilin-dark">Bangalore</span>
                <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-nilin-dark">+12 cities</span>
              </div>
            </div>

            {/* Right Image Grid - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img src={HERO_IMAGES[0]} alt="Cleaning Service" className="w-full h-48 object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img src={HERO_IMAGES[1]} alt="Beauty Service" className="w-full h-56 object-cover" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img src={HERO_IMAGES[2]} alt="Fitness Training" className="w-full h-56 object-cover" />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <img src={HERO_IMAGES[3]} alt="Home Repair" className="w-full h-48 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 font-medium">On-demand verified professionals available 24x7</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-nilin-pink/50 to-white">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-nilin-dark mb-1 md:mb-2">50K+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-nilin-lavender/50 to-white">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-nilin-dark mb-1 md:mb-2">1K+</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Verified Pros</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-nilin-blue/50 to-white">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-nilin-dark mb-1 md:mb-2">4.8</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center p-4 md:p-6 rounded-2xl bg-gradient-to-br from-nilin-cream/50 to-white">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-nilin-dark mb-1 md:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-nilin-dark mb-3 md:mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Find the perfect professional for your needs. Browse from 100+ services across 15+ categories.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
            {categories.map((category, index) => (
              <button
                key={category.value}
                onClick={() => handleCategoryClick(category.value)}
                className="group bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-nilin-primary/20 hover:-translate-y-1 active:translate-y-0"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center overflow-hidden`}>
                  {CATEGORY_IMAGES[category.value] ? (
                    <img
                      src={CATEGORY_IMAGES[category.value]}
                      alt={category.label}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl">{category.icon}</span>
                  )}
                </div>
                <h3 className="font-bold text-nilin-dark mb-1 text-sm md:text-base">{category.label}</h3>
                <p className="text-xs text-gray-500">{Math.floor(Math.random() * 30) + 15}+ services</p>
              </button>
            ))}

            {/* View All Card */}
            <button
              onClick={() => navigate('/search')}
              className="group bg-nilin-primary rounded-2xl md:rounded-3xl p-4 md:p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:bg-nilin-primary-dark active:translate-y-0"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1 text-sm md:text-base">View All</h3>
              <p className="text-xs text-white/70">100+ services</p>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-nilin-lavender/30 via-white to-nilin-blue/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-nilin-dark mb-3 md:mb-4">How NILIN Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">Book a service in 3 simple steps. It's that easy!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <Search className="w-7 h-7 md:w-9 md:h-9 text-nilin-primary" />
              </div>
              <div className="absolute -top-2 -right-2 md:top-0 md:right-1/4 w-8 h-8 rounded-full bg-nilin-primary text-white font-bold flex items-center justify-center text-sm">1</div>
              <h3 className="text-lg md:text-xl font-bold text-nilin-dark mb-2">Search & Browse</h3>
              <p className="text-gray-600 text-sm md:text-base">Browse from 100+ services across 15+ categories. Find exactly what you need.</p>
              {/* Connector Line - Hidden on mobile */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-nilin-primary to-nilin-secondary"></div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 md:w-9 md:h-9 text-nilin-secondary" />
              </div>
              <div className="absolute -top-2 -right-2 md:top-0 md:right-1/4 w-8 h-8 rounded-full bg-nilin-secondary text-white font-bold flex items-center justify-center text-sm">2</div>
              <h3 className="text-lg md:text-xl font-bold text-nilin-dark mb-2">Schedule & Book</h3>
              <p className="text-gray-600 text-sm md:text-base">Pick your preferred date, time, and location. Confirm your booking instantly.</p>
              {/* Connector Line - Hidden on mobile */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-nilin-secondary to-nilin-accent"></div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 md:w-9 md:h-9 text-nilin-accent" />
              </div>
              <div className="absolute -top-2 -right-2 md:top-0 md:right-1/4 w-8 h-8 rounded-full bg-nilin-accent text-white font-bold flex items-center justify-center text-sm">3</div>
              <h3 className="text-lg md:text-xl font-bold text-nilin-dark mb-2">Get It Done!</h3>
              <p className="text-gray-600 text-sm md:text-base">Verified professional arrives on time. Pay securely after service completion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-nilin-dark mb-1 md:mb-2">Top Rated Services</h2>
              <p className="text-gray-600 text-sm sm:text-base">Handpicked services loved by our customers</p>
            </div>
            <button
              onClick={() => navigate('/search?sortBy=rating')}
              className="hidden sm:flex items-center gap-2 px-6 py-3 border-2 border-nilin-primary text-nilin-primary rounded-full font-bold text-sm hover:bg-nilin-primary hover:text-white transition-all"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredServices.map((service, index) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service._id)}
                  className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                >
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img
                      src={SERVICE_IMAGES[service.category] || HERO_IMAGES[index % 4]}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {service.rating?.average >= 4.5 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-nilin-success text-white text-xs font-bold rounded-full">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="text-xs text-nilin-primary font-bold uppercase tracking-wide mb-1 md:mb-2">
                      {service.category}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-nilin-dark mb-2 line-clamp-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-nilin-dark">
                          {service.rating?.average?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">({service.rating?.count || 0} reviews)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg md:text-xl font-black text-nilin-dark">
                        ₹{service.price?.amount || 499}
                        <span className="text-xs md:text-sm font-normal text-gray-400"> /service</span>
                      </div>
                      <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-nilin-primary/10 text-nilin-primary flex items-center justify-center hover:bg-nilin-primary hover:text-white transition-colors">
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Placeholder cards when no services */}
              {[
                { name: 'Deep Home Cleaning', category: 'Cleaning', price: 499, rating: 4.9 },
                { name: 'Hair Styling & Spa', category: 'Beauty', price: 299, rating: 4.8 },
                { name: 'Personal Training', category: 'Fitness', price: 599, rating: 4.7 },
                { name: 'AC Service & Repair', category: 'Home Repair', price: 399, rating: 4.9 },
              ].map((service, index) => (
                <div
                  key={index}
                  onClick={() => navigate('/search')}
                  className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                >
                  <div className="relative h-40 md:h-48 overflow-hidden">
                    <img
                      src={SERVICE_IMAGES[service.category] || HERO_IMAGES[index]}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {index === 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-nilin-success text-white text-xs font-bold rounded-full">
                        Popular
                      </div>
                    )}
                    {index === 1 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-nilin-accent text-white text-xs font-bold rounded-full">
                        Trending
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5">
                    <div className="text-xs text-nilin-primary font-bold uppercase tracking-wide mb-1 md:mb-2">
                      {service.category}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-nilin-dark mb-2">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-nilin-dark">{service.rating}</span>
                      </div>
                      <span className="text-sm text-gray-400">({Math.floor(Math.random() * 200) + 100} reviews)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg md:text-xl font-black text-nilin-dark">
                        ₹{service.price}
                        <span className="text-xs md:text-sm font-normal text-gray-400"> /service</span>
                      </div>
                      <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-nilin-primary/10 text-nilin-primary flex items-center justify-center hover:bg-nilin-primary hover:text-white transition-colors">
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile View All Button */}
          <div className="mt-6 text-center sm:hidden">
            <button
              onClick={() => navigate('/search?sortBy=rating')}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-nilin-primary text-nilin-primary rounded-full font-bold text-sm hover:bg-nilin-primary hover:text-white transition-all"
            >
              View All Services
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-nilin-dark mb-3 md:mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">Join thousands of happy customers across India</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">"{testimonial.text}"</p>
                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-nilin-dark">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-nilin-dark mb-3 md:mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 md:space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex items-center justify-between w-full p-4 md:p-6 text-left font-bold text-nilin-dark hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm md:text-base pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 text-gray-600 text-sm md:text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-gradient-nilin-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-4 md:mb-6">
            Get Expert Help in Minutes
          </h2>
          <p className="text-base md:text-lg text-white/80 mb-8 md:mb-10 max-w-2xl mx-auto">
            Join 50,000+ customers who trust NILIN for their everyday service needs. Book your first service today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/search')}
              className="px-8 py-4 bg-white text-nilin-dark rounded-full font-bold text-base md:text-lg hover:bg-gray-100 transition-colors shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
            >
              Browse Services
            </button>
            <button
              onClick={() => navigate('/register/provider')}
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-bold text-base md:text-lg hover:bg-white/10 transition-colors"
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
