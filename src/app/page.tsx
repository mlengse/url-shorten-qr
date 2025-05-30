
import { Suspense } from 'react';
import HomePageContent from './home-page-content';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode } from 'lucide-react'; // Mengganti Link2 dengan QrCode

function LoadingFallback() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12 selection:bg-primary/30 selection:text-primary-foreground">
      <Card className="w-full max-w-lg shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-3">
            <QrCode className="h-10 w-10 mr-3 text-primary" /> {/* Mengganti ikon */}
            <Skeleton className="h-10 w-36" /> 
          </div>
          <Skeleton className="h-4 w-full max-w-xs mx-auto" /> 
        </CardHeader>
        <CardContent className="px-6 sm:px-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> 
            <Skeleton className="h-12 w-full" /> 
          </div>
          <Skeleton className="h-12 w-full" /> 
        </CardContent>
      </Card>
      <footer className="text-center mt-8 text-muted-foreground text-sm">
        <Skeleton className="h-4 w-48" /> 
      </footer>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}

    