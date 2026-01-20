import type { Habit, Group } from './types';

export const initialGroups: Group[] = [
  { id: 'grp1', name: 'Mañana' },
  { id: 'grp2', name: 'Tarde' },
  { id: 'grp3', name: 'Noche' },
];

export const initialHabits: Habit[] = [
  {
    id: 'hbt1',
    name: 'Tomar 8 Vasos de Agua',
    icon: '💧',
    color: '#A0D2EB',
    objective: 8,
    frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    groupId: 'grp1',
    completions: {},
  },
  {
    id: 'hbt2',
    name: 'Leer 20 páginas',
    icon: '📚',
    color: '#BCA0EB',
    objective: 1,
    frequency: ['monday', 'wednesday', 'friday'],
    groupId: 'grp3',
    completions: {},
  },
  {
    id: 'hbt3',
    name: 'Meditar 10 minutos',
    icon: '🧘',
    color: '#A0EBD2',
    objective: 1,
    frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    groupId: 'grp1',
    completions: {},
  },
  {
    id: 'hbt4',
    name: 'Hacer ejercicio',
    icon: '🏋️',
    color: '#EBA0A0',
    objective: 1,
    frequency: ['tuesday', 'thursday', 'saturday'],
    groupId: 'grp2',
    completions: {},
  },
    {
    id: 'hbt5',
    name: 'Escribir en el diario',
    icon: '✍️',
    color: '#EBEBA0',
    objective: 1,
    frequency: ['saturday', 'sunday'],
    groupId: 'grp3',
    completions: {},
  },
];

export const motivationalQuotes: string[] = [
  "El secreto para salir adelante es empezar.",
  "La disciplina es el puente entre las metas y los logros.",
  "No tienes que ser grande para empezar, pero tienes que empezar para ser grande.",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "Cree que puedes y ya estás a medio camino.",
  "Tu futuro se crea por lo que haces hoy, no mañana.",
  "La mejor manera de predecir el futuro es crearlo.",
  "La motivación te pone en marcha, el hábito te mantiene en el camino.",
  "Pequeños hábitos diarios conducen a grandes resultados a largo plazo.",
  "Somos lo que hacemos repetidamente. La excelencia, entonces, no es un acto, sino un hábito.",
  "Un pequeño progreso cada día suma grandes resultados.",
  "No cuentes los días, haz que los días cuenten."
];
