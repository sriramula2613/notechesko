
import { Task } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow, format, isAfter, isBefore, isToday, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, GripVertical, Calendar, Tag, AlertCircle } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  
  // Priority styling
  const priorityStyles = {
    high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    low: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  };

  // Due date styling based on proximity
  const getDueDateStyles = () => {
    if (!task.due_date) return "";
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return "text-red-600 dark:text-red-400 font-medium";
    } else if (isToday(dueDate)) {
      return "text-amber-600 dark:text-amber-400 font-medium";
    } else if (isBefore(dueDate, addDays(today, 3))) {
      return "text-amber-500 dark:text-amber-300";
    } else {
      return "text-green-600 dark:text-green-400";
    }
  };
  
  // Get appropriate icon for due date
  const getDueDateIcon = () => {
    if (!task.due_date) return null;
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    
    if (isBefore(dueDate, today)) {
      return <AlertCircle className="h-3.5 w-3.5 mr-1 text-red-500" />;
    } else if (isToday(dueDate) || isBefore(dueDate, addDays(today, 2))) {
      return <Calendar className="h-3.5 w-3.5 mr-1 text-amber-500" />;
    } else {
      return <Calendar className="h-3.5 w-3.5 mr-1 text-green-500" />;
    }
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
          <div className="mb-2 flex flex-wrap gap-2 items-center">
            <span className={cn(
              "inline-block text-xs font-medium rounded-full px-2.5 py-1",
              task.status === "todo" && "bg-todo/20 text-todo-foreground",
              task.status === "progress" && "bg-progress/20 text-progress-foreground",
              task.status === "completed" && "bg-completed/20 text-completed-foreground",
            )}>
              {statusBadges[task.status]}
            </span>
            
            {task.priority && (
              <span className={cn(
                "inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1 border",
                priorityStyles[task.priority as 'high' | 'medium' | 'low']
              )}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {task.description && (
            <CardDescription className="text-sm line-clamp-2 mt-1">
              {task.description}
            </CardDescription>
          )}
          
          {task.due_date && (
            <div className={cn("flex items-center text-xs mt-3", getDueDateStyles())}>
              {getDueDateIcon()}
              <span>Due {format(new Date(task.due_date), "MMM d")}</span>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
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
