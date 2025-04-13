
import { useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { TaskColumn } from "./tasks/TaskColumn";
import { TaskDialog } from "./tasks/TaskDialog";
import { Column, Task, TaskStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { user } = useAuth();

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

  const handleDragEnd = async (event: DragEndEvent) => {
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
      
      try {
        // Update task in Supabase
        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id);

        if (error) throw error;
        
        // Update the columns data locally
        setColumns(prevColumns => {
          // Create a deep copy of the columns
          const updatedColumns = JSON.parse(JSON.stringify(prevColumns)) as Column[];
          
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
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error updating task",
          description: error.message || "Failed to update task status",
        });
      }
    }
    
    setActiveTask(null);
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
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete);

      if (error) throw error;

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
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message || "Failed to delete task",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!user) return Promise.reject(new Error("User not authenticated"));
    
    try {
      if (editingTask) {
        // Update existing task in Supabase
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status as TaskStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTask.id);

        if (error) throw error;
        
        // Update task locally
        setColumns(prevColumns => {
          return prevColumns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => 
              task.id === editingTask.id 
                ? { 
                    ...task, 
                    ...taskData, 
                    status: taskData.status as TaskStatus,
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
        // Create new task in Supabase
        const newTask = {
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status as TaskStatus || newTaskStatus,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('tasks')
          .insert(newTask)
          .select();

        if (error) throw error;

        // Add new task to local state
        if (data && data[0]) {
          setColumns(prevColumns => {
            return prevColumns.map(column => ({
              ...column,
              tasks: column.id === data[0].status 
                ? [data[0] as Task, ...column.tasks] 
                : column.tasks
            }));
          });
        }

        toast({
          title: "Task created",
          description: "Your new task has been added",
        });
      }
      
      return Promise.resolve();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving task",
        description: error.message || "Failed to save task",
      });
      return Promise.reject(error);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={handleAddTask} 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
          >
            <Plus className="h-5 w-5 mr-1" /> Add Task
          </Button>
        </motion.div>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
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

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        initialStatus={newTaskStatus}
        onSave={handleSaveTask}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
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
