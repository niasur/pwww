import { NextRequest, NextResponse } from 'next/server';

// Simpan notifikasi admin di memory (dalam production gunakan database)
let adminNotifications: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, bookingId, customerName, serviceName } = body;
    
    // Buat notifikasi baru
    const notification = {
      id: Date.now().toString(),
      type,
      bookingId,
      customerName,
      serviceName,
      message: type === 'new_rating' 
        ? `⭐ Rating baru dari ${customerName} untuk booking ${bookingId}`
        : `Notifikasi: ${type}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    adminNotifications.push(notification);
    
    console.log('🔔 Admin notification created:', notification);
    
    // Dalam production, ini bisa dikirim ke:
    // - WebSocket untuk real-time update
    // - Email ke admin
    // - Push notification ke mobile admin
    
    return NextResponse.json({
      success: true,
      message: 'Notifikasi terkirim ke admin'
    });
    
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only');
    
    let notifications = adminNotifications;
    
    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => !n.read);
    }
    
    return NextResponse.json({
      success: true,
      notifications: notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    });
    
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAsRead } = body;
    
    if (markAsRead) {
      const notification = adminNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        console.log('📖 Notification marked as read:', notificationId);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification updated'
    });
    
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}