
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Copy, Link2, QrCode as QrCodeIcon, ExternalLink, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function HomePageContent() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageOrigin, setPageOrigin] = useState<string>('');

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageOrigin(window.location.origin);
      const urlToRedirect = searchParams.get('url');
      if (urlToRedirect) {
        try {
          // Menggunakan decodeURIComponent sebagai ganti atob
          const decodedUrl = decodeURIComponent(urlToRedirect);
          if ((decodedUrl.startsWith('http://') || decodedUrl.startsWith('https://')) && isValidUrl(decodedUrl)) {
            window.location.href = decodedUrl;
          } else {
            toast({
                title: 'Tautan Tidak Valid',
                description: 'Tautan yang diberikan bukan URL yang valid.',
                variant: 'destructive',
            });
            router.replace('/');
            setIsRedirecting(false);
          }
        } catch (error) {
          console.error('Gagal mendekode URL untuk pengalihan:', error);
          toast({
            title: 'Kesalahan',
            description: 'Tidak dapat memproses tautan. Pastikan tautan tidak rusak.',
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
    setShortenedUrl(null);
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
      if (!pageOrigin) {
        setErrorMessage('Tidak dapat menentukan asal halaman. Silakan segarkan.');
        setIsLoading(false);
        return;
      }
      // Menggunakan encodeURIComponent sebagai ganti btoa
      const encodedUrl = encodeURIComponent(longUrl);
      const shortUrl = `${pageOrigin}/?url=${encodedUrl}`;
      setShortenedUrl(shortUrl);

      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
      setQrCodeDataUrl(qrApiUrl);

    } catch (error) {
      console.error('Kesalahan saat membuat tautan pendek atau kode QR:', error);
      setErrorMessage('Gagal memproses URL. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl)
        .then(() => {
          toast({
            title: 'Tersalin!',
            description: 'URL yang dipersingkat disalin ke clipboard.',
          });
        })
        .catch(err => {
          console.error('Gagal menyalin:', err);
          toast({
            title: 'Kesalahan',
            description: 'Gagal menyalin URL.',
            variant: 'destructive',
          });
        });
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
                <Link2 className="h-10 w-10 mr-3 text-primary" />
                <CardTitle className="text-4xl font-bold text-primary tracking-tight">LinkWise</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground text-base">
              Singkatkan URL panjang Anda dengan mudah dan buat kode QR yang dapat dibagikan.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="longUrl" className="text-foreground font-medium text-sm">Masukkan URL Panjang</Label>
                <Input
                  id="longUrl"
                  type="url"
                  name="longUrl"
                  placeholder="misalnya, https://example.com/url/sangat/panjang/untuk/disingkat"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  disabled={isLoading}
                  className="h-12 text-base focus:ring-primary focus:border-primary"
                  aria-label="Input URL panjang"
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
                    <Link2 className="mr-2 h-5 w-5" /> Singkatkan & Buat
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          {(shortenedUrl || qrCodeDataUrl) && (
            <CardFooter className="flex flex-col items-center space-y-8 pt-8 px-6 sm:px-8">
              {shortenedUrl && (
                <div className="w-full space-y-3 text-center">
                  <h3 className="text-xl font-semibold text-foreground">Tautan Singkat Anda</h3>
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg border border-border">
                    <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex-grow text-left text-sm sm:text-base" aria-label="URL yang dipersingkat">
                      {shortenedUrl}
                    </a>
                    <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} aria-label="Salin URL yang dipersingkat" className="text-primary hover:bg-primary/10">
                      <Copy className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => window.open(shortenedUrl, '_blank')} aria-label="Buka URL yang dipersingkat di tab baru" className="text-primary hover:bg-primary/10">
                       <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {qrCodeDataUrl && (
                <div className="w-full space-y-4 text-center">
                  <h3 className="text-xl font-semibold text-foreground">Kode QR</h3>
                  <div className="flex justify-center p-4 bg-muted rounded-lg border border-border">
                    <NextImage
                      src={qrCodeDataUrl}
                      alt="Kode QR untuk URL yang dipersingkat"
                      width={180}
                      height={180}
                      className="rounded-md"
                      data-ai-hint="qrcode pola"
                    />
                  </div>
                  <Button variant="outline" onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCodeDataUrl + "&download=1";
                      link.download = 'LinkWise-KodeQR.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  }} className="w-full h-11 border-primary text-primary hover:bg-primary/10 hover:text-primary font-medium rounded-md">
                    <QrCodeIcon className="mr-2 h-5 w-5" /> Unduh Kode QR
                  </Button>
                </div>
              )}
            </CardFooter>
          )}
        </Card>
        <footer className="text-center mt-8 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} LinkWise. Menyederhanakan tautan Anda.</p>
        </footer>
      </main>
    </>
  );
}
