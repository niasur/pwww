import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Rating ID is required' },
        { status: 400 }
      );
    }

    // Delete the rating
    await db.rating.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Rating berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus rating' },
      { status: 500 }
    );
  }
}