import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/booking.model';
import Availability from '../models/availability.model';
import BookingNotification from '../models/bookingNotification.model';
import User from '../models/user.model';
import Service from '../models/service.model';
import { asyncHandler } from '../utils/asyncHandler';
// validateBookingInput is used in routes, not in controller

// ===================================
// CUSTOMER BOOKING OPERATIONS
// ===================================

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const {
    serviceId,
    providerId,
    scheduledDate,
    scheduledTime,
    location,
    customerInfo,
    addOns = [],
    specialRequests,
    metadata = {}
  } = req.body;

  // Validate customer authorization
  if (req.user?.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Only customers can create bookings'
    });
  }

  // Validate service exists and is active
  const service = await Service.findById(serviceId).populate('providerId');
  if (!service || !service.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Service not found or inactive'
    });
  }

  // Validate provider
  const provider = await User.findById(providerId);
  if (!provider || provider.role !== 'provider') {
    return res.status(404).json({
      success: false,
      message: 'Provider not found'
    });
  }

  // Check provider availability and create with proper default time slots
  let availability = await Availability.findOne({ providerId });
  if (!availability) {
    // Create default availability for provider with proper time slots
    availability = new Availability({
      providerId,
      weeklySchedule: {
        monday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '17:00', isActive: true }] },
        tuesday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '17:00', isActive: true }] },
        wednesday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '17:00', isActive: true }] },
        thursday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '17:00', isActive: true }] },
        friday: { isAvailable: true, timeSlots: [{ start: '09:00', end: '17:00', isActive: true }] },
        saturday: { isAvailable: false, timeSlots: [] },
        sunday: { isAvailable: false, timeSlots: [] }
      },
      timezone: 'Asia/Kolkata'
    });
    await availability.save();
    console.log('✅ Created default availability for provider:', providerId, 'with time slots');
  }

  const requestedDate = new Date(scheduledDate);

  // Check basic availability (working hours)
  const checkAvailability = await Availability.findOne({ providerId });

  if (!checkAvailability) {
    return res.status(400).json({
      success: false,
      message: 'Provider availability not configured'
    });
  }

  // Check if provider is available on this day
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestedDate.getDay()];
  const daySchedule = checkAvailability.weeklySchedule[dayOfWeek as keyof typeof checkAvailability.weeklySchedule];

  if (!daySchedule?.isAvailable || !daySchedule.timeSlots || daySchedule.timeSlots.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provider is not available on this day',
      data: {
        requestedTime: scheduledTime,
        availableSlots: []
      }
    });
  }

  // Check if requested time falls within any time slot
  const [requestedHour, requestedMinute] = scheduledTime.split(':').map(Number);
  const requestedMinutes = requestedHour * 60 + requestedMinute;
  const serviceDurationMinutes = service.duration;
  const requestedEndMinutes = requestedMinutes + serviceDurationMinutes;

  const isWithinTimeSlot = daySchedule.timeSlots.some(slot => {
    if (!slot.isActive) return false;

    const [startHour, startMinute] = slot.start.split(':').map(Number);
    const [endHour, endMinute] = slot.end.split(':').map(Number);
    const slotStartMinutes = startHour * 60 + startMinute;
    const slotEndMinutes = endHour * 60 + endMinute;

    return requestedMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes;
  });

  if (!isWithinTimeSlot) {
    // Generate available slots for error response
    const availableSlots: string[] = [];
    daySchedule.timeSlots.forEach(slot => {
      if (slot.isActive) {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        const slotStartMinutes = startHour * 60 + startMinute;
        const slotEndMinutes = endHour * 60 + endMinute;

        // Generate 30-minute slots within the time slot
        for (let minutes = slotStartMinutes; minutes + serviceDurationMinutes <= slotEndMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          availableSlots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        }
      }
    });

    return res.status(400).json({
      success: false,
      message: 'Provider is not available at the requested time',
      data: {
        requestedTime: scheduledTime,
        availableSlots: availableSlots.length > 0 ? availableSlots : ['No slots available on this date']
      }
    });
  }

  // Check for conflicting bookings with proper time overlap
  const existingBookings = await Booking.find({
    providerId,
    scheduledDate: requestedDate,
    status: { $in: ['pending', 'confirmed', 'in_progress'] }
  });

  // Helper function to convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const requestedStart = timeToMinutes(scheduledTime);
  const requestedEnd = requestedStart + service.duration;

  const conflictingBooking = existingBookings.find(booking => {
    const bookingStart = timeToMinutes(booking.scheduledTime);
    const bookingEnd = bookingStart + booking.duration;

    // Check for time overlap
    return (requestedStart < bookingEnd && requestedEnd > bookingStart);
  });

  if (conflictingBooking) {
    return res.status(409).json({
      success: false,
      message: 'Time slot is already booked',
      data: {
        conflictingBooking: conflictingBooking.bookingNumber
      }
    });
  }

  // Calculate pricing
  const basePrice = service.price.amount;
  let addOnTotal = 0;

  if (addOns && addOns.length > 0) {
    addOnTotal = addOns.reduce((total: number, addOn: any) => total + addOn.price, 0);
  }

  const subtotal = basePrice + addOnTotal;
  const tax = subtotal * 0.18; // 18% GST for India, can be configurable
  const totalAmount = subtotal + tax;

  // Determine currency based on provider location or service currency
  const currency = service.price.currency || 'INR';

  // Calculate estimated end time
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const serviceStart = new Date(requestedDate);
  serviceStart.setHours(hours, minutes, 0, 0);
  const estimatedEndTime = new Date(serviceStart.getTime() + (service.duration * 60 * 1000));

  // Set cancellation policy (24 hours before service)
  const cancellationDeadline = new Date(serviceStart.getTime() - (24 * 60 * 60 * 1000));

  // Process location data - only include address/coordinates for customer_address
  const processedLocation: any = {
    type: location.type,
    notes: location.notes
  };

  // Only include address for customer_address location type
  if (location.type === 'customer_address' && location.address) {
    processedLocation.address = {
      street: location.address.street,
      city: location.address.city,
      state: location.address.state,
      zipCode: location.address.zipCode,
      country: location.address.country || 'US'
      // Coordinates can be added later when needed
    };
  }

  // Generate unique booking number
  const bookingNumber = `RZ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;

  // Create booking
  const booking = new Booking({
    bookingNumber,
    customerId: (req.user as any)._id as string,
    providerId,
    serviceId,
    scheduledDate: requestedDate,
    scheduledTime,
    duration: service.duration,
    estimatedEndTime,
    location: processedLocation,
    pricing: {
      basePrice,
      addOns: addOns || [],
      discounts: [], // Can be enhanced with discount logic
      subtotal,
      tax,
      totalAmount,
      currency
    },
    customerInfo: {
      firstName: customerInfo.firstName || req.user.firstName,
      lastName: customerInfo.lastName || req.user.lastName,
      email: customerInfo.email || req.user.email,
      phone: customerInfo.phone,
      specialRequests
    },
    cancellationPolicy: {
      allowedUntil: cancellationDeadline,
      refundPercentage: 100,
      cancellationFee: 0
    },
    metadata: {
      bookingSource: metadata.bookingSource || 'search',
      deviceType: metadata.deviceType || 'desktop',
      userAgent: req.get('User-Agent'),
      sessionId: metadata.sessionId
    },
    status: 'pending' // TEMPORARY: Default to pending for testing
  });

  await booking.save();

  // Send notifications
  await createBookingNotifications(booking, 'booking_request');

  // Populate booking details for response
  await booking.populate([
    { path: 'customer', select: 'firstName lastName email avatar' },
    { path: 'provider', select: 'firstName lastName email businessInfo' },
    { path: 'service', select: 'name category price duration images' }
  ]);

  return res.status(201).json({
    success: true,
    message: 'Booking request submitted, awaiting provider confirmation', // TEMPORARY: Default message for testing
    data: { booking }
  });
});

// @desc    Get customer's bookings
// @route   GET /api/bookings/customer
// @access  Private (Customer)
const getCustomerBookings = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { status, page = 1, limit = 20, startDate, endDate } = req.query;

  if (req.user?.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Build query - use the user's ID from the authenticated user
  const user = req.user as any;
  const userId = user._id || user.id;
  const query: any = { customerId: userId };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate as string);
    if (endDate) query.scheduledDate.$lte = new Date(endDate as string);
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('provider', 'firstName lastName businessInfo rating')
      .populate('service', 'name category price duration images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query)
  ]);

  return res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// @desc    Get specific booking details
// @route   GET /api/bookings/:id
// @access  Private (Customer/Provider/Admin)
const getBookingDetails = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID'
    });
  }

  const booking = await Booking.findById(id)
    .populate('customer', 'firstName lastName email avatar loyaltySystem')
    .populate('provider', 'firstName lastName email businessInfo rating')
    .populate('service', 'name category subcategory description price duration images tags');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check
  const user = req.user as any;
  const userId = user._id || user.id;
  const isAuthorized =
    userId.toString() === booking.customerId.toString() ||
    userId.toString() === booking.providerId.toString() ||
    user?.role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  return res.json({
    success: true,
    data: { booking }
  });
});

// @desc    Cancel booking (Customer)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer)
const cancelBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check
  const user = req.user as any;
  const userId = user._id || user.id;
  if (userId.toString() !== booking.customerId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the customer who made the booking can cancel it'
    });
  }

  // Check if booking can be cancelled
  if (!booking.canCustomerCancel()) {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be cancelled',
      data: {
        currentStatus: booking.status,
        cancellationDeadline: booking.cancellationPolicy.allowedUntil
      }
    });
  }

  // Calculate refund
  const refundAmount = booking.calculateRefund();

  // Update booking
  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancellationDetails = {
    cancelledBy: 'customer',
    cancelledAt: new Date(),
    reason: reason || 'Cancelled by customer',
    refundAmount,
    refundStatus: 'pending'
  };

  await booking.save();

  // Send notifications
  await createBookingNotifications(booking, 'booking_cancelled');

  return res.json({
    success: true,
    message: 'Booking cancelled successfully',
    data: {
      booking,
      refundAmount,
      refundProcessingTime: '3-5 business days'
    }
  });
});

// ===================================
// PROVIDER BOOKING OPERATIONS
// ===================================

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { status, page = 1, limit = 20, startDate, endDate } = req.query;

  // Check if user is authenticated and is a provider
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'provider') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only providers can access this endpoint'
    });
  }

  // Build query - use the user's ID from the authenticated user
  const user = req.user as any;
  const userId = user._id || user.id;
  const query: any = { providerId: userId };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate as string);
    if (endDate) query.scheduledDate.$lte = new Date(endDate as string);
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('customer', 'firstName lastName email avatar loyaltySystem')
      .populate('service', 'name category price duration')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(query)
  ]);

  return res.json({
    success: true,
    data: {
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

// @desc    Accept booking request (Provider)
// @route   PATCH /api/bookings/:id/accept
// @access  Private (Provider)
const acceptBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { notes, estimatedArrival } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check - properly compare ObjectIds
  const user = req.user as any; // Type assertion to fix TypeScript compilation
  const currentUserId = user._id.toString();
  const bookingProviderId = booking.providerId.toString();
  
  console.log('Authorization check:', {
    currentUserId,
    bookingProviderId,
    userRole: user.role,
    match: currentUserId === bookingProviderId
  });
  
  if (currentUserId !== bookingProviderId) {
    return res.status(403).json({
      success: false,
      message: 'Only the assigned provider can accept this booking',
      debug: {
        currentUserId,
        bookingProviderId,
        userRole: user.role
      }
    });
  }

  // Check if booking can be accepted
  if (booking.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be accepted',
      data: { currentStatus: booking.status }
    });
  }

  // Update booking
  await booking.updateStatus('confirmed', 'provider', 'Booking accepted by provider', notes);

  if (estimatedArrival) {
    booking.providerResponse.estimatedArrival = new Date(estimatedArrival);
  }

  booking.providerResponse.acceptedAt = new Date();
  booking.providerResponse.notes = notes;

  await booking.save();

  // Send confirmation notification
  await createBookingNotifications(booking, 'booking_confirmed');

  return res.json({
    success: true,
    message: 'Booking accepted successfully',
    data: { booking }
  });
});

// @desc    Reject booking request (Provider)
// @route   PATCH /api/bookings/:id/reject
// @access  Private (Provider)
const rejectBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { reason } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check - properly compare ObjectIds
  const user = req.user as any; // Type assertion to fix TypeScript compilation
  const currentUserId = user._id.toString();
  const bookingProviderId = booking.providerId.toString();
  
  if (currentUserId !== bookingProviderId) {
    return res.status(403).json({
      success: false,
      message: 'Only the assigned provider can reject this booking'
    });
  }

  // Check if booking can be rejected
  if (booking.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be rejected',
      data: { currentStatus: booking.status }
    });
  }

  // Update booking
  await booking.updateStatus('cancelled', 'provider', reason || 'Rejected by provider');

  booking.providerResponse.rejectedAt = new Date();
  booking.providerResponse.rejectionReason = reason;

  booking.cancellationDetails = {
    cancelledBy: 'provider',
    cancelledAt: new Date(),
    reason: reason || 'Rejected by provider',
    refundAmount: booking.pricing.totalAmount, // Full refund for provider rejection
    refundStatus: 'pending'
  };

  await booking.save();

  // Send notification
  await createBookingNotifications(booking, 'booking_rejected');

  return res.json({
    success: true,
    message: 'Booking rejected successfully',
    data: { booking }
  });
});

// @desc    Start booking (Provider)
// @route   PATCH /api/bookings/:id/start
// @access  Private (Provider)
const startBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { notes } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check - properly compare ObjectIds
  const user = req.user as any; // Type assertion to fix TypeScript compilation
  const currentUserId = user._id.toString();
  const bookingProviderId = booking.providerId.toString();
  
  if (currentUserId !== bookingProviderId) {
    return res.status(403).json({
      success: false,
      message: 'Only the assigned provider can start this booking'
    });
  }

  // Check if booking can be started
  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be started',
      data: { currentStatus: booking.status }
    });
  }

  // Update booking status to in_progress
  await booking.updateStatus('in_progress', 'provider', 'Service started by provider', notes);

  booking.providerResponse.arrivalTime = new Date();
  if (notes) {
    booking.providerResponse.notes = notes;
  }

  await booking.save();

  // Send notification
  await createBookingNotifications(booking, 'booking_started');

  return res.json({
    success: true,
    message: 'Booking started successfully',
    data: { booking }
  });
});

// @desc    Mark booking as completed (Provider)
// @route   PATCH /api/bookings/:id/complete
// @access  Private (Provider)
const completeBooking = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { notes, actualDuration } = req.body;

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check - properly compare ObjectIds
  const user = req.user as any; // Type assertion to fix TypeScript compilation
  const currentUserId = user._id.toString();
  const bookingProviderId = booking.providerId.toString();
  
  if (currentUserId !== bookingProviderId) {
    return res.status(403).json({
      success: false,
      message: 'Only the assigned provider can complete this booking'
    });
  }

  // Check if booking can be completed
  if (!['confirmed', 'in_progress'].includes(booking.status)) {
    return res.status(400).json({
      success: false,
      message: 'Booking cannot be completed',
      data: { currentStatus: booking.status }
    });
  }

  // Update booking
  await booking.markAsCompleted();

  booking.providerResponse.completedAt = new Date();
  booking.providerResponse.notes = notes;

  if (actualDuration) {
    booking.duration = actualDuration;
  }

  await booking.save();

  // Send completion notification
  await createBookingNotifications(booking, 'booking_completed');

  return res.json({
    success: true,
    message: 'Booking marked as completed successfully',
    data: { booking }
  });
});

// ===================================
// BOOKING COMMUNICATION
// ===================================

// @desc    Add message to booking
// @route   POST /api/bookings/:id/messages
// @access  Private (Customer/Provider)
const addBookingMessage = asyncHandler(async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content is required'
    });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Authorization check
  const user = req.user as any;
  const isAuthorized =
    (user._id as string) === booking.customerId.toString() ||
    (user._id as string) === booking.providerId.toString();

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Add message
  await booking.addMessage(new mongoose.Types.ObjectId(user._id as string), message.trim());

  // Send notification to the other party
  const recipientId = (user._id as string) === booking.customerId.toString() ?
    booking.providerId : booking.customerId;

  await createMessageNotification(booking, recipientId);

  return res.json({
    success: true,
    message: 'Message added successfully',
    data: {
      messageCount: booking.messages.length
    }
  });
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

// Create booking notifications
async function createBookingNotifications(booking: any, type: string) {
  try {
    // Notification for customer
    const customerNotification = new BookingNotification({
      bookingId: booking._id,
      recipientId: booking.customerId,
      type,
      title: getNotificationTitle(type, 'customer'),
      message: getNotificationMessage(type, 'customer'),
      metadata: {
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service?.name,
        providerName: booking.provider?.businessInfo?.businessName,
        scheduledDate: booking.scheduledDate,
        totalAmount: booking.pricing.totalAmount,
        currency: booking.pricing.currency
      }
    });

    // Notification for provider
    const providerNotification = new BookingNotification({
      bookingId: booking._id,
      recipientId: booking.providerId,
      type,
      title: getNotificationTitle(type, 'provider'),
      message: getNotificationMessage(type, 'provider'),
      metadata: {
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service?.name,
        customerName: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
        scheduledDate: booking.scheduledDate,
        totalAmount: booking.pricing.totalAmount,
        currency: booking.pricing.currency
      }
    });

    await Promise.all([
      customerNotification.save(),
      providerNotification.save()
    ]);

  } catch (error) {
    console.error('Error creating booking notifications:', error);
  }
}

// Create message notification
async function createMessageNotification(booking: any, recipientId: any) {
  try {
    const notification = new BookingNotification({
      bookingId: booking._id,
      recipientId,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message about booking ${booking.bookingNumber}`,
      actionText: 'View Message',
      actionUrl: `/bookings/${booking._id}`,
      metadata: {
        bookingNumber: booking.bookingNumber,
        serviceName: booking.service?.name
      }
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating message notification:', error);
  }
}

