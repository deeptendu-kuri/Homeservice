import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/search/SearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';
import PageLayout from '@/components/layout/PageLayout';
import { useSearchStore } from '@/store/searchStore';
import { cn } from '@/lib/utils';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);

  const { 
    setFilters, 
    performSearch, 
    getTrendingServices, 
    getPopularServices,
    filters 
  } = useSearchStore();

  // Initialize search from URL params
  useEffect(() => {
    const urlFilters: any = {};
    
    // Extract filters from URL
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy');
    const page = searchParams.get('page');

    if (query) urlFilters.q = query;
    if (category) urlFilters.category = category;
    if (city) urlFilters.city = city;
    if (minPrice) urlFilters.minPrice = Number(minPrice);
    if (maxPrice) urlFilters.maxPrice = Number(maxPrice);
    if (minRating) urlFilters.minRating = Number(minRating);
    if (sortBy) urlFilters.sortBy = sortBy;
    if (page) urlFilters.page = Number(page);

    // Set filters and perform search
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
      performSearch();
    } else {
      // Show all services initially when no filters are applied
      setFilters({});
      performSearch();
      // Also load trending and popular for sidebar/recommendations
      getTrendingServices();
      getPopularServices();
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.q) params.set('q', filters.q);
    if (filters.category) params.set('category', filters.category);
    if (filters.city) params.set('city', filters.city);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.sortBy && filters.sortBy !== 'popularity') params.set('sortBy', filters.sortBy);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearch = (query: string) => {
    // Analytics or tracking can be added here
    console.log('Search performed:', query);
  };

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setLayout(newLayout);
  };

  return (
    <PageLayout 
      showBreadcrumb={true}
      className="bg-gray-50"
      breadcrumbItems={[
        { label: 'Home', href: '/' },
        { label: 'Search Services', current: true }
      ]}
    >
      {/* Custom Header with Search Bar */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg mb-8 -mt-6">
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <SearchBar
              size="lg"
              showLocationFilter={true}
              onSearch={handleSearch}
              placeholder="What service are you looking for?"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={cn(
          'lg:w-80 flex-shrink-0',
          isFiltersCollapsed && 'lg:w-auto'
        )}>
          <div className="sticky top-8">
            <SearchFilters
              isCollapsed={isFiltersCollapsed}
              onToggle={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 min-w-0">
          <SearchResults
            layout={layout}
            onLayoutChange={handleLayoutChange}
            showLayoutToggle={true}
          />
        </div>
      </div>

      {/* Quick Search Categories (shown when no search) */}
      {!filters.q && (
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {[
                { name: 'Cleaning', icon: '🧹', category: 'cleaning' },
                { name: 'Plumbing', icon: '🔧', category: 'plumbing' },
                { name: 'Electrical', icon: '⚡', category: 'electrical' },
                { name: 'Painting', icon: '🎨', category: 'painting' },
                { name: 'Gardening', icon: '🌱', category: 'gardening' },
                { name: 'Handyman', icon: '🔨', category: 'handyman' },
                { name: 'Moving', icon: '📦', category: 'moving' },
                { name: 'Tutoring', icon: '📚', category: 'tutoring' },
                { name: 'Fitness', icon: '💪', category: 'fitness' },
                { name: 'Beauty', icon: '💄', category: 'beauty' },
              ].map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    setFilters({ category: cat.category, page: 1 });
                    performSearch();
                  }}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SearchPage;