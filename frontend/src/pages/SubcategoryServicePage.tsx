import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { useCategory } from '../hooks/useCategories';
import { useProvidersBySubcategory } from '../hooks/useProvider';
import ServiceHero from '../components/service/ServiceHero';
import WhatsIncluded from '../components/service/WhatsIncluded';
import HowItWorksSection from '../components/service/HowItWorksSection';
import RecommendedProviders from '../components/service/RecommendedProviders';
import PricingSection from '../components/service/PricingSection';

// Loading skeleton
const ServicePageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#FAF8F5]">
    <NavigationHeader />
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[420px] md:h-[500px] bg-gradient-to-r from-gray-300 to-gray-200" />
      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded-lg w-56 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Not found component
const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <NavigationHeader />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <Home className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
          Service not found
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The service you're looking for doesn't exist or may have been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// Breadcrumb component
const Breadcrumb: React.FC<{
  items: { label: string; href?: string }[];
}> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {item.href ? (
            <button
              onClick={() => navigate(item.href!)}
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const SubcategoryServicePage: React.FC = () => {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  const navigate = useNavigate();

  // Fetch category data
  const { category, isLoading: categoryLoading } = useCategory(categorySlug);

  // Fetch providers for this subcategory
  const { providers, isLoading: providersLoading } = useProvidersBySubcategory(
    categorySlug,
    subcategorySlug,
    { limit: 10 }
  );

  // Find the subcategory from the category
  const subcategory = useMemo(() =>
    category?.subcategories?.find((s: any) => s.slug === subcategorySlug),
    [category, subcategorySlug]
  );

  // Transform providers data to match component interface
  const transformedProviders = useMemo(() => {
    if (!providers) return [];
    return providers.map((provider: any) => ({
      id: provider.id || provider._id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      businessName: provider.businessName,
      profilePhoto: provider.profilePhoto,
      tier: provider.tier || 'standard',
      rating: provider.rating || 0,
      reviewCount: provider.reviewCount || 0,
      isVerified: provider.isVerified || false,
      startingPrice: provider.startingPrice || subcategory?.metadata?.averagePrice || 500,
      maxPrice: provider.maxPrice || (provider.startingPrice ? provider.startingPrice + 150 : 650),
    }));
  }, [providers, subcategory]);

  // Handle "Book this service" click - navigate to search for this subcategory
  const handleBookClick = () => {
    if (transformedProviders.length > 0) {
      // Navigate to first provider's detail page where they can book
      const provider = transformedProviders[0];
      navigate(`/provider/${provider.id}`);
    } else {
      // Navigate to search for this subcategory
      navigate(`/search?category=${categorySlug}&subcategory=${subcategorySlug}`);
    }
  };

  // Handle provider card click - go to provider detail page (hybrid approach: can book from there)
  const handleProviderClick = (provider: any) => {
    navigate(`/provider/${provider.id}`);
  };

  // Handle "View Profile" click
  const handleViewProfile = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  if (categoryLoading) {
    return <ServicePageSkeleton />;
  }

  if (!category || !subcategory) {
    return <NotFound />;
  }

  // Extract metadata
  const metadata = subcategory.metadata || {};
  const heroTitle = metadata.heroTitle || `${subcategory.name} at Home`;
  const heroSubtitle = metadata.heroSubtitle || 'Professional, verified specialists at your location';
  const heroImage = metadata.heroImage;
  const startingPrice = metadata.averagePrice || 500;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <NavigationHeader />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: category.name, href: `/category/${categorySlug}` },
                  { label: subcategory.metadata?.displayName || subcategory.name },
                ]}
              />
              <button
                onClick={() => navigate(`/category/${categorySlug}`)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to {category.name}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <ServiceHero
          title={heroTitle}
          subtitle={heroSubtitle}
          image={heroImage}
          onBookClick={handleBookClick}
          disabled={false}
        />

        {/* What's Included */}
        <WhatsIncluded />

        {/* How NILIN Works */}
        <HowItWorksSection />

        {/* Recommended Professionals */}
        <RecommendedProviders
          providers={transformedProviders}
          isLoading={providersLoading}
          onProviderClick={handleProviderClick}
          onViewProfile={handleViewProfile}
        />

        {/* Pricing Section */}
        <PricingSection
          startingPrice={startingPrice}
          currency="AED"
        />
      </main>

      <Footer />
    </div>
  );
};

export default SubcategoryServicePage;