// Get notification titles
function getNotificationTitle(type: string, recipient: string): string {
  const titles: { [key: string]: { [key: string]: string } } = {
    booking_request: {
      customer: 'Booking Request Submitted',
      provider: 'New Booking Request'
    },
    booking_confirmed: {
      customer: 'Booking Confirmed',
      provider: 'Booking Accepted'
    },
    booking_cancelled: {
      customer: 'Booking Cancelled',
      provider: 'Booking Cancelled'
    },
    booking_rejected: {
      customer: 'Booking Request Declined',
      provider: 'Booking Rejected'
    },
    booking_started: {
      customer: 'Service Started',
      provider: 'Service Started'
    },
    booking_completed: {
      customer: 'Service Completed',
      provider: 'Service Completed'
    }
  };

  return titles[type]?.[recipient] || 'Booking Update';
}

// Get notification messages
function getNotificationMessage(type: string, recipient: string): string {
  const messages: { [key: string]: { [key: string]: string } } = {
    booking_request: {
      customer: `Your booking request for {{serviceName}} on {{scheduledDate}} has been submitted. You'll be notified once the provider responds.`,
      provider: `You have a new booking request for {{serviceName}} on {{scheduledDate}} from {{customerName}}.`
    },
    booking_confirmed: {
      customer: `Great! Your booking for {{serviceName}} on {{scheduledDate}} has been confirmed by {{providerName}}.`,
      provider: `You have successfully accepted the booking request for {{serviceName}} on {{scheduledDate}}.`
    },
    booking_cancelled: {
      customer: `Your booking {{bookingNumber}} for {{serviceName}} has been cancelled. Refund will be processed if applicable.`,
      provider: `Booking {{bookingNumber}} for {{serviceName}} on {{scheduledDate}} has been cancelled by the customer.`
    },
    booking_rejected: {
      customer: `Unfortunately, your booking request for {{serviceName}} on {{scheduledDate}} has been declined by the provider.`,
      provider: `You have declined the booking request for {{serviceName}} on {{scheduledDate}}.`
    },
    booking_started: {
      customer: `Your service {{serviceName}} has been started by {{providerName}}. They should arrive shortly.`,
      provider: `You have started the service {{serviceName}} for {{customerName}}.`
    },
    booking_completed: {
      customer: `Your service {{serviceName}} has been completed. Please consider leaving a review for {{providerName}}.`,
      provider: `You have successfully completed the service {{serviceName}} for {{customerName}}.`
    }
  };

  return messages[type]?.[recipient] || 'Your booking has been updated.';
}

export {
  createBooking,
  getCustomerBookings,
  getBookingDetails,
  cancelBooking,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
  addBookingMessage
};