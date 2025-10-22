import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, User, LogOut, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface NavigationHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  currentLocation?: string;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  showSearch = true,
  onSearch,
  currentLocation = 'New Delhi'
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); // Clear search after navigation
    }
  };

  const handleLogout = async () => {
    // AuthService handles the redirect to homepage after logout
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-nilin-primary tracking-tight">
              NILIN
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile < 480px */}
          {showSearch && (
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-md lg:max-w-lg"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-gray-300 transition-all"
                />
              </div>
            </form>
          )}

          {/* Location Selector */}
          <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{currentLocation}</span>
          </button>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user.name || 'Account'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {user.role === 'customer' && (
                      <>
                        <Link
                          to="/search"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Search className="h-4 w-4" />
                          Browse Services
                        </Link>
                        <Link
                          to="/customer/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          My Stats
                        </Link>
                        <Link
                          to="/customer/bookings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          My Bookings
                        </Link>
                        <Link
                          to="/customer/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-nilin-primary text-gray-900 rounded-lg font-medium text-sm hover:shadow-md transition-shadow"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
