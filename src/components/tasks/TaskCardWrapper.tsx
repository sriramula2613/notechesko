
import React from 'react';
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/types";

interface TaskCardWrapperProps {
  task: Task;
  showActions?: boolean;
}

export function TaskCardWrapper({ task, showActions = true }: TaskCardWrapperProps) {
  // Provide no-op handlers for onEdit and onDelete as required by TaskCardProps
  const handleEdit = (task: Task) => {
    // No-op for simplified view
  };

  const handleDelete = (taskId: string) => {
    // No-op for simplified view
  };

  return (
    <TaskCard 
      task={task} 
      onEdit={handleEdit} 
      onDelete={handleDelete} 
    />
  );
}
