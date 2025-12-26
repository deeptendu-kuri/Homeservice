import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import ServiceCard from '../components/customer/ServiceCard';
import type { Service } from '../components/customer/ServiceCard';
import { searchApi } from '../services/searchApi';
import {
  SlidersHorizontal, X, Tag, Award, CheckCircle, TrendingUp,
  Grid3x3, List, ChevronLeft, ChevronRight, Search, Sparkles
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination state
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Fetch categories from API (single source of truth)
  const { categories: apiCategories, isLoading: categoriesLoading } = useCategories();

  // Transform categories for filters
  const categories = useMemo(() => {
    return apiCategories.map(cat => cat.name);
  }, [apiCategories]);

  // Transform for category chips/buttons
  const categoryList = useMemo(() => {
    return apiCategories.map(cat => ({
      value: cat.name,
      label: cat.name,
      icon: cat.icon || '📦'
    }));
  }, [apiCategories]);

  const hasActiveFilters = () => {
    return selectedCategories.length > 0 || priceRange[1] !== 10000 || minRating > 0 || sortBy !== 'popularity';
  };

  const getTrustBadges = (service: Service) => {
    const badges = [];
    const avgRating = typeof service.rating === 'object' ? service.rating?.average || 0 : service.rating || 0;
    const ratingCount = typeof service.rating === 'object' ? service.rating?.count || 0 : 0;

    if (avgRating >= 4.5) badges.push({ icon: Award, text: 'Top Rated', color: 'bg-amber-50 text-amber-700 border-amber-200' });
    if (ratingCount >= 50) badges.push({ icon: TrendingUp, text: 'Popular', color: 'bg-pink-50 text-pink-700 border-pink-200' });
    if (service.provider?.isVerified) badges.push({ icon: CheckCircle, text: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
    return badges;
  };

  // Sync URL params with filter states on initial load
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && selectedCategories.length === 0) {
      const capitalizedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategories([capitalizedCategory]);
    }
  }, []);

  // Fetch services based on filters and pagination
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const query = searchParams.get('q') || '';
        const categoryParam = searchParams.get('category');

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
          page: pagination.page,
          limit: pagination.limit,
        });

        if (response.success && response.data.services) {
          setServices(response.data.services);
          if (response.data.pagination) {
            setPagination(prev => ({
              ...prev,
              total: response.data.pagination!.total,
              pages: response.data.pagination!.pages
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams, selectedCategories, priceRange, minRating, sortBy, pagination.page]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? [] : [category]);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSortBy('popularity');
    setPagination(prev => ({ ...prev, page: 1 }));
    setSearchParams({});
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { page, pages: totalPages } = pagination;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const FilterSidebar = () => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Clear all
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="category"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="10000"
            step="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">AED 0</span>
            <span className="px-2 py-1 bg-indigo-50 rounded text-indigo-700 font-medium">AED {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-5">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Minimum Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(rating)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                minRating === rating
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating === 0 ? 'All' : `${rating}+ ⭐`}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="popularity">Most Popular</option>
          <option value="price">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );

  // Pagination Component
  const PaginationControls = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        {/* Results info */}
        <p className="text-sm text-gray-500 order-2 sm:order-1">
          Showing <span className="font-medium text-gray-900">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
          <span className="font-medium text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
          <span className="font-medium text-gray-900">{pagination.total}</span> services
        </p>

        {/* Page controls */}
        <div className="flex items-center gap-1 order-1 sm:order-2">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum as number)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${
                    pagination.page === pageNum
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <NavigationHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <span className="text-white/80 text-sm font-medium">Discover Premium Services</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            {searchParams.get('q')
              ? `Results for "${searchParams.get('q')}"`
              : searchParams.get('category')
                ? `${searchParams.get('category')} Services`
                : 'Browse All Services'
            }
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            {pagination.total > 0
              ? `${pagination.total} professional services available`
              : 'Find the perfect service for your needs'
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar />
          </div>

          {/* Results Section */}
          <div className="min-w-0">
            {/* Category Quick Chips - Mobile Friendly */}
            <div className="mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryList.slice(0, 6).map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryToggle(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedCategories.includes(cat.value)
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters() && (
              <div className="mb-5 flex flex-wrap gap-2 items-center">
                {selectedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium hover:bg-indigo-200 transition-colors"
                  >
                    <span>{category}</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                ))}
                {priceRange[1] !== 10000 && (
                  <button
                    onClick={() => setPriceRange([0, 10000])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
                  >
                    <span>Max: AED {priceRange[1].toLocaleString()}</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {minRating > 0 && (
                  <button
                    onClick={() => setMinRating(0)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
                  >
                    <span>{minRating}+ ⭐</span>
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline ml-1">
                  Clear all
                </button>
              </div>
            )}

            {/* Results Header - Mobile Optimized */}
            <div className="mb-5 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-gray-600 text-sm">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full"></span>
                        Loading...
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-gray-900 text-lg">{pagination.total}</span>
                        <span className="ml-1">services found</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View toggle - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <Grid3x3 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                    >
                      <List className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="popularity">Popular</option>
                    <option value="price">Price ↑</option>
                    <option value="price_desc">Price ↓</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded-lg animate-pulse w-3/4" />
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length > 0 ? (
              <>
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
                  : "space-y-4"
                }>
                  {services.map((service) => (
                    <div key={service._id} className="relative group">
                      <ServiceCard service={service} />
                      {/* Trust Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {getTrustBadges(service).slice(0, 2).map((badge, idx) => (
                          <span
                            key={idx}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${badge.color}`}
                          >
                            <badge.icon className="h-3 w-3" />
                            <span className="hidden sm:inline">{badge.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <PaginationControls />
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 md:p-12 text-center border border-gray-100">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    Try adjusting your filters or browse popular categories below.
                  </p>

                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="mb-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}

                  <div className="flex flex-wrap gap-2 justify-center">
                    {categoryList.slice(0, 4).map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          clearFilters();
                          handleCategoryToggle(cat.value);
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
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter FAB */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 z-40 hover:bg-indigo-700 transition-colors"
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span>Filters</span>
        {hasActiveFilters() && (
          <span className="ml-1 w-5 h-5 bg-white text-indigo-600 text-xs font-bold rounded-full flex items-center justify-center">
            {selectedCategories.length + (priceRange[1] !== 10000 ? 1 : 0) + (minRating > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setShowMobileFilters(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Show {pagination.total} Results
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;
