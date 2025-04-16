
import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { TaskColumn } from "./tasks/TaskColumn";
import { Column, Task, TaskStatus } from "@/types";
import { motion } from "framer-motion";
import { useTaskOperations } from "@/hooks/useTaskOperations";
import { DeleteTaskDialog } from "./tasks/DeleteTaskDialog";
import { TaskDialogManager } from "./tasks/TaskDialogManager";
import { KanbanBoardHeader } from "./tasks/KanbanBoardHeader";

interface KanbanBoardProps {
  initialColumns: Column[];
}

export function KanbanBoard({ initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  
  const { activeTask, setActiveTask, handleDragEnd, handleDeleteTask } = useTaskOperations(columns, setColumns);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as Task;
    
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Handle drag over events if needed
  };

  const handleDragEndEvent = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // Find the task being dragged
    const task = active.data.current?.task as Task;
    
    if (!task) return;
    
    handleDragEnd(activeId.toString(), overId.toString(), task);
  };

  const handleAddTask = () => {
    setNewTaskStatus("todo"); // Default to first column
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTaskStart = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTaskConfirm = async () => {
    if (taskToDelete && await handleDeleteTask(taskToDelete)) {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  return (
    <>
      <KanbanBoardHeader onAddTask={handleAddTask} />

      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEndEvent}
      >
        <div className="flex gap-6 h-full overflow-x-auto pb-4">
          {columns.map((column) => (
            <motion.div 
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full min-w-[320px] max-w-[400px]"
            >
              <TaskColumn
                column={column}
                onAddTask={() => {}}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTaskStart}
              />
            </motion.div>
          ))}
        </div>
      </DndContext>

      <TaskDialogManager
        columns={columns}
        setColumns={setColumns}
        taskDialogOpen={taskDialogOpen}
        setTaskDialogOpen={setTaskDialogOpen}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        newTaskStatus={newTaskStatus}
      />

      <DeleteTaskDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteConfirm={handleDeleteTaskConfirm}
      />
    </>
  );
}
