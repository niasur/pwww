import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notifications';
import { dbOperations } from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params; // Await params for Next.js 15
    
    console.log('PATCH request received:', { id, body });
    
    // Update booking menggunakan shared database
    const updatedBooking = await dbOperations.bookings.update(id, body);
    
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
      if (body.status === 'confirmed') {
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
      } else if (body.status === 'completed') {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params for Next.js 15
    
    const booking = await dbOperations.bookings.findById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}