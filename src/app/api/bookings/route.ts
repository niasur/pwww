import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';
import { dbOperations } from '@/lib/database';

const services = {
  'mandi-biasa': { name: 'Mandi Biasa', price: 50000 },
  'mandi-kutu': { name: 'Mandi Anti Kutu', price: 75000 },
  'mandi-grooming': { name: 'Mandi + Grooming Lengkap', price: 99000 }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    const requiredFields = ['name', 'phone', 'address', 'service', 'date', 'time'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validasi service
    if (!services[body.service as keyof typeof services]) {
      return NextResponse.json(
        { error: 'Invalid service selected' },
        { status: 400 }
      );
    }

    // Buat booking baru menggunakan Prisma
    const booking = await dbOperations.bookings.create({
      name: body.name,
      phone: body.phone,
      address: body.address,
      service: body.service,
      serviceName: services[body.service as keyof typeof services].name,
      date: body.date,
      time: body.time,
      notes: body.notes || '',
      status: 'pending',
      totalPrice: services[body.service as keyof typeof services].price
    });

    // Kirim notifikasi WhatsApp dan Email
    try {
      await NotificationService.sendNotification({
        phone: booking.phone,
        name: booking.name,
        bookingId: booking.id,
        serviceName: booking.serviceName,
        date: booking.date,
        time: booking.time,
        address: booking.address,
        totalPrice: booking.totalPrice,
        status: booking.status
      }, 'new_booking');
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Continue even if notification fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        serviceName: booking.serviceName,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        totalPrice: booking.totalPrice
      },
      message: 'Pesanan berhasil dibuat! Kami akan menghubungi Anda untuk konfirmasi.'
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    let filteredBookings = await dbOperations.bookings.getAll();
    
    if (status) {
      filteredBookings = await dbOperations.bookings.findByStatus(status);
    }

    if (search) {
      filteredBookings = await dbOperations.bookings.search(search);

      // If exactly one booking found, return single booking format
      if (filteredBookings.length === 1) {
        return NextResponse.json({
          success: true,
          booking: filteredBookings[0]
        });
      }
    }

    return NextResponse.json({
      success: true,
      bookings: filteredBookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}