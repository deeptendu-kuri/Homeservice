import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import ServiceCard from '../components/customer/ServiceCard';
import type { Service } from '../components/customer/ServiceCard';
import { searchApi } from '../services/searchApi';
import { SlidersHorizontal, X, ChevronDown, Tag, Award, Zap, CheckCircle, Calendar, TrendingUp, Grid3x3, List } from 'lucide-react';
import { SERVICE_CATEGORIES, CATEGORY_LIST, getCategoryIcon } from '../constants/categories';
import Breadcrumb from '../components/common/Breadcrumb';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity');

  const categories = SERVICE_CATEGORIES;

  // Helper function to check if filters are active
  const hasActiveFilters = () => {
    return selectedCategories.length > 0 || priceRange[1] !== 10000 || minRating > 0 || sortBy !== 'popularity';
  };

  // Helper function to get trust badges for a service
  const getTrustBadges = (service: Service) => {
    const badges = [];
    if (service.rating?.average >= 4.5) badges.push({ icon: Award, text: 'Top Rated', color: 'bg-yellow-100 text-yellow-700' });
    if (service.rating?.count >= 50) badges.push({ icon: TrendingUp, text: 'Popular', color: 'bg-pink-100 text-pink-700' });
    if (service.provider?.isVerified) badges.push({ icon: CheckCircle, text: 'Verified', color: 'bg-blue-100 text-blue-700' });
    return badges;
  };

  // Sync URL params with filter states on initial load
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && selectedCategories.length === 0) {
      // Capitalize first letter to match backend format
      const capitalizedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategories([capitalizedCategory]);
    }
  }, [searchParams.get('category')]);

  // Fetch services based on filters
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const query = searchParams.get('q') || '';
        const categoryParam = searchParams.get('category');

        // Use the first selected category, or the category from URL params
        const categoryToUse = selectedCategories.length > 0
          ? selectedCategories[0]
          : (categoryParam || undefined);

        const response = await searchApi.searchServices({
          q: query,
          category: categoryToUse,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          minRating: minRating > 0 ? minRating : undefined,
          sortBy: sortBy as any,
        });

        if (response.success && response.data.services) {
          setServices(response.data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams, selectedCategories, priceRange, minRating, sortBy]);

  const handleCategoryToggle = (category: string) => {
    // API only supports single category, so use radio button behavior
    // Keep the original capitalization from CATEGORY_LIST
    setSelectedCategories(prev =>
      prev.includes(category) ? [] : [category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSortBy('popularity');
    // Clear URL params as well
    setSearchParams({});
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === rating}
                onChange={() => setMinRating(rating)}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                {rating}+ ⭐
              </span>
            </label>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={minRating === 0}
              onChange={() => setMinRating(0)}
              className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">All Ratings</span>
          </label>
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity">Popularity</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <NavigationHeader />

      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Results Section */}
          <div className="min-w-0">
            {/* Category Quick Chips */}
            <div className="mb-6 overflow-hidden">
              <div className="overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-3">
                  {CATEGORY_LIST.slice(0, 8).map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategoryToggle(cat.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap flex-shrink-0 ${
                        selectedCategories.includes(cat.value)
                          ? 'bg-gradient-nilin-primary border-transparent text-gray-900 font-semibold shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters() && (
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                {selectedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    <span className="capitalize">{category}</span>
                    <X className="h-3 w-3" />
                  </button>
                ))}
                {priceRange[1] !== 10000 && (
                  <button
                    onClick={() => setPriceRange([0, 10000])}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    <span>Max: ₹{priceRange[1]}</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                {minRating > 0 && (
                  <button
                    onClick={() => setMinRating(0)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 transition-colors"
                  >
                    <span>{minRating}+ ⭐</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Enhanced Results Header */}
            <div className="mb-6 bg-white rounded-xl p-4 border border-gray-200 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
                  {searchParams.get('q')
                    ? `Results for "${searchParams.get('q')}"`
                    : searchParams.get('category')
                      ? `${searchParams.get('category')} Services`
                      : 'All Services'
                  }
                </h2>
                <p className="text-gray-600 text-sm">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-pink-500 border-t-transparent rounded-full"></span>
                      Loading services...
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-900">{services.length}</span> service{services.length !== 1 ? 's' : ''} found
                      {hasActiveFilters() && <span className="text-gray-500"> • Filtered results</span>}
                    </>
                  )}
                </p>
              </div>

              {/* View Mode Toggle & Sort */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                    title="List view"
                  >
                    <List className="h-4 w-4 text-gray-700" />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-0"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {/* Service Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="h-48 bg-gray-200 animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-4"
              }>
                {services.map((service) => (
                  <div key={service._id} className="relative">
                    <ServiceCard service={service} />
                    {/* Trust Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {getTrustBadges(service).map((badge, idx) => (
                        <span
                          key={idx}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color} shadow-sm`}
                        >
                          <badge.icon className="h-3 w-3" />
                          {badge.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Tag className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No services found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any services matching your criteria. Try adjusting your filters or browse our popular categories.
                  </p>

                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="mb-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
                    >
                      Clear All Filters
                    </button>
                  )}

                  {/* Popular Categories Suggestion */}
                  <div className="mt-8">
                    <p className="text-sm text-gray-500 mb-4">Try browsing these popular categories:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {CATEGORY_LIST.slice(0, 4).map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            clearFilters();
                            handleCategoryToggle(cat.value.toLowerCase());
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-gradient-nilin-primary text-gray-900 px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 z-50 hover:shadow-xl transition-shadow"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters
        {hasActiveFilters() && (
          <span className="ml-1 px-2 py-0.5 bg-pink-600 text-white text-xs rounded-full">
            {selectedCategories.length + (priceRange[1] !== 10000 ? 1 : 0) + (minRating > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterSidebar />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full mt-6 px-6 py-3 bg-gradient-nilin-primary text-gray-900 rounded-lg font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;
