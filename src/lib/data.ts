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
    groupIds: ['grp1', 'grp2'],
    completions: {},
  },
  {
    id: 'hbt2',
    name: 'Leer 20 páginas',
    icon: '📚',
    color: '#BCA0EB',
    objective: 1,
    frequency: ['monday', 'wednesday', 'friday'],
    groupIds: ['grp3'],
    completions: {},
  },
  {
    id: 'hbt3',
    name: 'Meditar 10 minutos',
    icon: '🧘',
    color: '#A0EBD2',
    objective: 1,
    frequency: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    groupIds: ['grp1'],
    completions: {},
  },
  {
    id: 'hbt4',
    name: 'Hacer ejercicio',
    icon: '🏋️',
    color: '#EBA0A0',
    objective: 1,
    frequency: ['tuesday', 'thursday', 'saturday'],
    groupIds: ['grp2'],
    completions: {},
  },
    {
    id: 'hbt5',
    name: 'Escribir en el diario',
    icon: '✍️',
    color: '#EBEBA0',
    objective: 1,
    frequency: ['saturday', 'sunday'],
    groupIds: ['grp3'],
    completions: {},
  },
];

export const motivationalQuotes: string[] = [
  "La disciplina es el puente entre las metas y los logros. Sigue construyendo ese puente, ladrillo a ladrillo.",
  "El éxito no es para los que piensan que pueden hacer algo, sino para los que lo hacen. ¡Hoy es un día para hacer!",
  "La única mala sesión de entrenamiento es la que no se hizo. No te saltes la tuya.",
  "Tu cuerpo puede soportar casi cualquier cosa. Es tu mente la que tienes que convencer.",
  "No cuentes los días, haz que los días cuenten. Cada hábito completado es una victoria.",
  "El dolor que sientes hoy será la fuerza que sentirás mañana. ¡Sigue adelante!",
  "La motivación es lo que te pone en marcha. El hábito es lo que hace que sigas.",
  "No se trata de ser perfecto. Se trata de ser mejor de lo que eras ayer.",
  "Un pequeño progreso cada día se suma a grandes resultados. No subestimes el poder de la constancia.",
  "Despierta con determinación. Acuéstate con satisfacción.",
  "No busques excusas para no hacerlo, busca razones para hacerlo. Tu yo del futuro te lo agradecerá.",
  "La diferencia entre querer y lograr es la disciplina. Mantén el enfoque."
];
