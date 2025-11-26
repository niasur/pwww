'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin, Phone, Star, Clock, Scissors, Sparkles, Shield, Settings, Search } from 'lucide-react';
import AdminDashboard from '@/components/AdminDashboard';
import OrderTracking from '@/components/OrderTracking';
import RatingDisplay from '@/components/TestimonialDisplay';
import { RatingList } from '@/components/RatingForm';

interface BookingForm {
  name: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

export default function Home() {
  const [selectedService, setSelectedService] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: '',
    phone: '',
    address: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });

  const services = [
    {
      id: 'mandi-biasa',
      name: 'Mandi Biasa',
      price: 50000,
      originalPrice: 75000,
      discount: 50,
      duration: '45-60 menit',
      description: 'Mandi, keringkan, sisir, dan parfum kucing',
      features: ['Sampo kucing premium', 'Pengeringan profesional', 'Sisir bulu', 'Parfum kucing'],
      icon: Sparkles
    },
    {
      id: 'mandi-kutu',
      name: 'Mandi Anti Kutu',
      price: 75000,
      originalPrice: 90000,
      discount: 51,
      duration: '60-75 menit',
      description: 'Mandi dengan treatment khusus anti kutu dan jamur',
      features: ['Sampo anti kutu', 'Treatment kutu', 'Pengeringan profesional', 'Sisir bulu', 'Parfum kucing'],
      icon: Shield,
      popular: true
    },
    {
      id: 'mandi-grooming',
      name: 'Mandi + Grooming Lengkap',
      price: 99000,
      originalPrice: 100000,
      discount: 1,
      duration: '90-120 menit',
      description: 'Mandi lengkap dengan potong kuku dan trimming bulu',
      features: ['Sampo premium', 'Grooming lengkap', 'Potong kuku', 'Trimming bulu', 'Parfum kucing'],
      icon: Scissors
    }
  ];

  const serviceAreas = [
    'Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Tangerang Kota', 'Tangerang Selatan', 'Kab. Tangerang'
  ];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting booking submission...');
    console.log('📝 Form data:', bookingForm);
    
    // Validasi input
    if (!bookingForm.name || !bookingForm.phone || !bookingForm.address || !bookingForm.service || !bookingForm.date || !bookingForm.time) {
      alert('Mohon lengkapi semua field yang wajib diisi!');
      return;
    }

    // Validasi alamat COD (lebih fleksibel)
    const isValidArea = serviceAreas.some(area => 
      bookingForm.address.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(bookingForm.address.toLowerCase())
    );

    console.log('📍 Area validation:', { address: bookingForm.address, isValidArea });

    if (!isValidArea) {
      alert('Maaf, layanan kami belum tersedia di area Anda. Area layanan: ' + serviceAreas.join(', '));
      return;
    }

    // Simpan pesanan ke backend
    try {
      console.log('📡 Sending request to API...');
      
      const requestData = {
        ...bookingForm,
        status: 'pending',
        totalPrice: services.find(s => s.id === bookingForm.service)?.price || 0
      };
      
      console.log('📦 Request data:', requestData);

      // Check if we're in browser and fetch is available
      if (typeof window === 'undefined') {
        console.error('❌ Not running in browser environment');
        alert('Error: Not in browser environment');
        return;
      }

      const response = await fetch((typeof window !== 'undefined' ? window.location.origin : '') + '/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📬 Response status:', response.status);
      console.log('📬 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success response:', result);
        alert('Pesanan berhasil dibuat! Kami akan menghubungi Anda untuk konfirmasi.\n\nID Pesanan: #' + result.booking.id.slice(-6));
        setShowBookingForm(false);
        setBookingForm({
          name: '',
          phone: '',
          address: '',
          service: '',
          date: '',
          time: '',
          notes: ''
        });
      } else {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        alert('Terjadi kesalahan: ' + (errorData.error || 'Silakan coba lagi.'));
      }
    } catch (error) {
      console.error('💥 Network/JavaScript Error:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert('Terjadi kesalahan jaringan. Silakan coba lagi.\n\nError: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper authentication)
    if (adminPassword === 'admin123') {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword('');
    } else {
      alert('Password salah!');
    }
  };

  // If admin mode is active, show admin dashboard
  if (isAdminMode) {
    return (
      <div>
        <div className="bg-white border-b p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Dashboard - Cat Grooming Service</h1>
            <Button onClick={() => setIsAdminMode(false)} variant="outline">
              Kembali ke Website
            </Button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // If tracking mode is active, show tracking page
  if (showTracking) {
    return (
      <div>
        <div className="bg-white border-b p-4">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">Lacak Pesanan - Cat Grooming Service</h1>
            <Button onClick={() => setShowTracking(false)} variant="outline">
              Kembali ke Beranda
            </Button>
          </div>
        </div>
        <OrderTracking />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Admin Access Button */}
      <div className="fixed top-4 right-4 z-40">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAdminLogin(true)}
          className="bg-white/80 backdrop-blur"
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Login Admin</CardTitle>
              <CardDescription>Masukkan password untuk mengakses dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAdminLogin(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

    {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-pink-400 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
   
    {/* Brand Logo */}
    <div className="flex items-center mb-4">
      <img src="/logobb.png" alt="WITHLUV Logo" className="h-12 w-auto" />
      <h1 className="text-2xl md:text-3xl font-bold m-0 -ml-1 -mt-0.5">
        WITHLUV
        </h1>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Kucing Bersih,<br/>Makin Lucu & Sehat
          </h1>
                  
              <p className="text-xl mb-8 text-white/90">
                Layanan mandi kucing profesional di rumah Anda. 
                Petugas datang ke lokasi, hasil memuaskan, bayar di tempat (COD)!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-orange-500 hover:bg-orange-50"
                  onClick={() => setShowBookingForm(true)}
                >
                  Pesan Sekarang
                </Button>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold" asChild>
                  <a 
                    href="https://wa.me/628989878274?text=Halo%2C%20saya%20tertarik%20untuk%20pesan%20jasa%20mandi%20kucing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Hubungi Kami
                  </a>
                </Button>
                <Button size="lg" className="bg-white text-orange-500 hover:bg-orange-50" onClick={() => setShowTracking(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  Lacak Pesanan
                </Button>
              </div>
            </div>
            
<div className="hidden md:flex justify-center">
  <img 
    src="/splash.png" 
    alt="Splash" 
    className="w-[500px] h-[400px] object-cover rounded-xl shadow-2xl"
  />
</div>

          </div>
        </div>
      </section>

{/* Service & Business Areas */}
<section className="py-8 bg-white shadow-sm">
  <div className="container mx-auto px-4 flex flex-col items-center space-y-6 text-gray-600">

    {/* Jam Operasional */}
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-orange-500" />
        <span className="font-medium">Jam Operasional (Berlaku untuk Semua Cabang):</span>
      </div>
      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
        Setiap Hari     |     09.00 - 16.00
      </Badge>
    </div>

    {/* Area Layanan */}
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-6 w-6 text-orange-500" />
        <span className="font-medium">Area Layanan:</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {serviceAreas.map((area, index) => (
          <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
            {area}
          </Badge>
        ))}
      </div>
    </div>

  </div>
</section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Paket Layanan Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih paket yang sesuai dengan kebutuhan kucing kesayangan Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className={`relative hover:shadow-lg transition-shadow ${service.popular ? 'ring-2 ring-orange-500' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-orange-500 hover:bg-orange-600">
                        Paling Populer
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                    <div className="mt-2">
                      <div className="text-sm text-gray-500 line-through">
                        IDR {Math.round(service.originalPrice / 1000)}K
                      </div>
                      <div className="text-3xl font-bold text-orange-500">
                        IDR {Math.round(service.price / 1000)}K
                      </div>
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200 mt-1">
                        diskon {service.discount}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {service.duration}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedService(service.id);
                        setBookingForm({...bookingForm, service: service.id});
                        setShowBookingForm(true);
                      }}
                    >
                      Pilih Paket
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Pemesanan Mudah</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              3 langkah mudah untuk mendapatkan layanan mandi kucing profesional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Pesan Online</h3>
              <p className="text-gray-600">
                Pilih paket layanan dan isi form pemesanan dengan alamat lengkap
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Petugas Datang</h3>
              <p className="text-gray-600">
                Tim profesional kami datang ke rumah Anda dengan peralatan lengkap
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Bayar di Tempat</h3>
              <p className="text-gray-600">
                Periksa hasil puas, lalu bayar tunai (COD) tanpa repot
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Ratings */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <RatingDisplay />
        </div>
      </section>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Form Pemesanan Layanan</CardTitle>
              <CardDescription>
                Isi data lengkap untuk pemesanan jasa mandi kucing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Nomor WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Alamat Lengkap</Label>
                  <Textarea
                    id="address"
                    placeholder="Contoh: Jl. Sudirman No. 123, Jakarta Pusat"
                    value={bookingForm.address}
                    onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Area layanan: {serviceAreas.join(', ')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="service">Paket Layanan</Label>
                  <Select value={bookingForm.service} onValueChange={(value) => setBookingForm({...bookingForm, service: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih paket layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - IDR {Math.round(service.price / 1000)}K
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Waktu</Label>
                    <Select value={bookingForm.time} onValueChange={(value) => setBookingForm({...bookingForm, time: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih waktu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="11:00">11:00</SelectItem>
                        <SelectItem value="13:00">13:00</SelectItem>
                        <SelectItem value="14:00">14:00</SelectItem>
                        <SelectItem value="15:00">15:00</SelectItem>
                        <SelectItem value="16:00">16:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Contoh: Kucing saya takut dengan suara keras"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  />
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">
                    💡 Pembayaran COD (Bayar di Tempat)
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Anda akan membayar tunai setelah layanan selesai dan puas dengan hasilnya.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Konfirmasi Pesanan
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowBookingForm(false)}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Footer */}
<footer className="bg-white mt-4">
  <div className="container mx-auto px-4 py-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Brand */}
      <div className="text-center md:text-left">
        <h3 className="text-xl font-bold text-orange-600">WITHLUV</h3>
        <p className="text-gray-600 text-sm">
          Made with ❤️ for Cat Lovers
        </p>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-6">
        
        {/* Instagram */}
        <a 
          href="https://www.instagram.com/withluv.anabul" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-orange-500 transition"
        >
          <img src="/ig.png" alt="Instagram" className="h-7 w-7" />
        </a>

        {/* TikTok */}
        <a 
          href="https://tiktok.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-orange-500 transition"
        >
          <img src="/tiktok.png" alt="TikTok" className="h-7 w-7" />
        </a>

        {/* WhatsApp */}
        <a 
          href="https://wa.me/628989878274" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-green-500 transition"
        >
          <img src="/wa.png" alt="WhatsApp" className="h-7 w-7" />
        </a>
      </div>
    </div>

    {/* Copyright */}
    <div className="text-center text-sm text-gray-500 mt-6">
      © 2025 WITHLUV. All Rights Reserved.
    </div>
  </div>
</footer>
    </div>
  );
}