
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
  title: 'QR Wise - Pembuat Kode QR Mudah',
  description: 'Buat kode QR dari URL dengan mudah menggunakan QR Wise. Aplikasi SSG Next.js.',
  manifest: '/manifest.json', 
  applicationName: 'QR Wise',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'QR Wise',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F0F8FF' }, 
    { media: '(prefers-color-scheme: dark)', color: '#111827' }, 
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link
          rel="apple-touch-icon"
          href="https://placehold.co/180x180.png"
          data-ai-hint="logo aplikasi"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

    