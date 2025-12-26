import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Folder } from 'lucide-react';
import NavigationHeader from '../components/layout/NavigationHeader';
import Footer from '../components/layout/Footer';
import { useCategory } from '../hooks/useCategories';
import SubcategoryCard from '../components/category/SubcategoryCard';
import TrustBadges from '../components/category/TrustBadges';

// Loading skeleton for the category page
const CategoryPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#FAF8F5]">
    <NavigationHeader />
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="animate-pulse">
        {/* Back button skeleton */}
        <div className="h-10 bg-gray-200 rounded-xl w-24 mb-8" />
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-3" />
          <div className="h-5 bg-gray-100 rounded w-80 mx-auto" />
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-40 border border-gray-100" />
          ))}
        </div>
        {/* Trust badges skeleton */}
        <div className="h-20 bg-white rounded-2xl border border-gray-100" />
      </div>
    </div>
  </div>
);

// Not found component
const CategoryNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <NavigationHeader />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <Folder className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-4">
          Category not found
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The category you're looking for doesn't exist or may have been moved.
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

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { category, isLoading, error } = useCategory(slug);

  if (isLoading) {
    return <CategoryPageSkeleton />;
  }

  if (error || !category) {
    return <CategoryNotFound />;
  }

  const handleSubcategoryClick = (subcategorySlug: string) => {
    navigate(`/service/${slug}/${subcategorySlug}`);
  };

  // Get display config from metadata
  const displayConfig = category.metadata?.displayConfig || {};
  const tagline = displayConfig.tagline || 'Premium services, handpicked by NILIN';

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <NavigationHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: category.name },
            ]}
          />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>

        {/* Category Header */}
        <header className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-gray-900 mb-3">
            {category.name}
          </h1>
          <p className="text-gray-500 text-base md:text-lg max-w-lg mx-auto">
            {tagline}
          </p>
        </header>

        {/* Subcategory Grid - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-12">
          {category.subcategories && category.subcategories.length > 0 ? (
            category.subcategories
              .filter((sub: any) => sub.isActive !== false)
              .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((subcategory: any) => (
                <SubcategoryCard
                  key={subcategory.slug}
                  subcategory={subcategory}
                  onClick={() => handleSubcategoryClick(subcategory.slug)}
                />
              ))
          ) : (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Folder className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No services available in this category yet.</p>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <TrustBadges />
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
