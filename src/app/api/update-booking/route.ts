import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';
import { dbOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    console.log('Update booking request:', { id, status });
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }
    
    // Update booking menggunakan Prisma
    const updatedBooking = await dbOperations.bookings.update(id, { status });
    
    if (!updatedBooking) {
      console.log('Booking not found for id:', id);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('Booking updated successfully:', updatedBooking);

    // Kirim notifikasi berdasarkan status baru
    try {
      if (status === 'confirmed') {
        await NotificationService.sendNotification({
          phone: updatedBooking.phone,
          name: updatedBooking.name,
          bookingId: updatedBooking.id,
          serviceName: updatedBooking.serviceName,
          date: updatedBooking.date,
          time: updatedBooking.time,
          address: updatedBooking.address,
          totalPrice: updatedBooking.totalPrice,
          status: updatedBooking.status
        }, 'confirmed');
      } else if (status === 'completed') {
        await NotificationService.sendNotification({
          phone: updatedBooking.phone,
          name: updatedBooking.name,
          bookingId: updatedBooking.id,
          serviceName: updatedBooking.serviceName,
          date: updatedBooking.date,
          time: updatedBooking.time,
          address: updatedBooking.address,
          totalPrice: updatedBooking.totalPrice,
          status: updatedBooking.status
        }, 'completed');
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Continue even if notification fails
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}