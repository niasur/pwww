import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cat Grooming",
  description: "Layanan mandi kucing profesional dengan COD (Cash on Delivery). Pesan online, admin konfirmasi, dan pembayaran di tempat.",
  keywords: ["Cat Grooming", "Kucing", "Mandi Kucing", "COD", "Cash on Delivery", "Pet Grooming", "Next.js", "TypeScript", "Tailwind CSS"],
  authors: [{ name: "Cat Grooming" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Cat Grooming",
    description: "Layanan mandi kucing profesional dengan COD",
    url: "https://cat-grooming-service.com",
    siteName: "Cat Grooming",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cat Grooming",
    description: "Layanan mandi kucing profesional dengan COD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
