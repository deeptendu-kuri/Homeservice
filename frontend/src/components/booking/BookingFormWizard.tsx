import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Home
} from 'lucide-react';
import NavigationHeader from '../layout/NavigationHeader';
import Footer from '../layout/Footer';
import Breadcrumb from '../common/Breadcrumb';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import type { Service } from '../../types/search';
import type { CreateBookingData, BookingAddOn } from '../../services/BookingService';

// New UI Components
import DateCarousel from './ui/DateCarousel';
import TimeSlotGrid from './ui/TimeSlotGrid';
import LocationTypeSelector from './ui/LocationTypeSelector';
import DurationSelector from './ui/DurationSelector';
import ProfessionalPreference from './ui/ProfessionalPreference';
import PaymentMethodSelector from './ui/PaymentMethodSelector';
import BookingSummaryCard from './ui/BookingSummaryCard';
import TrustBadge from './ui/TrustBadge';

interface BookingFormWizardProps {
  service: Service;
  providerId: string;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

interface FormData {
  // Step 1: Date & Time
  scheduledDate: string;
  scheduledTime: string;

  // Step 2: Service Details
  locationType: 'at_home' | 'hotel';
  selectedDuration: number;
  professionalPreference: 'male' | 'female' | 'no_preference';
  specialRequests: string;

  // Step 3: Payment
  paymentMethod: 'apple_pay' | 'credit_card' | 'cash';

  // Legacy fields for compatibility
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customerInfo: {
    phone: string;
    specialRequests: string;
    accessInstructions: string;
  };
  addOns: BookingAddOn[];
}

const BookingFormWizard: React.FC<BookingFormWizardProps> = ({
  service,
  providerId,
  onSuccess,
  onCancel
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createBooking, getAvailableSlots, availableSlots, isSubmitting, isLoading, errors } = useBookingStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Get duration options from service or create default
  const durationOptions = service.durationOptions && service.durationOptions.length > 0
    ? service.durationOptions
    : [{ duration: service.duration, price: typeof service.price === 'number' ? service.price : service.price?.amount || 0, label: `${service.duration} min` }];

  const [formData, setFormData] = useState<FormData>({
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '',
    locationType: 'at_home',
    selectedDuration: durationOptions[0]?.duration || service.duration,
    professionalPreference: 'no_preference',
    specialRequests: '',
    paymentMethod: 'credit_card',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'AE'
    },
    customerInfo: {
      phone: user?.phone || '',
      specialRequests: '',
      accessInstructions: ''
    },
    addOns: []
  });

  // New step order as per mockups
  const steps = [
    { number: 1, title: 'Date & Time' },
    { number: 2, title: 'Service Details' },
    { number: 3, title: 'Payment' },
    { number: 4, title: 'Confirmation' }
  ];

  // Get current price based on selected duration
  const getCurrentPrice = () => {
    const selectedOption = durationOptions.find(opt => opt.duration === formData.selectedDuration);
    return selectedOption?.price || (typeof service.price === 'number' ? service.price : service.price?.amount || 0);
  };

  // Load available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.scheduledDate && providerId) {
        const duration = formData.selectedDuration || service.duration;
        console.log('🔍 Fetching slots for:', {
          providerId,
          date: formData.scheduledDate,
          duration
        });

