'use client';

import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Menu, Plus } from 'lucide-react';
import { getFunctionalDate } from '@/lib/date-utils';

interface HeaderProps {
  selectedDate: Date;
  functionalToday: Date;
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
    const functionalSelectedDate = getFunctionalDate(selectedDate);
    if (isToday(functionalSelectedDate)) return 'Hoy';
    if (isYesterday(functionalSelectedDate)) return 'Ayer';
    if (isTomorrow(functionalSelectedDate)) return 'Mañana';
    return format(selectedDate, 'd MMMM', { locale: es });
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
      <Button variant="ghost" size="icon" onClick={onOpenGroupManager}>
        <Menu className="h-6 w-6" />
      </Button>
      <h1 className="text-xl font-bold">{displayDate()}</h1>
      <Button variant="default" size="icon" className="rounded-2xl w-12 h-12 shadow-lg" onClick={onAddHabit}>
        <Plus className="h-6 w-6" />
      </Button>
    </header>
  );
}
