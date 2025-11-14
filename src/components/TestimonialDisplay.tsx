'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Mail } from 'lucide-react';

interface Rating {
  id: string;
  customerName: string;
  serviceName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'rejected' | 'pending';
  createdAt: string;
}

export default function RatingDisplay() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Memuat rating...</p>
      </div>
    );
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Pelanggan Kami</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Rating dari pelanggan yang puas dengan layanan mandi kucing kami
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratings.map((rating) => (
          <Card key={rating.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                {renderStars(rating.rating)}
              </div>
              
              <div className="text-center mb-4">
                <p className="text-gray-700 italic line-clamp-4">
                  "{rating.comment}"
                </p>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {rating.customerName}
                </div>
                <div className="text-sm text-gray-500">
                  Layanan: {rating.serviceName}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(rating.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}