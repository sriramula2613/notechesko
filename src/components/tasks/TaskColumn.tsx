
import { Column, Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.div 
      ref={setNodeRef}
      className={cn(
        "h-full bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col",
        isOver && "ring-2 ring-primary/40 bg-primary/5"
      )}
      animate={{ 
        scale: isOver ? 1.02 : 1,
        boxShadow: isOver ? "0 8px 24px rgba(0, 0, 0, 0.12)" : "0 4px 12px rgba(0, 0, 0, 0.05)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn(
            "font-medium flex items-center gap-2 text-lg",
            `text-${column.color}`
          )}>
            {column.title}
            <span className="bg-primary/10 text-primary text-xs font-bold rounded-full px-2.5 py-0.5">
              {column.tasks.length}
            </span>
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 border border-dashed rounded-lg border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {column.tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
