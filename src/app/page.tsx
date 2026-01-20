'use client';

import { useState, useEffect, useCallback } from 'react';
import { isFuture } from 'date-fns';
import {
  initialHabits,
  initialGroups,
} from '@/lib/data';
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

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [functionalToday, setFunctionalToday] = useState<Date | null>(null);

  const [isAddHabitOpen, setAddHabitOpen] = useState(false);
  const [isEditHabitOpen, setEditHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [isGroupManagerOpen, setGroupManagerOpen] = useState(false);
  
  useEffect(() => {
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
    if (habits.length > 0) {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }, [groups]);

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

  const handleUpdateHabit = (updatedHabit: Omit<Habit, 'id' | 'completions'>, habitId: string) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updatedHabit } : h));
    setEditingHabit(null);
  };

  const handleConfirmDelete = () => {
    if (deletingHabitId) {
      setHabits(prev => prev.filter(h => h.id !== deletingHabitId));
      setDeletingHabitId(null);
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
    setHabits((prev) => prev.map(h => h.groupId === id ? {...h, groupId: ''} : h));
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  if (!selectedDate || !functionalToday) {
    return null; 
  }

  const dayOfWeek = getDayOfWeek(selectedDate);
  const filteredHabits = habits.filter((habit) =>
    habit.frequency.includes(dayOfWeek)
  );

  const isFutureDate = isFuture(selectedDate);

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
          isOpen={isEditHabitOpen}
          setIsOpen={setEditHabitOpen}
          groups={groups}
          habit={editingHabit}
          onEditHabit={handleUpdateHabit}
        />
      )}
      <AlertDialog open={!!deletingHabitId} onOpenChange={() => setDeletingHabitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el hábito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingHabitId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
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
