'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Phone, 
  MapPin, 
  Calendar,
  User,
  RefreshCw,
  Bell,
  Star,
  Mail
} from 'lucide-react';
import RatingModeration from './RatingModeration';
import { RatingList } from './RatingForm';

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
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'bookings' | 'ratings'>('bookings');

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

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notify-admin?unread_only=true');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/bookings${filter !== 'all' ? `?status=${filter}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      console.log('Updating booking:', { bookingId, newStatus });
      
      // Try to alternative API first
      const response = await fetch('/api/update-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        fetchBookings();
        alert('Status pesanan berhasil diperbarui!');
      } else {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        alert(`Gagal memperbarui status pesanan: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notify-admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          notificationId, 
          markAsRead: true 
        }),
      });
      
      // Update local state
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600 mt-1">Kelola aktivitas layanan jasa mandi kucing panggilan</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={fetchBookings} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <div className="flex space-x-4">
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('bookings')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Pesanan
            </Button>
            <Button
              variant={activeTab === 'ratings' ? 'default' : 'outline'}
              onClick={() => setActiveTab('ratings')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Ratings
            </Button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'bookings' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Object.entries({
                pending: 'Menunggu Konfirmasi',
                confirmed: 'Dikonfirmasi',
                'in-progress': 'Sedang Berlangsung',
                completed: 'Selesai'
              }).map(([status, label]) => {
                const count = bookings.filter(b => b.status === status).length;
                return (
                  <Card key={status}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{label}</p>
                          <p className="text-2xl font-bold">{count}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusColors[status as keyof typeof statusColors]}`}>
                          {status === 'pending' && <Clock className="h-6 w-6" />}
                          {status === 'in-progress' && <RefreshCw className="h-6 w-6" />}
                          {status === 'completed' && <CheckCircle className="h-6 w-6" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filter */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filter Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Label htmlFor="filter">Status:</Label>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu Konfirmasi</SelectItem>
                      <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                      <SelectItem value="in-progress">Sedang Berlangsung</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pesanan</CardTitle>
                <CardDescription>
                  Total {bookings.length} pesanan
                  {filter !== 'all' && ` dengan status "${statusLabels[filter as keyof typeof statusLabels]}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p>Memuat data...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Layanan</TableHead>
                          <TableHead>Jadwal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-sm">
                              #{booking.id.slice(-6)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.name}</div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.serviceName}</div>
                                <div className="text-sm text-gray-500">
                                  {formatCurrency(booking.totalPrice)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {booking.date}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {booking.time}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status]}>
                                {statusLabels[booking.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(booking.totalPrice)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  Detail
                                </Button>
                                
                                {booking.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  >
                                    Konfirmasi
                                  </Button>
                                )}
                                
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                                  >
                                    Mulai
                                  </Button>
                                )}
                                
                                {booking.status === 'in-progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  >
                                    Selesai
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <RatingModeration />
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detail Pesanan #{selectedBooking.id.slice(-6)}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informasi Pelanggan
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nama:</span>
                      <p className="font-medium">{selectedBooking.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Telepon:</span>
                      <p className="font-medium">{selectedBooking.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Alamat Layanan
                  </h3>
                  <p className="text-sm">{selectedBooking.address}</p>
                </div>

                {/* Service Info */}
                <div>
                  <h3 className="font-semibold mb-3">Detail Layanan</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Layanan:</span>
                      <p className="font-medium">{selectedBooking.serviceName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Harga:</span>
                      <p className="font-medium">{formatCurrency(selectedBooking.totalPrice)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <p className="font-medium">{selectedBooking.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Waktu:</span>
                      <p className="font-medium">{selectedBooking.time}</p>
                    </div>
                  </div>
                  {selectedBooking.notes && (
                    <div className="mt-3">
                      <span className="text-gray-500">Catatan:</span>
                      <p className="text-sm mt-1">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-semibold mb-3">Status Pesanan</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={statusColors[selectedBooking.status]}>
                      {statusLabels[selectedBooking.status]}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Diperbarui: {formatDate(selectedBooking.updatedAt)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {selectedBooking.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'confirmed');
                            setSelectedBooking(null);
                          }}
                        >
                          Konfirmasi Pesanan
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'cancelled');
                            setSelectedBooking(null);
                          }}
                        >
                          Tolak Pesanan
                        </Button>
                      </>
                    )}
                    
                    {selectedBooking.status === 'confirmed' && (
                      <Button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'in-progress');
                          setSelectedBooking(null);
                        }}
                      >
                        Mulai Layanan
                      </Button>
                    )}
                    
                    {selectedBooking.status === 'in-progress' && (
                      <Button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'completed');
                          setSelectedBooking(null);
                        }}
                      >
                        Selesaikan Layanan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rating Pelanggan
              </CardTitle>
              <CardDescription>
                Rating dan ulasan dari pelanggan yang sudah menggunakan layanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RatingList />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
