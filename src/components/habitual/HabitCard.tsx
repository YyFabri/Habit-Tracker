'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Habit } from '@/lib/types';
import { toYYYYMMDD } from '@/lib/date-utils';
import { Confetti } from './Confetti';

interface HabitCardProps {
  habit: Habit;
  date: Date;
  onComplete: (habitId: string, date: Date) => void;
}

function SegmentedProgressButton({ objective, completed, onComplete }: { objective: number; completed: number; onComplete: () => void }) {
  const isComplete = completed >= objective;
  let gradientParts: string[] = [];

  if (objective > 1) {
    const segmentAngle = 360 / objective;
    for (let i = 0; i < objective; i++) {
      const startAngle = i * segmentAngle;
      const endAngle = startAngle + segmentAngle;
      const color = i < completed ? 'hsl(var(--primary))' : 'hsl(var(--border))';
      gradientParts.push(`${color} ${startAngle}deg ${endAngle - 2}deg`);
      if (objective > 1) {
         gradientParts.push(`transparent ${endAngle-2}deg ${endAngle}deg`);
      }
    }
  } else {
    gradientParts.push(isComplete ? 'hsl(var(--primary)) 0deg 360deg' : 'hsl(var(--border)) 0deg 360deg');
  }

  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-16 h-16 rounded-full transition-all cursor-pointer",
        isComplete && "scale-105"
      )}
      style={{ background: conicGradient }}
      onClick={onComplete}
    >
      <div className="absolute bg-card w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full flex items-center justify-center">
        {isComplete ? (
          <Check className="w-8 h-8 text-primary" />
        ) : (
          <Plus className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}


export function HabitCard({ habit, date, onComplete }: HabitCardProps) {
  const dateKey = toYYYYMMDD(date);
  const completions = habit.completions[dateKey] || 0;
  const isComplete = completions >= habit.objective;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, dateKey]); // Added dateKey to dependencies to reset confetti on date change


  return (
    <Card className={cn(
        "rounded-3xl shadow-lg border-2 transition-all duration-300 overflow-hidden",
        isComplete ? 'bg-primary/10 border-primary/30' : 'bg-card'
    )}>
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{habit.icon}</div>
          <div>
            <p className={cn(
                "font-bold text-lg",
                isComplete && "line-through text-muted-foreground"
            )}>{habit.name}</p>
            {habit.objective > 1 && (
              <p className="text-sm text-muted-foreground font-medium">
                {completions} / {habit.objective}
              </p>
            )}
          </div>
        </div>

        {habit.objective === 1 ? (
           <Button
            size="icon"
            className={cn(
                "w-16 h-16 rounded-full transition-all duration-300 flex-shrink-0",
                isComplete ? 'bg-primary' : 'bg-muted'
            )}
            onClick={() => onComplete(habit.id, date)}
          >
            <Check className="w-8 h-8" />
          </Button>
        ) : (
            <SegmentedProgressButton 
                objective={habit.objective}
                completed={completions}
                onComplete={() => onComplete(habit.id, date)}
            />
        )}
      </CardContent>
      {showConfetti && <Confetti />}
    </Card>
  );
}
