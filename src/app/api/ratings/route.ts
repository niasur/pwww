import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  console.log('Ratings POST request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validasi input
    const requiredFields = ['bookingId', 'customerName', 'rating', 'comment'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing field: ${field}`);
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validasi rating (1-5)
    if (body.rating < 1 || body.rating > 5) {
      console.log(`Invalid rating: ${body.rating}`);
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validasi bookingId
    const booking = await dbOperations.bookings.findById(body.bookingId);
    if (!booking) {
      console.log(`Booking not found: ${body.bookingId}`);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Validasi rating duplikasi
    console.log(`Checking for existing ratings for bookingId: ${body.bookingId}`);
    const existingRatings = await dbOperations.ratings.findByBookingId(body.bookingId);
    console.log(`Found existing ratings:`, existingRatings);
    
    const hasExistingRating = existingRatings.some(r => r.status === 'approved' || r.status === 'pending');
    console.log(`Has existing rating: ${hasExistingRating}`);
    
    if (hasExistingRating) {
      return NextResponse.json(
        { error: 'Anda sudah memberikan rating untuk booking ini' },
        { status: 400 }
      );
    }

    // Buat rating baru
    const rating = await dbOperations.ratings.create({
      bookingId: body.bookingId,
      customerName: body.customerName,
      rating: body.rating,
      comment: body.comment,
      serviceName: booking.serviceName,
      status: 'pending'
    });

    console.log('Rating created:', rating);

    // Update status booking ke 'completed' jika rating berhasil
    await dbOperations.bookings.update(booking.id, { status: 'completed' });

    return NextResponse.json({
      success: true,
      rating: {
        id: rating.id,
        customerName: rating.customerName,
        rating: rating.rating,
        comment: rating.comment,
        status: rating.status
      },
      message: 'Terima kasih atas rating Anda! Ulasan Anda sangat berharga untuk kami.'
    });

  } catch (error) {
    console.error('Rating submission error:', error);
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
    
    let filteredRatings = await dbOperations.ratings.getAll();
    
    // Default: hanya tampilkan rating yang di-approve jika tidak ada parameter status
    if (status) {
      filteredRatings = await dbOperations.ratings.findByStatus(status);
    } else {
      filteredRatings = await dbOperations.ratings.findByStatus('approved');
    }

    return NextResponse.json({
      success: true,
      ratings: filteredRatings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}