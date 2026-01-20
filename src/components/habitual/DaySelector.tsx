'use client';

import { format, addDays, isSameDay, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { getFunctionalDate } from '@/lib/date-utils';

interface DaySelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  functionalToday: Date;
}

export function DaySelector({
  selectedDate,
  setSelectedDate,
  functionalToday,
}: DaySelectorProps) {
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(selectedDate, i - 3)
  );

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div className="flex w-max space-x-2 p-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isPast =
            isBefore(getFunctionalDate(day), functionalToday);
          return (
            <div key={day.toISOString()} className="flex flex-col items-center gap-2">
              <Button
                variant={isSelected ? 'default' : 'ghost'}
                className={cn(
                  'flex flex-col h-16 w-16 rounded-full transition-all duration-300',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card/50',
                  isPast && !isSelected && 'opacity-60 bg-muted/50'
                )}
                onClick={() => setSelectedDate(day)}
              >
                <span className="text-xs font-medium capitalize">
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className="text-2xl font-bold">
                  {format(day, 'd')}
                </span>
              </Button>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
