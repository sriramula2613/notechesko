
import { Column, Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskColumnProps {
  column: Column;
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskColumn({ column, onAddTask, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[300px] p-4 rounded-lg flex flex-col",
        isOver && "bg-muted/50"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn(
          "font-semibold flex items-center gap-2",
          `text-${column.color}`
        )}>
          {column.title}
          <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
            {column.tasks.length}
          </span>
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1"
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}

        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed rounded-lg border-muted">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
