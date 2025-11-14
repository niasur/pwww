'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Mail, Send, CheckCircle, Trash2 } from 'lucide-react';

interface RatingFormProps {
  bookingId: string;
  customerName: string;
  serviceName: string;
  onRatingSubmitted?: () => void;
}

export default function RatingForm({ bookingId, customerName, serviceName, onRatingSubmitted }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Silakan pilih rating terlebih dahulu');
      return;
    }

    if (comment.trim().length < 10) {
      alert('Komentar harus memiliki minimal 10 karakter');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          customerName,
          rating,
          comment: comment.trim(),
          serviceName
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
      } else {
        alert('Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (error) {
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Terima Kasih! 🎉
            </h3>
            <p className="text-green-700">
              Rating dan ulasan Anda telah berhasil dikirim. 
              Review Anda akan ditampilkan setelah persetujuan admin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Berikan Rating & Ulasan
        </CardTitle>
        <CardDescription>
          Bagikan pengalaman Anda dengan layanan {serviceName} kami
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div>
            <Label className="text-base font-medium">Rating Layanan</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Ulasan Anda</Label>
            <Textarea
              id="comment"
              placeholder="Bagikan pengalaman Anda dengan layanan kami. Apa yang paling Anda suka?..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimal 10 karakter
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting ? (
              'Mengirim...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Kirim Rating
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Component to display existing ratings
export function RatingList() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/ratings');
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

  const deleteRating = async (ratingId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus rating ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-rating?id=${ratingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchRatings(); // Refresh the list
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

  if (loading) {
    return <p>Memuat rating...</p>;
  }

  if (ratings.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Belum ada rating</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <Card key={rating.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold">{rating.customerName}</div>
                <div className="text-sm text-gray-500">
                  Layanan: {rating.serviceName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < rating.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteRating(rating.id)}
                  title="Hapus Rating"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-700 italic">"{rating.comment}"</p>
            <div className="mt-3 text-xs text-gray-400">
              {new Date(rating.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}