
import { Task } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const timeAgo = formatDistanceToNow(new Date(task.updated_at), { addSuffix: true });

  // Determine background color based on status
  const statusColors = {
    todo: "bg-todo text-todo-foreground",
    progress: "bg-progress text-progress-foreground",
    completed: "bg-completed text-completed-foreground",
  };

  return (
    <Card 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "mb-2 cursor-grab shadow-sm hover:shadow-md transition-all",
        isDragging && "opacity-50 animate-task-highlight",
      )}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1 pb-2">
        <CardDescription className="text-xs line-clamp-2">
          {task.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {timeAgo}
        </span>
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-destructive hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
