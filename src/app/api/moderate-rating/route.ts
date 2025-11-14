import { NextRequest, NextResponse } from 'next/server';
import { dbOperations } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ratingId, action } = body;
    
    if (!ratingId || !action) {
      return NextResponse.json(
        { error: 'Rating ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      );
    }

    // Update rating status
    const updatedRating = await dbOperations.ratings.update(ratingId, {
      status: action === 'approve' ? 'approved' : 'rejected'
    });

    if (!updatedRating) {
      return NextResponse.json(
        { error: 'Rating not found' },
        { status: 404 }
      );
    }

    console.log(`Rating ${action}d:`, updatedRating);

    return NextResponse.json({
      success: true,
      rating: updatedRating,
      message: `Rating berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`
    });

  } catch (error) {
    console.error('Moderate rating error:', error);
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
    
    if (status) {
      filteredRatings = await dbOperations.ratings.findByStatus(status);
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