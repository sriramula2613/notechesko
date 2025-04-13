
import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { TaskColumn } from "./tasks/TaskColumn";
import { TaskDialog } from "./tasks/TaskDialog";
import { Column, Task, TaskStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface KanbanBoardProps {
  initialColumns: Column[];
}

export function KanbanBoard({ initialColumns }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const { toast } = useToast();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // Find the task being dragged
    const task = active.data.current?.task as Task;
    
    if (!task) return;
    
    // If dropped over a different column than its current status
    if (overId !== task.status) {
      const newStatus = overId as TaskStatus;
      
      // Update the columns data
      setColumns(prevColumns => {
        // Create a deep copy of the columns
        const updatedColumns = JSON.parse(JSON.stringify(prevColumns));
        
        // Remove task from its original column
        const sourceColumnIndex = updatedColumns.findIndex(
          (col: Column) => col.id === task.status
        );
        
        if (sourceColumnIndex !== -1) {
          updatedColumns[sourceColumnIndex].tasks = updatedColumns[sourceColumnIndex].tasks.filter(
            (t: Task) => t.id !== task.id
          );
        }
        
        // Add task to the destination column with updated status
        const destColumnIndex = updatedColumns.findIndex(
          (col: Column) => col.id === newStatus
        );
        
        if (destColumnIndex !== -1) {
          const updatedTask = { ...task, status: newStatus, updated_at: new Date().toISOString() };
          updatedColumns[destColumnIndex].tasks.unshift(updatedTask);
        }
        
        return updatedColumns;
      });

      toast({
        title: "Task moved",
        description: `"${task.title}" moved to ${columns.find(col => col.id === newStatus)?.title}`,
      });

      // In a real app with Supabase, you would update the task status in the database here
    }
    
    setActiveTask(null);
  };

  const handleAddTask = (status: string) => {
    setNewTaskStatus(status as TaskStatus);
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

  const handleDeleteTaskConfirm = () => {
    if (!taskToDelete) return;

    setColumns(prevColumns => {
      return prevColumns.map(column => ({
        ...column,
        tasks: column.tasks.filter(task => task.id !== taskToDelete)
      }));
    });

    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully",
    });

    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      setColumns(prevColumns => {
        return prevColumns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => 
            task.id === editingTask.id 
              ? { 
                  ...task, 
                  ...taskData, 
                  updated_at: new Date().toISOString() 
                } 
              : task
          )
        }));
      });

      toast({
        title: "Task updated",
        description: "Your changes have been saved",
      });
    } else {
      // Create new task with generated ID
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || "",
        description: taskData.description || "",
        status: taskData.status as TaskStatus || newTaskStatus,
        user_id: "current-user", // This would be replaced with actual user ID in Supabase implementation
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setColumns(prevColumns => {
        return prevColumns.map(column => ({
          ...column,
          tasks: column.id === newTask.status 
            ? [newTask, ...column.tasks] 
            : column.tasks
        }));
      });

      toast({
        title: "Task created",
        description: "Your new task has been added",
      });
    }

    // In a real app, we would save to Supabase here
    return Promise.resolve();
  };

  return (
    <>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full overflow-x-auto pb-4">
          {columns.map((column) => (
            <TaskColumn
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTaskStart}
            />
          ))}
        </div>
      </DndContext>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        initialStatus={newTaskStatus}
        onSave={handleSaveTask}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTaskConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
