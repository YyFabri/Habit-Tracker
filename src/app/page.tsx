'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  initialHabits,
  initialGroups,
  motivationalQuotes,
} from '@/lib/data';
import type { Habit, Group, DayOfWeek } from '@/lib/types';
import { getFunctionalDate, getDayOfWeek, toYYYYMMDD } from '@/lib/date-utils';
import { Header } from '@/components/habitual/Header';
import { DaySelector } from '@/components/habitual/DaySelector';
import { HabitList } from '@/components/habitual/HabitList';
import { MotivationalQuote } from '@/components/habitual/MotivationalQuote';
import { AddHabitDialog } from '@/components/habitual/AddHabitDialog';
import { GroupManagerSheet } from '@/components/habitual/GroupManagerSheet';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [functionalToday, setFunctionalToday] = useState<Date | null>(null);
  const [isAddHabitOpen, setAddHabitOpen] = useState(false);
  const [isGroupManagerOpen, setGroupManagerOpen] = useState(false);
  
  useEffect(() => {
    // Set dates and load data only on the client-side
    const now = new Date();
    setSelectedDate(now);
    setFunctionalToday(getFunctionalDate(now));

    const storedHabits = localStorage.getItem('habits');
    const storedGroups = localStorage.getItem('groups');
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    } else {
      setHabits(initialHabits);
    }
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    } else {
      setGroups(initialGroups);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) { // only run on client
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, selectedDate]);

  useEffect(() => {
    if (selectedDate) { // only run on client
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }, [groups, selectedDate]);

  const handleHabitCompletion = useCallback((habitId: string, date: Date) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setHabits((prevHabits) =>
      prevHabits.map((habit) => {
        if (habit.id === habitId) {
          const dateKey = toYYYYMMDD(date);
          const currentCompletions = habit.completions[dateKey] || 0;
          const newCompletions =
            currentCompletions + 1 > habit.objective
              ? 0
              : currentCompletions + 1;
          return {
            ...habit,
            completions: { ...habit.completions, [dateKey]: newCompletions },
          };
        }
        return habit;
      })
    );
  }, []);

  const handleAddHabit = (newHabit: Omit<Habit, 'id' | 'completions'>) => {
    const habitToAdd: Habit = {
      ...newHabit,
      id: `hbt${Date.now()}`,
      completions: {},
    };
    setHabits((prev) => [...prev, habitToAdd]);
  };

  const handleAddGroup = (name: string) => {
    const newGroup: Group = { id: `grp${Date.now()}`, name };
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleEditGroup = (id: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  };

  const handleDeleteGroup = (id: string) => {
    // Also un-group habits that belonged to this group
    setHabits((prev) => prev.map(h => h.groupId === id ? {...h, groupId: ''} : h));
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  // Don't render anything until the client has hydrated and dates are set
  if (!selectedDate || !functionalToday) {
    return null; // or a loading skeleton
  }

  const dayOfWeek = getDayOfWeek(selectedDate);
  const filteredHabits = habits.filter((habit) =>
    habit.frequency.includes(dayOfWeek)
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header
        selectedDate={selectedDate}
        functionalToday={functionalToday}
        onAddHabit={() => setAddHabitOpen(true)}
        onOpenGroupManager={() => setGroupManagerOpen(true)}
      />

      <main className="flex-grow p-4 md:p-6 space-y-6">
        <DaySelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <HabitList
          habits={filteredHabits}
          groups={groups}
          selectedDate={selectedDate}
          onHabitCompletion={handleHabitCompletion}
        />
        <MotivationalQuote functionalDate={functionalToday} />
      </main>

      <AddHabitDialog
        isOpen={isAddHabitOpen}
        setIsOpen={setAddHabitOpen}
        groups={groups}
        onAddHabit={handleAddHabit}
      />
      <GroupManagerSheet
        isOpen={isGroupManagerOpen}
        setIsOpen={setGroupManagerOpen}
        groups={groups}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
      />
    </div>
  );
}