        setIsFetchingSlots(true);
        await getAvailableSlots(providerId, {
          date: formData.scheduledDate,
          duration,
          days: 1
        });
        setIsFetchingSlots(false);
      }
    };

    fetchSlots();
  }, [formData.scheduledDate, formData.selectedDuration, providerId, service.duration, getAvailableSlots]);

  const handleNext = () => {
    // Validation for Step 1: Date & Time
    if (currentStep === 1) {
      if (!formData.scheduledDate) {
        alert('Please select a date');
        return;
      }
      if (!formData.scheduledTime) {
        alert('Please select a time slot');
        return;
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    console.log('📝 Submitting booking with data:', {
      serviceId: service._id,
      providerId,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      formData
    });

    // Transform data to match backend expectations
    const bookingData: CreateBookingData = {
      serviceId: service._id,
      providerId,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      location: {
        type: formData.locationType === 'at_home' ? 'customer_address' : 'provider_location',
        address: formData.address.street ? {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country || 'AE'
        } : undefined,
        notes: formData.customerInfo.accessInstructions || formData.specialRequests || undefined
      },
      customerInfo: {
        phone: formData.customerInfo.phone || user?.phone || '',
        specialRequests: formData.specialRequests || undefined,
        accessInstructions: formData.customerInfo.accessInstructions || undefined
      },
      addOns: formData.addOns,
      notes: formData.specialRequests || undefined,
      // New booking flow fields
      locationType: formData.locationType,
      selectedDuration: formData.selectedDuration,
      professionalPreference: formData.professionalPreference,
      paymentMethod: formData.paymentMethod
    };

    console.log('🚀 Sending booking data to API:', bookingData);

    try {
      const booking = await createBooking(bookingData);
      console.log('✅ Booking created successfully:', booking);

      if (booking && booking._id) {
        setBookingConfirmed(true);
        setConfirmedBookingId(booking._id);
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error('❌ Booking creation failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create booking. Please try again.';
      alert(errorMessage);
    }
  };

  // Transform availableSlots to TimeSlotGrid format
  const timeSlots = availableSlots?.map(slot => ({
    time: slot.time,
    isAvailable: slot.isAvailable
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavigationHeader />

      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb />
      </div>

      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          {!bookingConfirmed && (
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Service</h1>
              <p className="text-gray-600">Complete your booking in a few simple steps</p>
            </div>
          )}

          {/* Progress Indicator - Hide on confirmation */}
          {!bookingConfirmed && (
            <div className="mb-12">
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-[#8B9B7C] transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {steps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                          step.number < currentStep
                            ? 'bg-[#8B9B7C] text-white'
                            : step.number === currentStep
                            ? 'bg-[#8B9B7C] text-white ring-4 ring-[#8B9B7C]/20'
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}
                      >
                        {step.number < currentStep ? <Check className="h-5 w-5" /> : step.number}
                      </div>
                      <span
                        className={`mt-2 text-sm font-medium ${
                          step.number <= currentStep ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
            {/* Step 1: Date & Time */}
            {currentStep === 1 && !bookingConfirmed && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  When would you like your {service.name}?
                </h2>
                <p className="text-gray-600 mb-6">Select your preferred date and time</p>

                {/* Date Carousel */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Date
                  </label>
                  <DateCarousel
                    selectedDate={formData.scheduledDate}
                    onDateSelect={(date) => {
                      setFormData({ ...formData, scheduledDate: date, scheduledTime: '' });
                    }}
                    maxDays={14}
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Time
                  </label>
                  <TimeSlotGrid
                    slots={timeSlots}
                    selectedTime={formData.scheduledTime}
                    onTimeSelect={(time) => setFormData({ ...formData, scheduledTime: time })}
                    isLoading={isFetchingSlots}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Service Details */}
            {currentStep === 2 && !bookingConfirmed && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Details</h2>
                <p className="text-gray-600 mb-6">Help us prepare the right professional for you</p>

                {/* Location Type */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Where would you like the service?
                  </label>
                  <LocationTypeSelector
                    selected={formData.locationType}
                    onChange={(type) => setFormData({ ...formData, locationType: type })}
                  />
                </div>

                {/* Address Section - Show when At Home is selected */}
                {formData.locationType === 'at_home' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Service Address
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value }
                          })
                        }
                        placeholder="Street Address / Building Name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value }
                            })
                          }
                          placeholder="City"
                          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                        />
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, state: e.target.value }
                            })
                          }
                          placeholder="State"
                          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, zipCode: e.target.value }
                          })
                        }
                        placeholder="PIN Code"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                      />
                    </div>
                  </div>
                )}

                {/* Hotel Address - Show when Hotel is selected */}
                {formData.locationType === 'hotel' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Hotel Details
                    </label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value }
                          })
                        }
                        placeholder="Hotel Name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value }
                            })
                          }
                          placeholder="City"
                          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                        />
                        <input
                          type="text"
                          value={formData.customerInfo.accessInstructions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerInfo: { ...formData.customerInfo, accessInstructions: e.target.value }
                            })
                          }
                          placeholder="Room Number"
                          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Duration Options - Only show if service has multiple options */}
                {durationOptions.length > 1 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Duration
                    </label>
                    <DurationSelector
                      options={durationOptions}
                      selected={formData.selectedDuration}
                      onSelect={(duration) => setFormData({ ...formData, selectedDuration: duration })}
                      currency="AED"
                    />
                  </div>
                )}

                {/* Professional Preference */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Professional Preference
                  </label>
                  <ProfessionalPreference
                    selected={formData.professionalPreference}
                    onChange={(pref) => setFormData({ ...formData, professionalPreference: pref })}
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B9B7C]/20 focus:border-[#8B9B7C]"
                    rows={3}
                    placeholder="Any specific requirements or preferences..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && !bookingConfirmed && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Authorization</h2>
                <p className="text-gray-600 mb-6">Select your preferred payment method</p>

                {/* Booking Summary Card */}
                <div className="mb-6">
                  <BookingSummaryCard
                    serviceName={service.name}
                    date={formData.scheduledDate}
                    time={formData.scheduledTime}
                    duration={formData.selectedDuration}
                    locationType={formData.locationType}
                    price={getCurrentPrice()}
                    currency="AED"
                  />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Payment Method
                  </label>
                  <PaymentMethodSelector
                    selected={formData.paymentMethod}
                    onChange={(method) => setFormData({ ...formData, paymentMethod: method })}
                  />
                </div>

                {/* Trust Badge */}
                <TrustBadge />
              </div>
            )}

            {/* Step 4: Confirmation */}
            {(currentStep === 4 || bookingConfirmed) && (
              <div className="text-center py-8">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Booking is Confirmed!
                </h2>
                <p className="text-gray-600 mb-8">
                  We've sent a confirmation to your email and phone.
                </p>

                {/* Booking Details */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="w-5 h-5 text-[#8B9B7C]" />
                      <span>{new Date(formData.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-[#8B9B7C]" />
                      <span>{formData.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-5 h-5 text-[#8B9B7C]" />
                      <span>{formData.locationType === 'at_home' ? 'At Home' : 'Hotel'}</span>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className="font-bold text-gray-900">AED {getCurrentPrice().toLocaleString('en-AE')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {confirmedBookingId && (
                    <button
                      onClick={() => navigate(`/customer/bookings/${confirmedBookingId}`)}
                      className="px-6 py-3 bg-[#8B9B7C] text-white rounded-xl font-semibold hover:bg-[#7A8A6B] transition-colors"
                    >
                      View Booking
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {!bookingConfirmed && currentStep < 4 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                {currentStep > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-[#8B9B7C] text-white rounded-xl font-semibold hover:bg-[#7A8A6B] transition-colors"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#8B9B7C] text-white rounded-xl font-semibold hover:bg-[#7A8A6B] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingFormWizard;
