import { db } from '@/lib/db';

export interface Booking {
  id: string;
  name: string;
  phone: string;
  address: string;
  service: string;
  serviceName: string;
  date: string;
  time: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalPrice: number;
  cancelledAt?: Date | null;
  cancelReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Promo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  originalPrice: number;
  discountedPrice: number | null;
  discountPercentage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Database operations using Prisma
export const dbOperations = {
  // Booking operations
  bookings: {
    getAll: async (): Promise<Booking[]> => {
      return await db.booking.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    findById: async (id: string): Promise<Booking | null> => {
      return await db.booking.findUnique({
        where: { id }
      });
    },
    findByPhone: async (phone: string): Promise<Booking[]> => {
      return await db.booking.findMany({
        where: { phone },
        orderBy: { createdAt: 'desc' }
      });
    },
    findByStatus: async (status: string): Promise<Booking[]> => {
      return await db.booking.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' }
      });
    },
    search: async (query: string): Promise<Booking[]> => {
      return await db.booking.findMany({
        where: {
          OR: [
            { phone: { contains: query } },
            { id: { contains: query } },
            { name: { contains: query } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    create: async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> => {
      return await db.booking.create({
        data: booking
      });
    },
    update: async (id: string, updates: Partial<Booking>): Promise<Booking | null> => {
      try {
        // Convert Date objects to ISO strings for Prisma
        const processedUpdates = { ...updates };
        if (processedUpdates.cancelledAt) {
          processedUpdates.cancelledAt = new Date(processedUpdates.cancelledAt);
        }

        const updatedBooking = await db.booking.update({
          where: { id },
          data: processedUpdates
        });
        return updatedBooking;
      } catch (error) {
        console.error('Error updating booking:', error);
        return null;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        await db.booking.delete({
          where: { id }
        });
        return true;
      } catch (error) {
        console.error('Error deleting booking:', error);
        return false;
      }
    }
  },

  // Rating operations
  ratings: {
    getAll: async (): Promise<Rating[]> => {
      return await db.rating.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    findById: async (id: string): Promise<Rating | null> => {
      return await db.rating.findUnique({
        where: { id }
      });
    },
    findByBookingId: async (bookingId: string): Promise<Rating[]> => {
      return await db.rating.findMany({
        where: { bookingId },
        orderBy: { createdAt: 'desc' }
      });
    },
    findByStatus: async (status: string): Promise<Rating[]> => {
      return await db.rating.findMany({
        where: { status },
        orderBy: { createdAt: 'desc' }
      });
    },
    create: async (rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rating> => {
      return await db.rating.create({
        data: rating
      });
    },
    update: async (id: string, updates: Partial<Rating>): Promise<Rating | null> => {
      try {
        const updatedRating = await db.rating.update({
          where: { id },
          data: updates
        });
        return updatedRating;
      } catch (error) {
        console.error('Error updating rating:', error);
        return null;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        await db.rating.delete({
          where: { id }
        });
        return true;
      } catch (error) {
        console.error('Error deleting rating:', error);
        return false;
      }
    }
  },

  // Promo operations
  promos: {
    getAll: async (): Promise<Promo[]> => {
      return await db.promo.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    findActive: async (): Promise<Promo[]> => {
      const now = new Date();
      return await db.promo.findMany({
        where: {
          isActive: true,
          startDate: { lte: now.toISOString() },
          endDate: { gte: now.toISOString() }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    create: async (promo: Omit<Promo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Promo> => {
      return await db.promo.create({
        data: promo
      });
    },
    update: async (id: string, updates: Partial<Promo>): Promise<Promo | null> => {
      try {
        const updatedPromo = await db.promo.update({
          where: { id },
          data: updates
        });
        return updatedPromo;
      } catch (error) {
        console.error('Error updating promo:', error);
        return null;
      }
    },
    delete: async (id: string): Promise<boolean> => {
      try {
        await db.promo.delete({
          where: { id }
        });
        return true;
      } catch (error) {
        console.error('Error deleting promo:', error);
        return false;
      }
    }
  }
};

// Initialize with some sample data for testing
export const initializeSampleData = async () => {
  const existingBookings = await dbOperations.bookings.getAll();
  const existingRatings = await dbOperations.ratings.getAll();
  
  if (existingBookings.length === 0) {
    const sampleBookings = [
      {
        name: 'John Doe',
        phone: '08123456789',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        service: 'mandi-biasa',
        serviceName: 'Mandi Biasa',
        date: '2024-01-15',
        time: '10:00',
        notes: 'Kucing saya agak takut dengan orang asing',
        status: 'completed' as const,
        totalPrice: 50000
      },
      {
        name: 'Sarah P.',
        phone: '08123456788',
        address: 'Jl. Thamrin No. 456, Jakarta Selatan',
        service: 'mandi-kutu',
        serviceName: 'Mandi Anti Kutu',
        date: '2024-01-16',
        time: '14:00',
        notes: 'Mohon treatment extra untuk kutu',
        status: 'completed' as const,
        totalPrice: 75000
      },
      {
        name: 'Budi S.',
        phone: '08123456787',
        address: 'Jl. Gatot Subroto No. 789, Jakarta Barat',
        service: 'mandi-grooming',
        serviceName: 'Mandi + Grooming Lengkap',
        date: '2024-01-17',
        time: '09:00',
        notes: 'Kucing persia, bulu panjang',
        status: 'completed' as const,
        totalPrice: 99000
      }
    ];
    
    const createdBookings = [];
    for (const booking of sampleBookings) {
      const created = await dbOperations.bookings.create(booking);
      createdBookings.push(created);
    }
    console.log('Sample bookings created');

    // Create ratings for the completed bookings
    if (existingRatings.length === 0) {
      const sampleRatings = [
        {
          bookingId: createdBookings[0].id,
          customerName: 'John Doe',
          serviceName: 'Mandi Biasa',
          rating: 5,
          comment: 'Pelayanan sangat memuaskan! Petugasnya ramah dan sabar sama kucing saya. Hasil groomingnya rapi banget.',
          status: 'approved' as const
        },
        {
          bookingId: createdBookings[1].id,
          customerName: 'Sarah P.',
          serviceName: 'Mandi Anti Kutu',
          rating: 5,
          comment: 'Praktis banget, ga perlu repot bawa kucing ke salon. Harganya worth it untuk hasil sebagus ini.',
          status: 'approved' as const
        },
        {
          bookingId: createdBookings[2].id,
          customerName: 'Budi S.',
          serviceName: 'Mandi + Grooming Lengkap',
          rating: 5,
          comment: 'Kucing saya jadi wangi dan bersih. Petugasnya profesional dan tepat waktu. Recommended!',
          status: 'approved' as const
        }
      ];

      for (const sampleRating of sampleRatings) {
        await dbOperations.ratings.create(sampleRating);
      }
      console.log('Sample ratings created');
    }
  }
};

// Initialize sample data
initializeSampleData().catch(console.error);