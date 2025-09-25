import React from 'react';
import { PageLayout } from '../../components/layout';
import { BookingList } from '../../components/booking';

const CustomerBookingsPage: React.FC = () => {
  return (
    <PageLayout title="My Bookings">
      <BookingList userType="customer" />
    </PageLayout>
  );
};

export default CustomerBookingsPage;