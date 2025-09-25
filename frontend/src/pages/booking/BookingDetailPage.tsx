import React from 'react';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../components/layout';
import { BookingDetail } from '../../components/booking';
import { useAuthStore } from '../../stores/authStore';

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuthStore();

  if (!user) {
    return (
      <PageLayout title="Booking Details">
        <div className="text-center py-12">
          <p className="text-gray-500">Please log in to view booking details.</p>
        </div>
      </PageLayout>
    );
  }

  const userType = user.role === 'provider' ? 'provider' : 'customer';

  return (
    <PageLayout title="Booking Details">
      <BookingDetail userType={userType} />
    </PageLayout>
  );
};

export default BookingDetailPage;