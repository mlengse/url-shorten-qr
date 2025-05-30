
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { QrCode as QrCodeIcon, RefreshCw } from 'lucide-react'; // Link2 tidak lagi digunakan

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function HomePageContent() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlToRedirectEncoded = searchParams.get('url');
      if (urlToRedirectEncoded) {
        try {
          const decodedUrl = decodeURIComponent(urlToRedirectEncoded);
          if ((decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) && isValidUrl(decodedUrl)) {
            window.location.href = decodedUrl;
          } else {
            toast({
                title: 'Tautan Lama Tidak Valid',
                description: 'Tautan yang diberikan bukan URL yang valid.',
                variant: 'destructive',
            });
            router.replace('/');
            setIsRedirecting(false);
          }
        } catch (error) {
          console.error('Gagal mendekode URL lama untuk pengalihan:', error);
          toast({
            title: 'Kesalahan Tautan Lama',
            description: 'Tidak dapat memproses tautan lama.',
            variant: 'destructive',
          });
          router.replace('/');
          setIsRedirecting(false);
        }
      } else {
        setIsRedirecting(false);
      }
    }
  }, [searchParams, router, toast]);


  const isValidUrl = (url: string): boolean => {
    try {
      const newUrl = new URL(url);
      return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setQrCodeDataUrl(null);

    if (!longUrl) {
      setErrorMessage('Silakan masukkan URL.');
      return;
    }

    if (!isValidUrl(longUrl)) {
      setErrorMessage('Silakan masukkan URL yang valid (misalnya, https://example.com).');
      return;
    }

    setIsLoading(true);

    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(longUrl)}&format=png&ecc=H`; // Request PNG dan Error Correction High

      const qrImage = new Image();
      qrImage.crossOrigin = "Anonymous"; 

      const logoImage = new Image();
      logoImage.crossOrigin = "Anonymous";
      logoImage.src = '/logo.png'; // Pastikan logo.png ada di folder public

      Promise.all([
        new Promise<void>((resolve, reject) => {
            qrImage.onload = () => resolve();
            qrImage.onerror = () => reject(new Error('Gagal memuat gambar kode QR.'));
            qrImage.src = qrApiUrl;
        }),
        new Promise<void>((resolve, reject) => {
            logoImage.onload = () => resolve();
            logoImage.onerror = () => reject(new Error('Gagal memuat gambar logo. Pastikan logo.png ada di folder /public.'));
        })
      ]).then(() => {
          const canvas = document.createElement('canvas');
          const qrSize = 200; 
          canvas.width = qrSize;
          canvas.height = qrSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
              setErrorMessage('Gagal membuat canvas untuk kode QR.');
              setIsLoading(false);
              return;
          }

          // Gambar kode QR
          ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);

          // Hitung ukuran dan posisi logo
          const logoSizePercentage = 0.25; // Logo mengambil 25% dari lebar QR
          const logoActualWidth = qrSize * logoSizePercentage;
          // Sesuaikan tinggi logo berdasarkan rasio aspek asli logo
          const logoAspectRatio = logoImage.naturalWidth / logoImage.naturalHeight;
          const logoActualHeight = logoActualWidth / logoAspectRatio;

          const logoMargin = 5; // Padding putih di sekitar logo
          
          const bgRectWidth = logoActualWidth + logoMargin * 2;
          const bgRectHeight = logoActualHeight + logoMargin * 2;
          const bgRectX = (qrSize - bgRectWidth) / 2;
          const bgRectY = (qrSize - bgRectHeight) / 2;

          // Gambar latar belakang putih untuk logo (padding)
          ctx.fillStyle = 'white';
          ctx.fillRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight);
          
          // Gambar logo
          const logoX = bgRectX + logoMargin;
          const logoY = bgRectY + logoMargin;
          ctx.drawImage(logoImage, logoX, logoY, logoActualWidth, logoActualHeight);

          setQrCodeDataUrl(canvas.toDataURL('image/png'));
          toast({
              title: 'Kode QR Dibuat!',
              description: 'Kode QR dengan logo untuk URL Anda telah berhasil dibuat.',
          });
          setIsLoading(false);
      }).catch(error => {
          console.error('Kesalahan saat memuat gambar untuk kode QR:', error);
          setErrorMessage(error.message || 'Gagal memuat gambar untuk kode QR.');
          setIsLoading(false);
      });

    } catch (error: any) {
      console.error('Kesalahan saat membuat kode QR:', error);
      setErrorMessage(error.message || 'Gagal membuat kode QR. Silakan coba lagi.');
      setIsLoading(false); // Pastikan di set false jika ada error sinkron awal
    }
  };

  if (isRedirecting) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <RefreshCw className="animate-spin h-12 w-12 text-primary" />
            <p className="mt-4 text-foreground">Memproses tautan...</p>
        </div>
    );
  }

  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12 selection:bg-primary/30 selection:text-primary-foreground">
        <Card className="w-full max-w-lg shadow-xl rounded-xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-3">
                <QrCodeIcon className="h-10 w-10 mr-3 text-primary" />
                <CardTitle className="text-4xl font-bold text-primary tracking-tight">QR Wise</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Buat kode QR dari URL Anda dengan mudah, kini dengan logo!
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="longUrl" className="text-foreground font-medium text-sm">Masukkan URL</Label>
                <Input
                  id="longUrl"
                  type="url"
                  name="longUrl"
                  placeholder="misalnya, https://example.com/halaman/penting"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base focus:ring-primary focus:border-primary"
                  aria-label="Input URL untuk Kode QR"
                />
              </div>
              {errorMessage && (
                <p className="text-sm text-destructive text-center py-2 bg-destructive/10 rounded-md">{errorMessage}</p>
              )}
              <Button type="submit" className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md transition-all duration-150 ease-in-out transform active:scale-95" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="mr-2 h-5 w-5" /> Buat Kode QR
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {qrCodeDataUrl && (
            <CardFooter className="flex flex-col items-center space-y-8 pt-8 px-6 sm:px-8">
              <div className="w-full space-y-4 text-center">
                <h3 className="text-xl font-semibold text-foreground">Kode QR Anda</h3>
                <div className="flex justify-center p-4 bg-muted rounded-lg border border-border">
                  <NextImage
                    src={qrCodeDataUrl}
                    alt="Kode QR untuk URL yang dimasukkan dengan logo"
                    width={180}
                    height={180}
                    className="rounded-md"
                    data-ai-hint="qrcode logo" // Updated hint
                  />
                </div>
                <Button variant="outline" onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCodeDataUrl; 
                    link.download = 'QRWise-KodeQR-dengan-Logo.png'; // Updated filename
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }} className="w-full h-11 border-primary text-primary hover:bg-primary/10 hover:text-primary font-medium rounded-md">
                  <QrCodeIcon className="mr-2 h-5 w-5" /> Unduh Kode QR
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
        <footer className="text-center mt-8 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} QR Wise. Membuat kode QR jadi mudah.</p>
          <p className="text-xs mt-1">Sebelumnya LinkWise.</p>
        </footer>
      </main>
    </>
  );
}
