import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import NavigationHeader from '../layout/NavigationHeader';
import Footer from '../layout/Footer';
import Breadcrumb from '../common/Breadcrumb';
import { useBookingStore } from '../../stores/bookingStore';
import { useAuthStore } from '../../stores/authStore';
import type { Service } from '../../types/search';
import type { CreateBookingData, BookingAddOn } from '../../services/BookingService';

interface BookingFormWizardProps {
  service: Service;
  providerId: string;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

interface FormData {
  scheduledDate: string;
  scheduledTime: string;
  locationType: 'customer_address' | 'provider_location' | 'online';
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
  const [formData, setFormData] = useState<FormData>({
    scheduledDate: '',
    scheduledTime: '',
    locationType: 'customer_address',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    customerInfo: {
      phone: user?.phone || '',
      specialRequests: '',
      accessInstructions: ''
    },
    addOns: []
  });

  const steps = [
    { number: 1, title: 'Service Details' },
    { number: 2, title: 'Date & Time' },
    { number: 3, title: 'Contact Info' },
    { number: 4, title: 'Confirmation' }
  ];

  // Load available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (formData.scheduledDate && providerId && service.duration) {
        console.log('🔍 Fetching slots for:', {
          providerId,
          date: formData.scheduledDate,
          duration: service.duration
        });

        setIsFetchingSlots(true);
        await getAvailableSlots(providerId, {
          date: formData.scheduledDate,
          duration: service.duration,
          days: 1
        });
        setIsFetchingSlots(false);

        console.log('✅ Slots fetched:', availableSlots);
      }
    };

    fetchSlots();
  }, [formData.scheduledDate, providerId, service.duration, getAvailableSlots]);

  const handleNext = () => {
    // Validation for Step 2: Date & Time
    if (currentStep === 2) {
      if (!formData.scheduledDate) {
        alert('Please select a date');
        return;
      }
      if (!formData.scheduledTime) {
        alert('Please select a time slot');
        return;
      }
    }

    // Validation for Step 3: Contact Info
    if (currentStep === 3) {
      if (!formData.customerInfo.phone) {
        alert('Please enter your phone number');
        return;
      }
      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
        alert('Please complete your address information');
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

    // Transform data to match backend expectations - use exact format from old BookingForm
    const bookingData: CreateBookingData = {
      serviceId: service._id,
      providerId,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      location: {
        type: formData.locationType,
        address: formData.locationType === 'customer_address' ? formData.address : undefined,
        notes: formData.customerInfo.accessInstructions || undefined
      },
      customerInfo: {
        phone: formData.customerInfo.phone,
        specialRequests: formData.customerInfo.specialRequests || undefined,
        accessInstructions: formData.customerInfo.accessInstructions || undefined
      },
      addOns: formData.addOns,
      notes: formData.customerInfo.specialRequests || undefined
    };

    console.log('🚀 Sending booking data to API:', bookingData);

    try {
      const booking = await createBooking(bookingData);
      console.log('✅ Booking created successfully:', booking);

      if (booking && booking._id) {
        if (onSuccess) {
          onSuccess(booking._id);
        } else {
          navigate(`/customer/bookings/${booking._id}`);
        }
      }
    } catch (error: any) {
      console.error('❌ Booking creation failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create booking. Please try again.';
      alert(errorMessage);
    }
  };

  const calculateTotal = () => {
    const basePrice = typeof service.price === 'number' ? service.price : service.price?.amount || 0;
    const addOnsTotal = formData.addOns.reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addOnsTotal;
  };

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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Service</h1>
            <p className="text-gray-600">Complete your booking in a few simple steps</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-gradient-nilin-primary transition-all duration-300"
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
                          ? 'bg-gradient-nilin-primary text-gray-900'
                          : step.number === currentStep
                          ? 'bg-gradient-nilin-primary text-gray-900 ring-4 ring-pink-100'
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

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            {/* Step 1: Service Details */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Details</h2>

                {/* Selected Service */}
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">🏠</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.category}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${typeof service.price === 'number' ? service.price : service.price?.amount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.customerInfo.specialRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, specialRequests: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-200"
                    rows={4}
                    placeholder="Any specific requirements or areas that need extra attention..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-200"
                      required
                    />
                  </div>
                </div>

                {/* Time Slots */}
                {formData.scheduledDate && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Available Time Slots
                    </label>

                    {/* Loading State */}
                    {isFetchingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
                        <p className="ml-3 text-gray-600">Loading available slots...</p>
                      </div>
                    ) : availableSlots && availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setFormData({ ...formData, scheduledTime: slot.time })}
                            disabled={!slot.isAvailable}
                            className={`px-4 py-3 rounded-lg font-medium transition-all ${
                              formData.scheduledTime === slot.time
                                ? 'bg-gradient-nilin-primary text-gray-900 ring-2 ring-pink-200'
                                : slot.isAvailable
                                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No available time slots for this date</p>
                        <p className="text-sm text-gray-500 mt-1">Please try selecting a different date</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.customerInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerInfo: { ...formData.customerInfo, phone: e.target.value }
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Service Address *</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })
                    }
                    placeholder="Street Address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100 mb-3"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })
                      }
                      placeholder="City"
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100"
                      required
                    />
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })
                      }
                      placeholder="State"
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })
                    }
                    placeholder="ZIP Code"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100 mt-3"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Confirmation</h2>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{service.name}</span>
                      <span className="font-semibold">
                        ${typeof service.price === 'number' ? service.price : service.price?.amount || 0}
                      </span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-gray-900">${calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>{formData.scheduledDate} at {formData.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{formData.address.street}, {formData.address.city}, {formData.address.state}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span>{formData.customerInfo.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              <div className="flex-1" />

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-nilin-primary text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-nilin-primary text-gray-900 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                  <CheckCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingFormWizard;
