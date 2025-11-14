'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Calendar,
  Phone,
  MapPin,
  User,
  Scissors
} from 'lucide-react';
import RatingForm from './RatingForm';

interface Booking {
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
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrderTracking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    'in-progress': 'Sedang Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    'in-progress': RefreshCw,
    completed: CheckCircle,
    cancelled: XCircle
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Masukkan nomor telepon atau ID pesanan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to find by phone number first
      let response = await fetch(`/api/bookings?search=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        // If search endpoint doesn't exist, try to get all bookings and filter
        response = await fetch('/api/bookings');
        const data = await response.json();
        
        if (data.success) {
          const found = data.bookings.find((b: Booking) => 
            b.phone === searchQuery || b.id.includes(searchQuery)
          );
          
          if (found) {
            setBooking(found);
          } else {
            setError('Pesanan tidak ditemukan. Periksa kembali nomor telepon atau ID pesanan Anda.');
          }
        } else {
          setError('Terjadi kesalahan. Silakan coba lagi.');
        }
      } else {
        const data = await response.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
        } else {
          setError('Pesanan tidak ditemukan. Periksa kembali nomor telepon atau ID pesanan Anda.');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'pending', label: 'Pesanan Dibuat', completed: true },
      { key: 'confirmed', label: 'Dikonfirmasi Admin', completed: ['confirmed', 'in-progress', 'completed'].includes(currentStatus) },
      { key: 'in-progress', label: 'Petugas Sedang Dalam Perjalanan', completed: ['in-progress', 'completed'].includes(currentStatus) },
      { key: 'completed', label: 'Layanan Selesai', completed: currentStatus === 'completed' }
    ];

    if (currentStatus === 'cancelled') {
      return steps.slice(0, 1);
    }

    return steps;
  };

  const canCancelBooking = (booking: Booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false;
    }

    const now = new Date();
    const bookingTime = new Date(booking.createdAt);
    const timeDiff = now.getTime() - bookingTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    return minutesDiff <= 30;
  };

  const getTimeUntilCancel = (booking: Booking) => {
    const now = new Date();
    const bookingTime = new Date(booking.createdAt);
    const timeDiff = 30 - Math.floor((now.getTime() - bookingTime.getTime()) / (1000 * 60));
    
    if (timeDiff <= 0) return null;
    
    const hours = Math.floor(timeDiff / 60);
    const minutes = timeDiff % 60;
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  const handleCancelBooking = async () => {
    if (!booking || !cancelReason.trim()) {
      alert('Mohon isi alasan pembatalan');
      return;
    }

    setCancelling(true);
    
    try {
      const response = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          cancelReason: cancelReason
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Pesanan berhasil dibatalkan!');
        setShowCancelModal(false);
        setCancelReason('');
        
        // Refresh booking data
        setBooking({
          ...booking,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: cancelReason
        });
      } else {
        alert('Gagal membatalkan pesanan: ' + result.error);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Lacak Pesanan Anda
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Masukkan nomor telepon atau ID pesanan untuk melihat status layanan mandi kucing Anda
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Cari Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Nomor WhatsApp atau ID Pesanan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Mencari...' : 'Cari'}
              </Button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Booking Result */}
        {booking && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = statusIcons[booking.status as keyof typeof statusIcons];
                      return <Icon className="h-5 w-5" />;
                    })()}
                    Status Pesanan
                  </CardTitle>
                  <Badge className={statusColors[booking.status as keyof typeof statusColors]}>
                    {statusLabels[booking.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">

                  {/* Progress Steps */}
                  <div className="space-y-4">
                    {getStatusSteps(booking.status).map((step, index) => (
                      <div key={step.key} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            step.completed ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informasi Pelanggan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nama:</span>
                      <p className="font-medium">{booking.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Telepon:</span>
                      <p className="font-medium">{booking.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Service Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Scissors className="h-4 w-4" />
                    Detail Layanan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Layanan:</span>
                      <p className="font-medium">{booking.serviceName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Harga:</span>
                      <p className="font-medium">{formatCurrency(booking.totalPrice)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <p className="font-medium">{booking.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Waktu:</span>
                      <p className="font-medium">{booking.time}</p>
                    </div>
                  </div>
                  {booking.notes && (
                    <div className="mt-3">
                      <span className="text-gray-500">Catatan:</span>
                      <p className="text-sm mt-1">{booking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat Layanan
                  </h3>
                  <p className="text-sm">{booking.address}</p>
                </div>

                {/* Timestamps */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Waktu
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Dibuat:</span>
                      <p className="font-medium">{formatDate(booking.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Diperbarui:</span>
                      <p className="font-medium">{formatDate(booking.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <div className="space-y-4">
                    {/* Cancel Warning */}
                    {canCancelBooking(booking) && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-orange-800">
                            ⏰ Pesanan dapat dibatalkan dalam: <strong>{getTimeUntilCancel(booking)}</strong>
                          </p>
                        </div>
                        <p className="text-xs text-orange-600">
                          Setelah 30 menit, pesanan tidak dapat dibatalkan
                        </p>
                      </div>
                    )}

                    {/* Cancel Button */}
                    {canCancelBooking(booking) && (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowCancelModal(true)}
                      >
                        Batalkan Pesanan
                      </Button>
                    )}
                    
                    {/* Cannot Cancel Warning */}
                    {!canCancelBooking(booking) && (booking.status === 'pending' || booking.status === 'confirmed') && (
                      <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          ⛔ Pesanan tidak dapat dibatalkan (lebih dari 30 menit)
                          </p>
                          </div>
                        )}

                    {booking.status === 'confirmed' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">
                          📞 Petugas kami akan menghubungi Anda 1 jam sebelum jadwal layanan
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {booking.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      ❌ Pesanan Dibatalkan
                    </p>
                    {booking.cancelledAt && (
                      <p className="text-xs text-red-600 mb-2">
                        Dibatalkan pada: {formatDate(booking.cancelledAt)}
                      </p>
                    )}
                    {booking.cancelReason && (
                      <p className="text-xs text-red-600">
                        Alasan: {booking.cancelReason}
                      </p>
                    )}
                  </div>
                )}

                {booking.status === 'completed' && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <p className="text-sm font-medium text-green-800">
                        ✨ Terima kasih telah menggunakan layanan kami! 
                        Semoga kucing Anda senang dan sehat ya!
                      </p>
                    </div>
                    
                    <RatingForm 
                      bookingId={booking.id}
                      customerName={booking.name}
                      serviceName={booking.serviceName}
                      onRatingSubmitted={() => {
                        // Notifikasi admin bahwa rating telah dikirim
                        fetch('/api/notify-admin', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            type: 'new_rating',
                            bookingId: booking.id,
                            customerName: booking.name,
                            serviceName: booking.serviceName
                          }),
                        });
                      }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Konfirmasi Pembatalan</CardTitle>
                <CardDescription>
                  Apakah Anda yakin ingin membatalkan pesanan ini?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cancelReason">Alasan Pembatalan</Label>
                  <textarea
                    id="cancelReason"
                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 text-sm"
                    placeholder="Contoh: Jadwal berubah, pesanan double, dll."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Perhatian:</strong>
                  </p>
                  <ul className="text-xs text-yellow-700 mt-1 list-disc list-inside">
                    <li>Pesanan yang dibatalkan tidak dapat diaktifkan kembali</li>
                    <li>Admin akan menerima notifikasi pembatalan ini</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                    }}
                    >
                    Batal
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleCancelBooking}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}