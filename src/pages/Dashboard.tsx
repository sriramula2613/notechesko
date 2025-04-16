import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Column, Subtask } from "@/types";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", color: "todo-foreground", tasks: [] },
    { id: "progress", title: "In Progress", color: "progress-foreground", tasks: [] },
    { id: "completed", title: "Completed", color: "completed-foreground", tasks: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        
        let subtasksData: Subtask[] = [];
        if (tasksData && tasksData.length > 0) {
          const taskIds = tasksData.map(task => task.id);
          
          const { data: fetchedSubtasks, error: subtasksError } = await supabase
            .from('subtasks')
            .select('*')
            .in('task_id', taskIds)
            .order('created_at', { ascending: true });
            
          if (subtasksError) throw subtasksError;
          subtasksData = fetchedSubtasks || [];
        }
        
        const subtasksByTaskId: Record<string, Subtask[]> = {};
        subtasksData.forEach(subtask => {
          if (!subtasksByTaskId[subtask.task_id]) {
            subtasksByTaskId[subtask.task_id] = [];
          }
          subtasksByTaskId[subtask.task_id].push(subtask);
        });
        
        const newColumns = columns.map(column => {
          return {
            ...column,
            tasks: tasksData?.filter(task => task.status === column.id).map(task => ({
              ...task,
              subtasks: subtasksByTaskId[task.id] || []
            })) || [],
          };
        }) as Column[];

        setColumns(newColumns);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching tasks",
          description: error.message || "Failed to load tasks",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTasks();
    }
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary/80"
          >
            TaskMate
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Your Task Board</h2>
          <p className="text-muted-foreground">Drag and drop tasks to change their status</p>
        </motion.div>

        {isLoading ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <motion.div 
              animate={{ 
                rotate: 360,
                transition: { 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
              className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <motion.div 
            className="h-[calc(100vh-200px)]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <KanbanBoard initialColumns={columns} />
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default Dashboard;
