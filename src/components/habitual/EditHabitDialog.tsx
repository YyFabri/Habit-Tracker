'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Group, Habit, DayOfWeek } from '@/lib/types';

const habitSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  icon: z.string().min(1, 'El icono es obligatorio.'),
  color: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, 'Color inválido.'),
  groupId: z.string().min(1, 'Selecciona un grupo.'),
  objective: z.coerce.number().min(1, 'El objetivo debe ser al menos 1.'),
  frequency: z
    .array(z.string())
    .min(1, 'Selecciona al menos un día de la semana.'),
});

type HabitFormData = z.infer<typeof habitSchema>;

const colors = ['#A0D2EB', '#BCA0EB', '#A0EBD2', '#EBA0A0', '#EBEB_A0', '#A0EBAF'];
const weekDays: { id: DayOfWeek; label: string }[] = [
  { id: 'monday', label: 'L' },
  { id: 'tuesday', label: 'M' },
  { id: 'wednesday', label: 'X' },
  { id: 'thursday', label: 'J' },
  { id: 'friday', label: 'V' },
  { id: 'saturday', label: 'S' },
  { id: 'sunday', label: 'D' },
];

interface EditHabitDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  groups: Group[];
  habit: Habit;
  onEditHabit: (habit: Omit<Habit, 'id' | 'completions'>, habitId: string) => void;
}

export function EditHabitDialog({
  isOpen,
  setIsOpen,
  groups,
  habit,
  onEditHabit,
}: EditHabitDialogProps) {
  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      groupId: habit.groupId,
      objective: habit.objective,
      frequency: habit.frequency,
    },
  });

  useEffect(() => {
    if (habit) {
      form.reset({
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        groupId: habit.groupId,
        objective: habit.objective,
        frequency: habit.frequency,
      });
    }
  }, [habit, form]);

  const onSubmit = (data: HabitFormData) => {
    onEditHabit(
      {
        ...data,
        frequency: data.frequency as DayOfWeek[],
      },
      habit.id
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle>Editar Hábito</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Icono (Emoji)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="💧"
                        {...field}
                        className="text-center text-2xl"
                        maxLength={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nombre del Hábito</FormLabel>
                    <FormControl>
                      <Input placeholder="Beber agua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          type="button"
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            field.value === color
                              ? 'border-primary'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Diario</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frecuencia</FormLabel>
                  <FormControl>
                    <ToggleGroup
                      type="multiple"
                      variant="outline"
                      className="justify-start"
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      {weekDays.map((day) => (
                        <ToggleGroupItem key={day.id} value={day.id}>
                          {day.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
