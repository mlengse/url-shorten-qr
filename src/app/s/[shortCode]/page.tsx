
import { firestore } from '@/lib/firebase-admin';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { RefreshCw } from 'lucide-react';

type Props = {
  params: { shortCode: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Mengarahkan...',
  };
}

async function getLongUrl(shortCode: string): Promise<string | null> {
  if (!shortCode || typeof shortCode !== 'string' || shortCode.length > 20) { // Batas panjang untuk keamanan
    return null;
  }
  try {
    const docRef = firestore.collection('shortenedUrls').doc(shortCode);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data()?.longUrl as string;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching long URL:", error);
    return null;
  }
}

export default async function ShortLinkPage({ params }: Props) {
  const { shortCode } = params;
  const longUrl = await getLongUrl(shortCode);

  if (longUrl) {
    redirect(longUrl);
  } else {
    // Tampilkan halaman "tidak ditemukan" atau komponen khusus
    // Untuk saat ini, kita akan redirect ke halaman utama setelah delay singkat
    // atau tampilkan pesan "tidak ditemukan" sederhana.
    // Ini seharusnya menjadi `notFound()` dari `next/navigation`
    // namun redirect() lebih dulu dieksekusi jika longUrl ada.
    // Jika tidak, kita bisa render komponen.

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Tautan Tidak Ditemukan</h1>
            <p className="text-foreground mb-6">Maaf, tautan yang Anda cari tidak ada atau telah dihapus.</p>
            <a href="/" className="text-primary hover:underline">Kembali ke Halaman Utama</a>
        </div>
    );

    // Atau, jika Anda ingin langsung 404 tanpa UI kustom:
    // notFound(); 
  }

  // Fallback jika redirect tidak langsung terjadi (seharusnya tidak perlu karena redirect akan menghentikan render)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <RefreshCw className="animate-spin h-12 w-12 text-primary" />
        <p className="mt-4 text-foreground">Mengarahkan Anda...</p>
    </div>
  );
}
