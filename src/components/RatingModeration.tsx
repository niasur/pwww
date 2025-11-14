'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from 'lucide-react';
import RatingDetailModal from './RatingDetailModal';

interface Rating {
  id: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function RatingModeration() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusLabels = {
    pending: 'Menunggu Persetujuan',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  };

  useEffect(() => {
    fetchRatings();
  }, [filter]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moderate-rating${filter !== 'all' ? `?status=${filter}` : ''}`);
      const data = await response.json();
      
      if (data.success) {
        setRatings(data.ratings);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRating(null);
    setSelectedBooking(null);
  };

  const deleteRating = async (ratingId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rating ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-rating?id=${ratingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRatings();
        alert('Rating berhasil dihapus!');
      } else {
        const errorData = await response.json();
        alert(`Gagal menghapus rating: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const moderateRating = async (ratingId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/moderate-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ratingId, action }),
      });

      if (response.ok) {
        fetchRatings();
        alert(`Rating berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}!`);
      } else {
        const errorData = await response.json();
        alert(`Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} rating: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error moderating rating:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderasi Rating</h1>
              <p className="text-gray-600 mt-1">Kelola persetujuan rating pelanggan</p>
            </div>
            <Button onClick={fetchRatings} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries({
            pending: 'Menunggu Persetujuan',
            approved: 'Disetujui',
            rejected: 'Ditolak'
          }).map(([status, label]) => {
            const count = ratings.filter(r => r.status === status).length;
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
                      {status === 'approved' && <CheckCircle className="h-6 w-6" />}
                      {status === 'rejected' && <XCircle className="h-6 w-6" />}
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
            <CardTitle>Filter Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label htmlFor="filter">Status:</label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Persetujuan</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Ratings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Rating</CardTitle>
            <CardDescription>
              Total {ratings.length} rating
              {filter !== 'all' && ` dengan status "${statusLabels[filter as keyof typeof statusLabels]}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Memuat data...</p>
              </div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada rating ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Komentar</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell className="font-mono text-sm">
                          #{rating.id.slice(-6)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{rating.customerName}</div>
                          <div className="text-sm text-gray-500">
                            Booking: #{rating.bookingId.slice(-6)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{rating.serviceName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {renderStars(rating.rating)}
                            <span className="ml-2 text-sm font-medium">({rating.rating}/5)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm italic line-clamp-3">"{rating.comment}"</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[rating.status]}>
                            {statusLabels[rating.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(rating.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRating(rating.id)}
                              title="Hapus Rating"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            {rating.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => moderateRating(rating.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => moderateRating(rating.id, 'reject')}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
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
      </div>
    </div>
  );
}