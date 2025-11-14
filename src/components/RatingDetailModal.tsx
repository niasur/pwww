'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, User, MapPin, Phone, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';

interface RatingDetailModalProps {
  rating: {
    id: string;
    bookingId: string;
    customerName: string;
    serviceName: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
  } | null;
  booking?: {
    name: string;
    phone: string;
    address: string;
    date: string;
    time: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (ratingId: string) => void;
  onModerate: (ratingId: string, action: 'approve' | 'reject') => void;
}

export default function RatingDetailModal({ 
  rating, 
  booking, 
  isOpen, 
  onClose, 
  onDelete, 
  onModerate 
}: RatingDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  if (!rating) return null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus rating ini? Tindakan ini tidak bisa dibatalkan.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(rating.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModerate = async (action: 'approve' | 'reject') => {
    setIsModerating(true);
    try {
      await onModerate(rating.id, action);
      onClose();
    } finally {
      setIsModerating(false);
    }
  };

  const isNegativeRating = rating.rating <= 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Detail Rating
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap rating dari pelanggan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {renderStars(rating.rating)}
                <span className="ml-2 text-lg font-semibold">({rating.rating}/5)</span>
              </div>
              {isNegativeRating && (
                <Badge variant="destructive" className="animate-pulse">
                  Rating Negatif
                </Badge>
              )}
            </div>
            <Badge className={statusColors[rating.status]}>
              {statusLabels[rating.status]}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Pelanggan
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nama:</span> {rating.customerName}
                </div>
                {booking && (
                  <>
                    <div>
                      <span className="font-medium">Telepon:</span> {booking.phone}
                    </div>
                    <div>
                      <span className="font-medium">Alamat:</span> {booking.address}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informasi Layanan
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Layanan:</span> {rating.serviceName}
                </div>
                <div>
                  <span className="font-medium">Booking ID:</span> #{rating.bookingId.slice(-6)}
                </div>
                {booking && (
                  <>
                    <div>
                      <span className="font-medium">Tanggal:</span> {booking.date}
                    </div>
                    <div>
                      <span className="font-medium">Waktu:</span> {booking.time}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rating Comment */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Ulasan Pelanggan</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 italic">"{rating.comment}"</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium">Dibuat:</span> {formatDate(rating.createdAt)}
            </div>
            {rating.updatedAt !== rating.createdAt && (
              <div>
                <span className="font-medium">Diperbarui:</span> {formatDate(rating.updatedAt)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isModerating}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Menghapus...' : 'Hapus Rating'}
            </Button>

            {rating.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleModerate('approve')}
                  disabled={isDeleting || isModerating}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {isModerating ? 'Memproses...' : 'Setujui'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleModerate('reject')}
                  disabled={isDeleting || isModerating}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {isModerating ? 'Memproses...' : 'Tolak'}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isDeleting || isModerating}
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}