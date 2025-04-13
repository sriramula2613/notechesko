
import { Task } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  // Status badges
  const statusBadges = {
    todo: "To Do",
    progress: "In Progress",
    completed: "Completed"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <Card 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          "cursor-grab bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all",
          isDragging && "opacity-50 rotate-1 shadow-xl",
        )}
      >
        <div className="absolute top-3 right-3 cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="h-4 w-4" />
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="mb-2">
            <span className={cn(
              "inline-block text-xs font-medium rounded-full px-2.5 py-1",
              task.status === "todo" && "bg-todo/20 text-todo-foreground",
              task.status === "progress" && "bg-progress/20 text-progress-foreground",
              task.status === "completed" && "bg-completed/20 text-completed-foreground",
            )}>
              {statusBadges[task.status]}
            </span>
          </div>
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {task.description && (
            <CardDescription className="text-sm line-clamp-2 mt-1">
              {task.description}
            </CardDescription>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-gray-50 dark:border-gray-700">
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-full" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
