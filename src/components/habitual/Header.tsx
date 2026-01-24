'use client';

import { format, isToday, isTomorrow, isYesterday, isFuture } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, Plus } from 'lucide-react';
import { getFunctionalDate } from '@/lib/date-utils';
import { ModeToggle } from '../ModeToggle';

interface HeaderProps {
  selectedDate: Date | null;
  functionalToday: Date | null;
  onAddHabit: () => void;
  onOpenGroupManager: () => void;
}

export function Header({
  selectedDate,
  functionalToday,
  onAddHabit,
  onOpenGroupManager,
}: HeaderProps) {
  const displayDate = () => {
    if (!selectedDate || !functionalToday) return '';
    const functionalSelectedDate = getFunctionalDate(selectedDate);
    if (isToday(functionalSelectedDate)) return 'Hoy';
    if (isYesterday(functionalSelectedDate)) return 'Ayer';
    if (isTomorrow(functionalSelectedDate)) return 'Mañana';
    return format(selectedDate, 'd MMMM', { locale: es });
  };

  const isFutureDate = selectedDate ? isFuture(selectedDate) && !isToday(getFunctionalDate(selectedDate)) : false;

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onOpenGroupManager}>
          <Menu className="h-6 w-6" />
        </Button>
        <ModeToggle />
         <Link href="/football" passHref>
          <Button variant="ghost" size="icon" aria-label="Juego de Fútbol">
            <span className="text-2xl">⚽️</span>
          </Button>
        </Link>
      </div>
      <h1 className="text-xl font-bold">{displayDate()}</h1>
      <Button
        variant="default"
        size="icon"
        className="rounded-2xl w-12 h-12 shadow-lg"
        onClick={onAddHabit}
        disabled={isFutureDate}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </header>
  );
}
