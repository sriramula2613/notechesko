
import React from 'react';
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/types";

interface TaskCardWrapperProps {
  task: Task;
  showActions?: boolean;
}

export function TaskCardWrapper({ task, showActions = true }: TaskCardWrapperProps) {
  return <TaskCard task={task} />;
}
