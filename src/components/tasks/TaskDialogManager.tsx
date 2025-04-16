
import { useState } from "react";
import { TaskDialog } from "./TaskDialog";
import { Task, TaskStatus, Column } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubtasks } from "@/hooks/useSubtasks";

interface TaskDialogManagerProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  taskDialogOpen: boolean;
  setTaskDialogOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  newTaskStatus: TaskStatus;
}

export function TaskDialogManager({ 
  columns, 
  setColumns,
  taskDialogOpen,
  setTaskDialogOpen,
  editingTask,
  setEditingTask,
  newTaskStatus
}: TaskDialogManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleSubtasks } = useSubtasks();
  
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (!user) return Promise.reject(new Error("User not authenticated"));
    
    try {
      if (editingTask) {
        // Extract subtasks to handle separately
        const subtasks = taskData.subtasks || [];
        const taskWithoutSubtasks = { ...taskData };
        delete taskWithoutSubtasks.subtasks;
        
        // Check if status has changed
        const statusChanged = editingTask.status !== taskData.status;
        
        // Update existing task in Supabase
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status as TaskStatus,
            due_date: taskData.due_date,
            priority: taskData.priority,
            tags: taskData.tags,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTask.id);

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        // Handle subtasks - create, update or delete as needed
        await handleSubtasks(editingTask.id, subtasks);
        
        // Update task locally with the latest subtasks and handle column movement
        setColumns(prevColumns => {
          // Create a deep copy of the columns
          const updatedColumns = [...prevColumns];
          
          if (statusChanged && taskData.status) {
            // Remove task from its original column
            const sourceColumnIndex = updatedColumns.findIndex(
              (col: Column) => col.id === editingTask.status
            );
            
            if (sourceColumnIndex !== -1) {
              updatedColumns[sourceColumnIndex].tasks = updatedColumns[sourceColumnIndex].tasks.filter(
                (t: Task) => t.id !== editingTask.id
              );
            }
            
            // Add task to the destination column
            const destColumnIndex = updatedColumns.findIndex(
              (col: Column) => col.id === taskData.status
            );
            
            if (destColumnIndex !== -1) {
              const updatedTask = { 
                ...editingTask, 
                ...taskData, 
                subtasks: subtasks,
                status: taskData.status as TaskStatus,
                due_date: taskData.due_date || null,
                priority: taskData.priority || null,
                tags: taskData.tags || [],
                updated_at: new Date().toISOString() 
              };
              updatedColumns[destColumnIndex].tasks.unshift(updatedTask);
            }
            
            return updatedColumns;
          } else {
            // Just update the task in its current column
            return updatedColumns.map(column => ({
              ...column,
              tasks: column.tasks.map(task => 
                task.id === editingTask.id 
                  ? { 
                      ...task, 
                      ...taskData, 
                      subtasks: subtasks,
                      status: taskData.status as TaskStatus,
                      due_date: taskData.due_date || null,
                      priority: taskData.priority || null,
                      tags: taskData.tags || [],
                      updated_at: new Date().toISOString() 
                    } 
                  : task
              )
            }));
          }
        });

        toast({
          title: "Task updated",
          description: "Your changes have been saved",
        });
      } else {
        // Extract subtasks to handle separately
        const subtasks = taskData.subtasks || [];
        const taskWithoutSubtasks = { ...taskData };
        delete taskWithoutSubtasks.subtasks;
        
        // Create new task in Supabase
        const newTask = {
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status as TaskStatus || newTaskStatus,
          due_date: taskData.due_date || null,
          priority: taskData.priority || null,
          tags: taskData.tags || [],
          user_id: user.id
        };

        console.log("Creating new task:", newTask);
        const { data, error } = await supabase
          .from('tasks')
          .insert(newTask)
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        // Add new task to local state
        if (data && data[0]) {
          // Handle subtasks if any
          if (subtasks.length > 0) {
            await handleSubtasks(data[0].id, subtasks);
          }
          
          // Update task locally with subtasks
          setColumns(prevColumns => {
            return prevColumns.map(column => ({
              ...column,
              tasks: column.id === data[0].status 
                ? [{ ...data[0], subtasks: subtasks } as Task, ...column.tasks] 
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
    <TaskDialog
      open={taskDialogOpen}
      onOpenChange={setTaskDialogOpen}
      task={editingTask}
      initialStatus={newTaskStatus}
      onSave={handleSaveTask}
    />
  );
}
