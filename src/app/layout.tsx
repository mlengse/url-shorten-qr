import type {Metadata, Viewport} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; 

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LinkWise - Penyingkat URL & Pembuat Kode QR',
  description: 'Singkatkan URL panjang dan buat kode QR dengan mudah menggunakan LinkWise. Aplikasi SSG Next.js.',
  manifest: '/manifest.json', // Added manifest link
  applicationName: 'LinkWise',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LinkWise',
  },
  formatDetection: {
    telephone: false,
  },
  // Open Graph and Twitter card metadata can also be added here for better sharing
};

// Adding Viewport configuration for PWA
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F0F8FF' }, // Light theme background
    { media: '(prefers-color-scheme: dark)', color: '#111827' }, // Dark theme background example, adjust if needed
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Optional: disable zooming
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* 
          These PWA-related tags are often handled by next-pwa or through the manifest,
          but adding some common ones here for broader compatibility.
          The manifest link is now in the metadata object.
        */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link
          rel="apple-touch-icon"
          href="https://placehold.co/180x180.png"
          data-ai-hint="logo app"
        />
        {/* You would typically add more icon sizes for apple-touch-icon if needed */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
