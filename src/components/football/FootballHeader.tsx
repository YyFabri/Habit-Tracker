'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

export function FootballHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-1">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" aria-label="Volver a Hábitos">
            <Home className="h-6 w-6" />
          </Button>
        </Link>
        <ModeToggle />
      </div>
      <h1 className="text-xl font-bold text-primary">Habitual Football</h1>
       <div className="w-10"></div>
    </header>
  );
}
