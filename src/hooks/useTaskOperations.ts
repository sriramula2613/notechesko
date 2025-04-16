
import { useState } from "react";
import { Column, Task, TaskStatus, Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useTaskOperations(columns: Column[], setColumns: React.Dispatch<React.SetStateAction<Column[]>>) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleDragEnd = async (activeId: string, overId: string | null, task: Task | null) => {
    if (!overId || !task) return;
    
    // If dropped over the same column, do nothing
    if (overId === task.status) {
      setActiveTask(null);
      return;
    }
    
    const newStatus = overId as TaskStatus;
    
    // Prevent moving to completed if there are incomplete subtasks
    if (newStatus === "completed") {
      const subtasks = task.subtasks || [];
      const allSubtasksCompleted = subtasks.length === 0 || subtasks.every(subtask => subtask.completed);
      
      if (!allSubtasksCompleted) {
        toast({
          variant: "destructive",
          title: "Cannot complete task",
          description: "All subtasks must be completed before marking the task as completed.",
        });
        setActiveTask(null);
        return;
      }
    }
    
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
    } finally {
      setActiveTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!taskId) return;

    try {
      // Delete subtasks first (though this should happen automatically with the ON DELETE CASCADE)
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      // Then delete the task
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setColumns(prevColumns => {
        return prevColumns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        }));
      });

      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting task",
        description: error.message || "Failed to delete task",
      });
      return false;
    }
  };

  return {
    activeTask,
    setActiveTask,
    handleDragEnd,
    handleDeleteTask
  };
}
