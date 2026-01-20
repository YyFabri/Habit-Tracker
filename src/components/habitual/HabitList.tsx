'use client';

import type { Habit, Group } from '@/lib/types';
import { HabitCard } from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  groups: Group[];
  selectedDate: Date;
  onHabitCompletion: (habitId: string, date: Date) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  isFuture: boolean;
  onMoveHabit: (habitId: string, direction: 'up' | 'down') => void;
}

export function HabitList({
  habits,
  groups,
  selectedDate,
  onHabitCompletion,
  onEditHabit,
  onDeleteHabit,
  isFuture,
  onMoveHabit,
}: HabitListProps) {
  const groupedHabits = habits.reduce((acc, habit) => {
    const groupId = habit.groupId || 'ungrouped';
    if (!acc[groupId]) {
      acc[groupId] = [];
    }
    acc[groupId].push(habit);
    return acc;
  }, {} as Record<string, Habit[]>);

  const groupOrder = [...groups.map((g) => g.id), 'ungrouped'];

  if (habits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-muted-foreground">
          No hay hábitos para este día.
        </p>
        <p className="text-sm text-muted-foreground">
          ¡Añade uno nuevo para empezar!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupOrder.map((groupId) => {
        const groupHabits = groupedHabits[groupId];
        if (!groupHabits || groupHabits.length === 0) return null;

        const groupInfo = groups.find((g) => g.id === groupId);

        return (
          <div key={groupId} className="space-y-4">
            {groupInfo && (
              <h2 className="text-2xl font-bold text-foreground/80">
                {groupInfo.name}
              </h2>
            )}
            <div className="space-y-3">
              {groupHabits.map((habit, index) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  date={selectedDate}
                  onComplete={onHabitCompletion}
                  onEdit={onEditHabit}
                  onDelete={onDeleteHabit}
                  isFuture={isFuture}
                  onMove={onMoveHabit}
                  isFirstInGroup={index === 0}
                  isLastInGroup={index === groupHabits.length - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
