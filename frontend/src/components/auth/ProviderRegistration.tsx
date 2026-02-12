import React, { useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCategories } from '../../hooks/useCategories';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building,
  MapPin,
  Briefcase,
  Upload,
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import NavigationHeader from '../layout/NavigationHeader';
import Footer from '../layout/Footer';

// Validation schema for provider registration
const providerRegistrationSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character'),
  
  confirmPassword: z.string(),
  
  phone: z.string()
    .regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && birthDate < today;
    }, 'You must be at least 18 years old to become a provider'),

  // Business Information
  businessInfo: z.object({
    businessName: z.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name cannot exceed 100 characters'),
    
    businessType: z.enum(['individual', 'small_business', 'company', 'franchise']),
    
    description: z.string()
      .min(50, 'Business description must be at least 50 characters')
      .max(1000, 'Business description cannot exceed 1000 characters'),
    
    tagline: z.string().max(100, 'Tagline cannot exceed 100 characters').optional(),
    
    website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    
    establishedDate: z.string().optional(),
    
    serviceRadius: z.number().min(1, 'Service radius must be at least 1 km').max(100, 'Service radius cannot exceed 100 km').default(25),
  }),

  // Location Information
  locationInfo: z.object({
    primaryAddress: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zipCode: z.string().min(1, 'ZIP code is required'),
      country: z.string().default('AE'),
    }),
    mobileService: z.boolean().default(true),
    hasFixedLocation: z.boolean().default(false),
  }),

  // Services
  services: z.array(z.object({
    name: z.string().min(1, 'Service name is required').max(100, 'Service name cannot exceed 100 characters'),
    category: z.string().min(1, 'Service category is required'),
    subcategory: z.string().optional(),
    description: z.string().min(1, 'Service description is required').max(500, 'Service description cannot exceed 500 characters'),
    duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 480 minutes'),
    price: z.object({
      amount: z.number().min(0, 'Price cannot be negative'),
      currency: z.string().default('AED'),
      type: z.enum(['fixed', 'hourly', 'custom']).default('fixed'),
    }),
    tags: z.array(z.string()).optional(),
  })).min(1, 'At least one service is required'),

  // Agreements
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy'
  }),
  
  agreeToBackground: z.boolean().refine((val) => val === true, {
    message: 'Background check agreement is required for providers'
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProviderRegistrationForm = z.infer<typeof providerRegistrationSchema>;

const STEPS = [
  { id: 1, name: 'Personal Info', icon: User },
  { id: 2, name: 'Business Info', icon: Building },
  { id: 3, name: 'Location', icon: MapPin },
  { id: 4, name: 'Services', icon: Briefcase },
  { id: 5, name: 'Documents', icon: Upload },
  { id: 6, name: 'Review', icon: FileText },
];

const ProviderRegistration: React.FC = () => {
  // Fetch categories from API (single source of truth)
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Transform categories for dropdowns
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      subcategories: cat.subcategories?.map(sub => sub.name) || []
    }));
  }, [categories]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [files, setFiles] = useState<{[key: string]: File[]}>({
    identityDocument: [],
    businessLicense: [],
    certifications: [],
    portfolio: [],
  });

  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  
  const { registerProvider, isLoading, errors } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<ProviderRegistrationForm>({
    resolver: zodResolver(providerRegistrationSchema),
    defaultValues: {
      businessInfo: {
        businessType: 'individual',
        serviceRadius: 25,
      },
      locationInfo: {
        primaryAddress: {
          country: 'AE',
        },
        mobileService: true,
        hasFixedLocation: false,
      },
      services: [
        {
          price: {
            currency: 'AED',
            type: 'fixed',
            amount: 0,
          },
          duration: 60,
        }
      ],
      agreeToTerms: false,
      agreeToPrivacy: false,
      agreeToBackground: false,
    },
    mode: 'onChange',
  });

  const watchedServices = watch('services');

  const handleFileChange = (fieldName: string, selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles(prev => ({
        ...prev,
        [fieldName]: fileArray,
      }));
    }
  };

  const removeFile = (fieldName: string, index: number) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const addService = () => {
    const currentServices = getValues('services');
    setValue('services', [
      ...currentServices,
      {
        name: '',
        category: '',
        subcategory: '',
        description: '',
        duration: 60,
        price: {
          amount: 0,
          currency: 'AED',
          type: 'fixed' as const,
        },
        tags: [],
      }
    ]);
  };

  const removeService = (index: number) => {
    const currentServices = getValues('services');
    if (currentServices.length > 1) {
      setValue('services', currentServices.filter((_, i) => i !== index));
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getFieldsForStep = (step: number): (keyof ProviderRegistrationForm)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 'dateOfBirth'];
      case 2:
        return ['businessInfo'];
      case 3:
        return ['locationInfo'];
      case 4:
        return ['services'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: ProviderRegistrationForm) => {
    try {
      console.log('🚀 Provider registration form submitted');
      console.log('📋 Form data:', data);
      console.log('📁 Files:', files);
      
      clearErrors();

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add files to FormData
      Object.entries(files).forEach(([fieldName, fileList]) => {
        fileList.forEach(file => {
          formData.append(fieldName, file);
          console.log(`📎 Added file: ${fieldName} - ${file.name}`);
        });
      });

      console.log('🔄 Calling registerProvider...');
      await registerProvider({
        ...data,
        role: 'provider' as const // ✅ FIXED: Add role field for type compatibility
      }, formData);
      console.log('✅ Registration successful, navigating to dashboard...');
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('❌ Provider registration failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      if (errors && errors.length > 0) {
        console.log('🔍 Auth store errors:', errors);
        errors.forEach(err => {
          if (err.field) {
            setError(err.field as keyof ProviderRegistrationForm, {
              type: 'server',
              message: err.message,
            });
          }
        });
      }

      // Always set a root-level error so the banner shows
      setError('root' as any, {
        type: 'server',
        message: errorMessage,
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep 
          register={register} 
          formErrors={formErrors} 
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />;
      
      case 2:
        return <BusinessInfoStep 
          register={register} 
          formErrors={formErrors} 
        />;
      
      case 3:
        return <LocationInfoStep 
          register={register} 
          formErrors={formErrors} 
          watch={watch}
        />;
      
      case 4:
        return <ServicesStep
          register={register}
          formErrors={formErrors}
          services={watchedServices}
          addService={addService}
          removeService={removeService}
          categoriesLoading={categoriesLoading}
          categoryOptions={categoryOptions}
          watchedServices={watchedServices}
        />;
      
      case 5:
        return <DocumentsStep 
          files={files}
          handleFileChange={handleFileChange}
          removeFile={removeFile}
          fileInputRefs={fileInputRefs}
        />;
      
      case 6:
        return <ReviewStep 
          data={getValues()}
          files={files}
          register={register}
          formErrors={formErrors}
        />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#FFE5F0] via-[#E8E5FF] to-[#E5F3FF]">
      <NavigationHeader />
      <div className="flex-1 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">NILIN</h1>
            <p className="text-sm text-gray-500 mt-1">Beauty & Wellness at your doorstep</p>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Become a Service Provider
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Join our platform and grow your business
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : isCompleted
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div
                      className={`text-sm font-medium ${
                        isActive ? 'text-gray-700' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`hidden sm:block w-12 h-0.5 ml-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-8">
              {(formErrors as any).root && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">{(formErrors as any).root.message}</p>
                </div>
              )}
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E8E5FF] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E8E5FF]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🎯 Complete Registration button clicked');
                    console.log('📊 Form state:', {
                      isSubmitting,
                      isLoading,
                      hasErrors: Object.keys(formErrors).length > 0,
                      formErrors: formErrors
                    });
                    handleSubmit(onSubmit)(e);
                  }}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Error Display */}
        {errors && errors.length > 0 && (
          <div className="mt-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please correct the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">
            Sign in here
          </Link>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

// Step Components
const PersonalInfoStep = ({ register, formErrors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: any) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            {...register('firstName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
            placeholder="John"
          />
          {formErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            {...register('lastName')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
            placeholder="Doe"
          />
          {formErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address *
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
          placeholder="john@example.com"
        />
        {formErrors.email && (
          <p className="mt-1 text-sm text-red-600">{formErrors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600">{formErrors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
            placeholder="+971 50 123 4567"
          />
          {formErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{formErrors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            {...register('dateOfBirth')}
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
          />
          {formErrors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{formErrors.dateOfBirth.message}</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const BusinessInfoStep = ({ register, formErrors }: any) => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Business Name *
      </label>
      <input
        {...register('businessInfo.businessName')}
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
        placeholder="Your Business Name"
      />
      {formErrors.businessInfo?.businessName && (
        <p className="mt-1 text-sm text-red-600">{formErrors.businessInfo.businessName.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Business Type *
      </label>
      <select
        {...register('businessInfo.businessType')}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
      >
        <option value="individual">Individual</option>
        <option value="small_business">Small Business</option>
        <option value="company">Company</option>
        <option value="franchise">Franchise</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Business Description *
      </label>
      <textarea
        {...register('businessInfo.description')}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
        placeholder="Describe your business and what makes it unique (minimum 50 characters)"
      />
      {formErrors.businessInfo?.description && (
        <p className="mt-1 text-sm text-red-600">{formErrors.businessInfo.description.message}</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Tagline (Optional)
      </label>
      <input
        {...register('businessInfo.tagline')}
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
        placeholder="A catchy tagline for your business"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website (Optional)
        </label>
        <input
          {...register('businessInfo.website')}
          type="url"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
          placeholder="https://yourwebsite.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Radius (km) *
        </label>
        <input
          {...register('businessInfo.serviceRadius', { valueAsNumber: true })}
          type="number"
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
          placeholder="25"
        />
      </div>
    </div>
  </div>
);

const LocationInfoStep = ({ register, formErrors, watch }: any) => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Location Information</h2>
    
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Primary Business Address</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            {...register('locationInfo.primaryAddress.street')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
            placeholder="Al Wasl Road, Jumeirah"
          />
          {formErrors.locationInfo?.primaryAddress?.street && (
            <p className="mt-1 text-sm text-red-600">{formErrors.locationInfo.primaryAddress.street.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              {...register('locationInfo.primaryAddress.city')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="Dubai"
            />
            {formErrors.locationInfo?.primaryAddress?.city && (
              <p className="mt-1 text-sm text-red-600">{formErrors.locationInfo.primaryAddress.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emirate *
            </label>
            <input
              {...register('locationInfo.primaryAddress.state')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="Dubai"
            />
            {formErrors.locationInfo?.primaryAddress?.state && (
              <p className="mt-1 text-sm text-red-600">{formErrors.locationInfo.primaryAddress.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              P.O. Box / ZIP *
            </label>
            <input
              {...register('locationInfo.primaryAddress.zipCode')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="00000"
            />
            {formErrors.locationInfo?.primaryAddress?.zipCode && (
              <p className="mt-1 text-sm text-red-600">{formErrors.locationInfo.primaryAddress.zipCode.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              {...register('locationInfo.primaryAddress.country')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
            >
              <option value="AE">United Arab Emirates</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Service Options</h3>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            {...register('locationInfo.mobileService')}
            type="checkbox"
            className="h-4 w-4 text-gray-700 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700">
              Mobile Service
            </label>
            <p className="text-sm text-gray-500">I travel to customers' locations</p>
          </div>
        </div>

        <div className="flex items-center">
          <input
            {...register('locationInfo.hasFixedLocation')}
            type="checkbox"
            className="h-4 w-4 text-gray-700 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700">
              Fixed Location
            </label>
            <p className="text-sm text-gray-500">Customers visit my business location</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ServicesStep = ({ register, formErrors, services, addService, removeService, categoriesLoading, categoryOptions, watchedServices }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-medium text-gray-900">Services Offered</h2>
      <button
        type="button"
        onClick={addService}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-[#E8E5FF]/40 hover:bg-[#E8E5FF]/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Service
      </button>
    </div>

    <div className="space-y-6">
      {services.map((_: any, index: number) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium text-gray-900">Service {index + 1}</h3>
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-red-600 hover:text-red-500 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name *
              </label>
              <input
                {...register(`services.${index}.name`)}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
                placeholder="e.g., Deep Cleaning Service"
              />
              {formErrors.services?.[index]?.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.services[index].name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register(`services.${index}.category`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {categoryOptions.map((cat: any) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {formErrors.services?.[index]?.category && (
                <p className="mt-1 text-sm text-red-600">{formErrors.services[index].category.message}</p>
              )}
            </div>

            {/* Subcategory dropdown - filtered by selected category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                {...register(`services.${index}.subcategory`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
                disabled={!watchedServices?.[index]?.category}
              >
                <option value="">Select a subcategory (optional)</option>
                {watchedServices?.[index]?.category &&
                  categoryOptions
                    .find((cat: any) => cat.name === watchedServices[index].category)
                    ?.subcategories.map((sub: string) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                }
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register(`services.${index}.description`)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              placeholder="Describe what this service includes"
            />
            {formErrors.services?.[index]?.description && (
              <p className="mt-1 text-sm text-red-600">{formErrors.services[index].description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                {...register(`services.${index}.duration`, { valueAsNumber: true })}
                type="number"
                min="15"
                max="480"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
                placeholder="60"
              />
              {formErrors.services?.[index]?.duration && (
                <p className="mt-1 text-sm text-red-600">{formErrors.services[index].duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (AED) *
              </label>
              <input
                {...register(`services.${index}.price.amount`, { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
                placeholder="50.00"
              />
              {formErrors.services?.[index]?.price?.amount && (
                <p className="mt-1 text-sm text-red-600">{formErrors.services[index].price.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Type *
              </label>
              <select
                {...register(`services.${index}.price.type`)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#E8E5FF] focus:border-[#E8E5FF]"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Per Hour</option>
                <option value="custom">Custom Quote</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DocumentsStep = ({ files, handleFileChange, removeFile, fileInputRefs }: any) => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h2>

    <div className="grid grid-cols-1 gap-6">
      {/* Identity Document */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Identity Document (Required)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Upload a government-issued ID (driver's license, passport, etc.)
            </p>
            <input
              ref={el => fileInputRefs.current['identityDocument'] = el}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => handleFileChange('identityDocument', e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current['identityDocument']?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose File
            </button>
          </div>
          {files.identityDocument.length > 0 && (
            <div className="mt-4">
              {files.identityDocument.map((file: File, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('identityDocument', index)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business License */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Business License (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Upload your business license if applicable
            </p>
            <input
              ref={el => fileInputRefs.current['businessLicense'] = el}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => handleFileChange('businessLicense', e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current['businessLicense']?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose File
            </button>
          </div>
          {files.businessLicense.length > 0 && (
            <div className="mt-4">
              {files.businessLicense.map((file: File, index: number) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile('businessLicense', index)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Images */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Portfolio Images (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Upload images showcasing your work (up to 10 images)
            </p>
            <input
              ref={el => fileInputRefs.current['portfolio'] = el}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={e => handleFileChange('portfolio', e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current['portfolio']?.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Choose Images
            </button>
          </div>
          {files.portfolio.length > 0 && (
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-2">
                {files.portfolio.map((file: File, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile('portfolio', index)}
                      className="text-red-600 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ReviewStep = ({ data, files, register, formErrors }: any) => (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h2>

    <div className="bg-gray-50 p-6 rounded-lg space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Personal Information</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Name:</dt>
            <dd className="text-gray-900">{data.firstName} {data.lastName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Email:</dt>
            <dd className="text-gray-900">{data.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Phone:</dt>
            <dd className="text-gray-900">{data.phone}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Date of Birth:</dt>
            <dd className="text-gray-900">{data.dateOfBirth}</dd>
          </div>
        </dl>
      </div>

      {/* Business Information */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Business Information</h3>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-700">Business Name:</dt>
            <dd className="text-gray-900">{data.businessInfo?.businessName}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Business Type:</dt>
            <dd className="text-gray-900 capitalize">{data.businessInfo?.businessType?.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Description:</dt>
            <dd className="text-gray-900">{data.businessInfo?.description}</dd>
          </div>
        </dl>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Services</h3>
        <div className="space-y-3">
          {data.services?.map((service: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-900">{service.name}</h4>
              <p className="text-sm text-gray-600">{service.category}</p>
              <p className="text-sm text-gray-600">{service.description}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-700">{service.duration} minutes</span>
                <span className="font-medium">AED {service.price?.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-3">Uploaded Documents</h3>
        <div className="space-y-2 text-sm">
          {Object.entries(files).map(([fieldName, fileList]) => (
            <div key={fieldName} className="flex justify-between">
              <span className="font-medium text-gray-700 capitalize">
                {fieldName.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-900">
                {Array.isArray(fileList) ? fileList.length : 0} file(s)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-3">
        <h3 className="text-md font-medium text-gray-900 mb-3">Required Agreements</h3>
        
        <div className="flex items-start">
          <input
            {...register('agreeToTerms')}
            type="checkbox"
            className="h-4 w-4 text-gray-700 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700">
              I agree to the Terms and Conditions *
            </label>
            <p className="text-xs text-gray-500">
              By checking this box, you agree to our terms of service and user agreement.
            </p>
          </div>
        </div>
        {formErrors.agreeToTerms && (
          <p className="ml-7 text-sm text-red-600">{formErrors.agreeToTerms.message}</p>
        )}

        <div className="flex items-start">
          <input
            {...register('agreeToPrivacy')}
            type="checkbox"
            className="h-4 w-4 text-gray-700 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700">
              I agree to the Privacy Policy *
            </label>
            <p className="text-xs text-gray-500">
              By checking this box, you agree to our privacy policy and data handling practices.
            </p>
          </div>
        </div>
        {formErrors.agreeToPrivacy && (
          <p className="ml-7 text-sm text-red-600">{formErrors.agreeToPrivacy.message}</p>
        )}

        <div className="flex items-start">
          <input
            {...register('agreeToBackground')}
            type="checkbox"
            className="h-4 w-4 text-gray-700 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <div className="ml-3">
            <label className="text-sm font-medium text-gray-700">
              I agree to Background Check *
            </label>
            <p className="text-xs text-gray-500">
              By checking this box, you consent to background verification required for service providers.
            </p>
          </div>
        </div>
        {formErrors.agreeToBackground && (
          <p className="ml-7 text-sm text-red-600">{formErrors.agreeToBackground.message}</p>
        )}
      </div>
    </div>
  </div>
);

export default ProviderRegistration;