import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, TrendingUp, Clock } from 'lucide-react';

const ProviderCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 mb-8 md:mb-12 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-nilin-dark via-indigo-900 to-nilin-primary" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-nilin-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-nilin-accent/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Work anytime, earn more,
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-nilin-pink via-nilin-lavender to-nilin-blue bg-clip-text text-transparent">
                grow your business
              </span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 mb-6 max-w-lg mx-auto lg:mx-0">
              Flexible work. Higher income. Smart tools to grow. Join thousands of professionals on NILIN.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Clock className="w-4 h-4 text-nilin-pink" />
                <span className="text-sm text-white">Flexible Hours</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <TrendingUp className="w-4 h-4 text-nilin-success" />
                <span className="text-sm text-white">Higher Earnings</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                <Briefcase className="w-4 h-4 text-nilin-lavender" />
                <span className="text-sm text-white">Smart Tools</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/register/provider')}
              className="group flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-nilin-dark rounded-xl font-bold hover:shadow-2xl hover:shadow-white/20 transition-all text-base sm:text-lg"
            >
              Join as Provider
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderCTA;
