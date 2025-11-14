// WhatsApp/Email notification service
// In production, this would integrate with actual WhatsApp Business API and email service

export interface NotificationData {
  phone: string;
  name: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  totalPrice: number;
  status: string;
}

export class NotificationService {
  // Simulate WhatsApp notification
  static async sendWhatsAppNotification(data: NotificationData, type: 'new_booking' | 'confirmed' | 'completed' | 'reminder') {
    const messages = {
      new_booking: `🐱 *Pesanan Baru Cat Grooming!*\n\nHai ${data.name},\n\nTerima kasih telah memesan layanan kami! Berikut detail pesanan Anda:\n\n📋 *Detail Pesanan:*\n• ID: #${data.bookingId.slice(-6)}\n• Layanan: ${data.serviceName}\n• Tanggal: ${data.date}\n• Waktu: ${data.time}\n• Alamat: ${data.address}\n• Total: Rp ${data.totalPrice.toLocaleString('id-ID')}\n• Status: Menunggu Konfirmasi Admin\n\n📞 Admin kami akan menghubungi Anda segera untuk konfirmasi.\n\nTerima kasih,\nCat Grooming Service`,
      
      confirmed: `✅ *Pesanan Dikonfirmasi!*\n\nHai ${data.name},\n\nPesanan Anda telah KONFIRMASI! Petugas kami akan datang sesuai jadwal:\n\n📅 *Jadwal Layanan:*\n• Tanggal: ${data.date}\n• Waktu: ${data.time}\n• Alamat: ${data.address}\n\n📞 Petugas akan menghubungi Anda 1 jam sebelum datang.\n\nMohon siapkan kucing dan pastikan alamat sudah benar ya!\n\nTerima kasih,\nCat Grooming Service`,
      
      completed: `🎉 *Layanan Selesai!*\n\nHai ${data.name},\n\nTerima kasih telah menggunakan layanan kami! Semoga kucing Anda senang dan sehat ya! 🐱\n\n📋 *Detail Layanan:*\n• ID: #${data.bookingId.slice(-6)}\n• Layanan: ${data.serviceName}\n• Status: Selesai\n\n💡 *Bantu kami dengan memberikan rating:*\nKunjungi website kami dan berikan ulasan ya!\n\nTerima kasih atas kepercayaan Anda,\nCat Grooming Service`,
      
      reminder: `⏰ *Pengingat Jadwal*\n\nHai ${data.name},\n\nIni adalah pengingat untuk jadwal layanan Anda hari ini:\n\n📅 *Jadwal:*\n• Tanggal: ${data.date}\n• Waktu: ${data.time}\n• Layanan: ${data.serviceName}\n• Alamat: ${data.address}\n\nPetugas kami akan datang tepat waktu. Mohon siapkan kucing Anda!\n\nTerima kasih,\nCat Grooming Service`
    };

    const message = messages[type];
    
    // Log to console (in production, this would send actual WhatsApp message)
    console.log(`📱 WhatsApp Notification to ${data.phone}:`);
    console.log(message);
    console.log('---');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      messageId: `WA_${Date.now()}`,
      type: 'whatsapp',
      recipient: data.phone
    };
  }

  // Simulate Email notification
  static async sendEmailNotification(data: NotificationData, type: 'new_booking' | 'confirmed' | 'completed' | 'reminder') {
    const subjects = {
      new_booking: 'Pesanan Baru - Cat Grooming Service',
      confirmed: 'Pesanan Dikonfirmasi - Cat Grooming Service',
      completed: 'Layanan Selesai - Cat Grooming Service',
      reminder: 'Pengingat Jadwal - Cat Grooming Service'
    };

    const subject = subjects[type];

    // Log to console (in production, this would send actual email)
    console.log(`📧 Email Notification to ${data.phone}@example.com:`);
    console.log(`Subject: ${subject}`);
    console.log(`Booking ID: #${data.bookingId.slice(-6)}`);
    console.log('---');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      messageId: `EMAIL_${Date.now()}`,
      type: 'email',
      recipient: `${data.phone}@example.com`
    };
  }

  // Send both WhatsApp and Email
  static async sendNotification(data: NotificationData, type: 'new_booking' | 'confirmed' | 'completed' | 'reminder') {
    try {
      const [whatsappResult, emailResult] = await Promise.all([
        this.sendWhatsAppNotification(data, type),
        this.sendEmailNotification(data, type)
      ]);

      return {
        success: true,
        whatsapp: whatsappResult,
        email: emailResult
      };
    } catch (error) {
      console.error('Notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get notification history (for admin dashboard)
  static getNotificationHistory() {
    // In production, this would fetch from database
    return [
      {
        id: '1',
        type: 'whatsapp',
        recipient: '08123456789',
        message: 'Pesanan baru dibuat',
        sentAt: new Date().toISOString(),
        status: 'sent'
      },
      {
        id: '2',
        type: 'email',
        recipient: 'customer@example.com',
        message: 'Pesanan dikonfirmasi',
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
    ];
  }
}