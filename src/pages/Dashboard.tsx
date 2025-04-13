
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Column } from "@/types";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group tasks by status
        const newColumns = columns.map(column => {
          return {
            ...column,
            tasks: data?.filter(task => task.status === column.id) || [],
          };
        });

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">TaskMate</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut} className="flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Task Board</h2>
          <p className="text-muted-foreground">Drag and drop tasks to change their status</p>
        </div>

        {isLoading ? (
          <div className="h-[calc(100vh-200px)] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="h-[calc(100vh-200px)]">
            <KanbanBoard initialColumns={columns} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
