import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, cancelReason } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Cari booking
    const booking = await dbOperations.bookings.findById(bookingId);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Cek apakah booking bisa dibatalkan
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Booking cannot be cancelled. Status: ' + booking.status },
        { status: 400 }
      );
    }

    // Cek batas waktu 30 menit
    const now = new Date();
    const bookingTime = new Date(booking.createdAt);
    const timeDiff = now.getTime() - bookingTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 30) {
      return NextResponse.json(
        { error: 'Booking can only be cancelled within 30 minutes of ordering' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await dbOperations.bookings.update(bookingId, {
      status: 'cancelled',
      cancelledAt: now,
      cancelReason: cancelReason || 'Cancelled by customer'
    });

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    // Kirim notifikasi ke admin
    try {
      // Simulasi notifikasi admin (dalam production bisa ke email/webhook)
      console.log('🔔 BOOKING CANCELLATION NOTIFICATION');
      console.log(`📋 Booking ID: #${bookingId.slice(-6)}`);
      console.log(`👤 Customer: ${booking.name}`);
      console.log(`📞 Phone: ${booking.phone}`);
      console.log(`⏰ Cancelled at: ${now.toLocaleString('id-ID')}`);
      console.log(`📝 Reason: ${cancelReason || 'No reason provided'}`);
      console.log(`💰 Refund amount: Rp ${booking.totalPrice.toLocaleString('id-ID')}`);
      console.log('---');
    } catch (notifError) {
      console.error('Failed to send admin notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibatalkan',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        cancelledAt: updatedBooking.cancelledAt
      }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}