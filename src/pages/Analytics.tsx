
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Loader } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
  overdueTasks: number;
  averageCompletionTime: number | null;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
  tasksByDay: {
    date: string;
    count: number;
  }[];
}

const Analytics = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all tasks for the current user
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id);
          
        if (error) throw error;
        
        if (!tasks || tasks.length === 0) {
          setStats({
            total: 0,
            completed: 0,
            inProgress: 0,
            todo: 0,
            completionRate: 0,
            overdueTasks: 0,
            averageCompletionTime: null,
            tasksByPriority: { high: 0, medium: 0, low: 0, none: 0 },
            tasksByDay: []
          });
          setIsLoading(false);
          return;
        }

        // Calculate basic stats
        const completed = tasks.filter(t => t.status === "completed").length;
        const inProgress = tasks.filter(t => t.status === "progress").length;
        const todo = tasks.filter(t => t.status === "todo").length;
        
        // Calculate tasks by priority
        const tasksByPriority = {
          high: tasks.filter(t => t.priority === "high").length,
          medium: tasks.filter(t => t.priority === "medium").length,
          low: tasks.filter(t => t.priority === "low").length,
          none: tasks.filter(t => !t.priority).length
        };
        
        // Calculate overdue tasks
        const now = new Date();
        const overdueTasks = tasks.filter(t => {
          if (!t.due_date || t.status === "completed") return false;
          return new Date(t.due_date) < now;
        }).length;
        
        // Calculate average completion time for completed tasks
        let averageCompletionTime = null;
        const completedTasks = tasks.filter(t => t.status === "completed");
        if (completedTasks.length > 0) {
          const totalTime = completedTasks.reduce((sum, task) => {
            const created = new Date(task.created_at);
            const updated = new Date(task.updated_at);
            return sum + (updated.getTime() - created.getTime());
          }, 0);
          
          // Average time in days
          averageCompletionTime = totalTime / completedTasks.length / (1000 * 60 * 60 * 24);
        }
        
        // Tasks created by day (last 14 days)
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), i);
          return format(date, "yyyy-MM-dd");
        }).reverse();
        
        const tasksByDay = last14Days.map(day => {
          const count = tasks.filter(task => {
            const taskDate = format(parseISO(task.created_at), "yyyy-MM-dd");
            return taskDate === day;
          }).length;
          
          return {
            date: format(parseISO(day), "MMM dd"),
            count
          };
        });
        
        setStats({
          total: tasks.length,
          completed,
          inProgress,
          todo,
          completionRate: tasks.length > 0 ? (completed / tasks.length) * 100 : 0,
          overdueTasks,
          averageCompletionTime,
          tasksByPriority,
          tasksByDay
        });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching analytics",
          description: error.message || "Could not load task statistics"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskStats();
  }, [user, toast]);

  const pieChartData = stats ? [
    { name: "Todo", value: stats.todo, color: "hsl(var(--todo-foreground))" },
    { name: "In Progress", value: stats.inProgress, color: "hsl(var(--progress-foreground))" },
    { name: "Completed", value: stats.completed, color: "hsl(var(--completed-foreground))" }
  ] : [];
  
  const priorityChartData = stats ? [
    { name: "High", value: stats.tasksByPriority.high, color: "hsl(var(--destructive))" },
    { name: "Medium", value: stats.tasksByPriority.medium, color: "hsl(var(--warning))" },
    { name: "Low", value: stats.tasksByPriority.low, color: "hsl(var(--success))" },
    { name: "None", value: stats.tasksByPriority.none, color: "hsl(var(--muted))" }
  ] : [];

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Task Analytics</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Task Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Tasks</span>
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{Math.round(stats.completionRate)}%</span>
                      <Progress value={stats.completionRate} className="h-2 w-20" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overdue Tasks</span>
                    <Badge variant={stats.overdueTasks > 0 ? "destructive" : "outline"} className="text-xs">
                      {stats.overdueTasks}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg. Completion Time</span>
                    <span className="text-sm font-medium">
                      {stats.averageCompletionTime ? `${stats.averageCompletionTime.toFixed(1)} days` : 'N/A'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-todo/10 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Todo</div>
                        <div className="text-lg font-bold text-todo-foreground">{stats.todo}</div>
                      </div>
                      <div className="bg-progress/10 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">In Progress</div>
                        <div className="text-lg font-bold text-progress-foreground">{stats.inProgress}</div>
                      </div>
                      <div className="bg-completed/10 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Completed</div>
                        <div className="text-lg font-bold text-completed-foreground">{stats.completed}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                {stats.total > 0 ? (
                  <PieChart
                    data={pieChartData}
                    index="name"
                    valueFormatter={(value) => `${value} tasks`}
                    category="value"
                    colors={["hsl(var(--todo-foreground))", "hsl(var(--progress-foreground))", "hsl(var(--completed-foreground))"]}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Task Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Task Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                {stats.total > 0 ? (
                  <BarChart
                    data={priorityChartData}
                    index="name"
                    categories={["value"]}
                    valueFormatter={(value) => `${value} tasks`}
                    colors={["hsl(var(--primary))"]}
                    className="h-[250px]"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Tasks Created Over Time */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Tasks Created (Last 14 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {stats.tasksByDay.some(day => day.count > 0) ? (
                  <LineChart
                    data={stats.tasksByDay}
                    index="date"
                    categories={["count"]}
                    valueFormatter={(value) => `${value} tasks`}
                    colors={["hsl(var(--primary))"]}
                    className="h-[300px]"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No tasks created in the last 14 days
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Could not load analytics data</p>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default Analytics;
