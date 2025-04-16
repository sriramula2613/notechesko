
import { Subtask } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useSubtasks = () => {
  const handleSubtasks = async (taskId: string, subtasks: Subtask[]) => {
    try {
      // Get current subtasks for this task
      const { data: existingSubtasks, error: fetchError } = await supabase
        .from('subtasks')
        .select('id')
        .eq('task_id', taskId);
        
      if (fetchError) throw fetchError;
      
      const existingIds = new Set((existingSubtasks || []).map(s => s.id));
      const newIds = new Set(subtasks.map(s => s.id).filter(id => !id.startsWith('temp-')));
      
      // Find subtasks to delete (exist in DB but not in the new list)
      const idsToDelete = [...existingIds].filter(id => !newIds.has(id));
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('subtasks')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // Handle creates and updates
      for (const subtask of subtasks) {
        if (subtask.id.startsWith('temp-')) {
          // Create new subtask
          const { error: createError } = await supabase
            .from('subtasks')
            .insert({
              title: subtask.title,
              completed: subtask.completed,
              task_id: taskId,
            });
            
          if (createError) throw createError;
        } else {
          // Update existing subtask
          const { error: updateError } = await supabase
            .from('subtasks')
            .update({
              title: subtask.title,
              completed: subtask.completed,
              updated_at: new Date().toISOString()
            })
            .eq('id', subtask.id);
            
          if (updateError) throw updateError;
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error handling subtasks:", error);
      return Promise.reject(error);
    }
  };

  return { handleSubtasks };
};
