export type TabType = 'incomplete' | 'completed';

export interface Todo {
  id: string;
  title: string;
  notes?: string | null;
  completed: boolean;
}