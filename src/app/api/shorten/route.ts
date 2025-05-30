
import { type NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Fungsi untuk menghasilkan string acak sebagai kode pendek
function generateShortCode(length: number = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { longUrl } = await request.json();

    if (!longUrl || typeof longUrl !== 'string') {
      return NextResponse.json({ error: 'URL panjang tidak valid' }, { status: 400 });
    }

    try {
      new URL(longUrl); // Validasi sederhana
    } catch (e) {
      return NextResponse.json({ error: 'Format URL panjang tidak valid' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.error('NEXT_PUBLIC_BASE_URL tidak diatur');
      return NextResponse.json({ error: 'Konfigurasi server error' }, { status: 500 });
    }

    let shortCode = generateShortCode();
    const linksCollection = firestore.collection('shortenedUrls');
    
    // Cek potensi kolisi, coba beberapa kali jika perlu (sederhana untuk contoh ini)
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
      const docSnapshot = await linksCollection.doc(shortCode).get();
      if (!docSnapshot.exists) {
        break; // Kode unik ditemukan
      }
      shortCode = generateShortCode(); // Coba kode baru
      attempts++;
    }

    if (attempts >= maxAttempts) {
        console.error('Gagal menghasilkan kode unik setelah beberapa percobaan');
        return NextResponse.json({ error: 'Gagal menghasilkan kode unik' }, { status: 500 });
    }

    await linksCollection.doc(shortCode).set({
      longUrl: longUrl,
      createdAt: Timestamp.now(),
    });

    const shortUrl = `${baseUrl}/s/${shortCode}`;

    return NextResponse.json({ shortUrl, qrData: shortUrl }, { status: 201 });
  } catch (error) {
    console.error('Kesalahan saat membuat tautan pendek:', error);
    return NextResponse.json({ error: 'Kesalahan internal server' }, { status: 500 });
  }
}
