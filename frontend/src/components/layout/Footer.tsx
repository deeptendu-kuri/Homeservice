import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-nilin-primary mb-4">
              NILIN
            </h2>
            <p className="text-gray-600 text-sm mb-4 max-w-sm">
              Your trusted partner for home services. Professional, reliable, and affordable service providers at your doorstep.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gradient-nilin-primary transition-all"
              >
                <Facebook className="h-5 w-5 text-gray-600" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gradient-nilin-primary transition-all"
              >
                <Twitter className="h-5 w-5 text-gray-600" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gradient-nilin-primary transition-all"
              >
                <Instagram className="h-5 w-5 text-gray-600" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gradient-nilin-primary transition-all"
              >
                <Linkedin className="h-5 w-5 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/search?category=cleaning" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Home Cleaning
                </Link>
              </li>
              <li>
                <Link to="/search?category=plumbing" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Plumbing
                </Link>
              </li>
              <li>
                <Link to="/search?category=electrical" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Electrical
                </Link>
              </li>
              <li>
                <Link to="/search?category=beauty" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Beauty & Spa
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  View All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/register/provider" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 text-sm hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@nilin.com" className="text-gray-600 text-sm hover:text-gray-900 transition-colors flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  support@nilin.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info - Mobile Optimized */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-nilin-primary rounded-lg">
                <Phone className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call Us</p>
                <p className="text-sm font-medium text-gray-900">1800-123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-nilin-secondary rounded-lg">
                <Mail className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Us</p>
                <p className="text-sm font-medium text-gray-900">hello@nilin.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-nilin-tertiary rounded-lg">
                <MapPin className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900">New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {currentYear} NILIN. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms
            </Link>
            <Link to="/sitemap" className="text-sm text-gray-600 hover:text-gray-900">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
