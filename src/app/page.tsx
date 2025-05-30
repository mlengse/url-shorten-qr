
import { Suspense } from 'react';
import HomePageContent from './home-page-content';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2 } from 'lucide-react';

function LoadingFallback() {
  // Fallback UI yang sederhana selagi konten utama dimuat
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 py-12 selection:bg-primary/30 selection:text-primary-foreground">
      <Card className="w-full max-w-lg shadow-xl rounded-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Link2 className="h-10 w-10 mr-3 text-primary" />
            <Skeleton className="h-10 w-36" /> {/* Placeholder for CardTitle */}
          </div>
          <Skeleton className="h-4 w-full max-w-xs mx-auto" /> {/* Placeholder for CardDescription */}
        </CardHeader>
        <CardContent className="px-6 sm:px-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Placeholder for Label */}
            <Skeleton className="h-12 w-full" /> {/* Placeholder for Input */}
          </div>
          <Skeleton className="h-12 w-full" /> {/* Placeholder for Button */}
        </CardContent>
      </Card>
      <footer className="text-center mt-8 text-muted-foreground text-sm">
        <Skeleton className="h-4 w-48" /> {/* Placeholder for footer text */}
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
