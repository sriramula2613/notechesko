
export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
  due_date?: string | null;
  priority?: 'high' | 'medium' | 'low' | null;
  tags?: string[] | null;
}

export type TaskStatus = 'todo' | 'progress' | 'completed';

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}
