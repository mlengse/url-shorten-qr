
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Jika GOOGLE_APPLICATION_CREDENTIALS diatur, SDK akan menggunakannya.
    // Jika tidak, dan berjalan di lingkungan Google Cloud (seperti Cloud Functions atau App Engine),
    // SDK akan mencoba menggunakan kredensial default dari service account lingkungan tersebut.
    // Untuk pengembangan lokal dengan service account key JSON, pastikan GOOGLE_APPLICATION_CREDENTIALS
    // menunjuk ke file JSON Anda.
    admin.initializeApp({
      // projectId bisa diambil dari service account atau env var FIREBASE_CONFIG
    });
    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
    // Fallback ke konfigurasi manual jika diperlukan, misalnya dengan FIREBASE_CONFIG
    const firebaseConfigEnv = process.env.FIREBASE_CONFIG;
    if (firebaseConfigEnv) {
        try {
            const serviceAccount = JSON.parse(firebaseConfigEnv);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin SDK initialized with FIREBASE_CONFIG');
        } catch (parseError) {
            console.error('Error parsing FIREBASE_CONFIG or initializing app with it:', parseError);
        }
    } else if (process.env.NODE_ENV !== 'production') {
        // Untuk pengembangan lokal tanpa GOOGLE_APPLICATION_CREDENTIALS, ini akan error.
        // Anda bisa menyediakan konfigurasi eksplisit di sini jika perlu, tapi tidak direkomendasikan untuk produksi.
        console.warn(
          'Firebase Admin SDK not configured. Ensure GOOGLE_APPLICATION_CREDENTIALS is set or running in a Google Cloud environment.'
        );
    }
  }
}

export const firestore = admin.firestore();
export const adminAuth = admin.auth(); // Jika Anda memerlukan autentikasi admin
