export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex color
  objective: number; // 1 for simple, >1 for counter
  frequency: DayOfWeek[];
  groupIds: string[];
  completions: Record<string, number>; // date string 'YYYY-MM-DD' -> count
}

export interface Group {
  id: string;
  name: string;
}
