'use client';

import { useState, useEffect, useCallback } from 'react';
import { isFuture, isToday } from 'date-fns';
import { initialHabits, initialGroups } from '@/lib/data';
import type { Habit, Group, DayOfWeek } from '@/lib/types';
import { getFunctionalDate, getDayOfWeek, toYYYYMMDD } from '@/lib/date-utils';
import { Header } from '@/components/habitual/Header';
import { DaySelector } from '@/components/habitual/DaySelector';
import { HabitList } from '@/components/habitual/HabitList';
import { MotivationalQuote } from '@/components/habitual/MotivationalQuote';
import { AddHabitDialog } from '@/components/habitual/AddHabitDialog';
import { EditHabitDialog } from '@/components/habitual/EditHabitDialog';
import { GroupManagerSheet } from '@/components/habitual/GroupManagerSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [functionalToday, setFunctionalToday] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [isAddHabitOpen, setAddHabitOpen] = useState(false);
  const [isEditHabitOpen, setEditHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [isGroupManagerOpen, setGroupManagerOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // This effect runs once on mount to initialize the state
    const now = new Date();
    setSelectedDate(now);
    setFunctionalToday(getFunctionalDate(now));

    try {
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
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      setHabits(initialHabits);
      setGroups(initialGroups);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    // This effect synchronizes habits to localStorage whenever they change
    // We check for initial mount scenario where habits might be empty before being loaded.
    if (habits.length > 0 || localStorage.getItem('habits')) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits, isClient]);

  useEffect(() => {
    if (!isClient) return;
    // This effect synchronizes groups to localStorage whenever they change
    if (groups.length > 0 || localStorage.getItem('groups')) {
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }, [groups, isClient]);

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

  const handleOpenEditDialog = (habit: Habit) => {
    setEditingHabit(habit);
    setEditHabitOpen(true);
  };

  const handleUpdateHabit = (
    updatedHabitData: Omit<Habit, 'id' | 'completions'>
  ) => {
    if (!editingHabit) return;

    const updatedHabits = habits.map((h) =>
      h.id === editingHabit.id ? { ...h, ...updatedHabitData, completions: h.completions } : h
    );
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
    window.location.reload();
  };

  const handleConfirmDelete = () => {
    if (deletingHabitId) {
      const updatedHabits = habits.filter((h) => h.id !== deletingHabitId);
      localStorage.setItem('habits', JSON.stringify(updatedHabits));
      window.location.reload();
    }
  };

  const handleAddGroup = (name: string) => {
    const newGroup: Group = { id: `grp${Date.now()}`, name };
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleEditGroup = (id: string, name: string) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  };

  const handleDeleteGroup = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.groupId === id ? { ...h, groupId: '' } : h))
    );
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  if (!isClient || !selectedDate || !functionalToday) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </header>
        <main className="flex-grow p-4 md:p-6 space-y-6">
          <Skeleton className="h-20 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-3xl" />
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const dayOfWeek = getDayOfWeek(selectedDate);
  const filteredHabits = habits.filter((habit) =>
    habit.frequency.includes(dayOfWeek)
  );

  const isFutureDate =
    isFuture(selectedDate) && !isToday(getFunctionalDate(selectedDate));

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
          functionalToday={functionalToday}
        />
        <HabitList
          habits={filteredHabits}
          groups={groups}
          selectedDate={selectedDate}
          onHabitCompletion={handleHabitCompletion}
          onEditHabit={handleOpenEditDialog}
          onDeleteHabit={setDeletingHabitId}
          isFuture={isFutureDate}
        />
        <MotivationalQuote functionalDate={functionalToday} />
      </main>

      <AddHabitDialog
        isOpen={isAddHabitOpen}
        setIsOpen={setAddHabitOpen}
        groups={groups}
        onAddHabit={handleAddHabit}
      />
      {editingHabit && (
        <EditHabitDialog
          key={editingHabit.id}
          isOpen={isEditHabitOpen}
          onClose={() => {
            setEditHabitOpen(false);
            setEditingHabit(null);
          }}
          groups={groups}
          habit={editingHabit}
          onEditHabit={handleUpdateHabit}
        />
      )}
      <AlertDialog
        open={!!deletingHabitId}
        onOpenChange={() => setDeletingHabitId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              hábito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingHabitId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
