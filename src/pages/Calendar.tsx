
import { useEffect, useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCardWrapper } from "@/components/tasks/TaskCardWrapper";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { TaskCalendar } from "@/components/calendar/TaskCalendar";

const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tasks for the current month
  useEffect(() => {
    const fetchTasksForMonth = async () => {
      if (!user) return;
      setIsLoading(true);

      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .gte('due_date', startDate.toISOString())
          .lte('due_date', endDate.toISOString());

        if (error) throw error;
        
        // Also fetch tasks with no due date
        const { data: tasksWithNoDueDate, error: noDueDateError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .is('due_date', null);
          
        if (noDueDateError) throw noDueDateError;
        
        const allTasks = [...(data || []), ...(tasksWithNoDueDate || [])];
        
        // Fetch subtasks for all tasks
        if (allTasks.length > 0) {
          const taskIds = allTasks.map(task => task.id);
          
          const { data: subtasks, error: subtasksError } = await supabase
            .from('subtasks')
            .select('*')
            .in('task_id', taskIds);
            
          if (subtasksError) throw subtasksError;
          
          // Attach subtasks to their respective tasks and ensure proper typing
          const tasksWithSubtasks = allTasks.map(task => ({
            ...task,
            status: task.status as TaskStatus, // Ensure status is properly typed
            subtasks: subtasks?.filter(subtask => subtask.task_id === task.id) || []
          })) as Task[];
          
          setTasks(tasksWithSubtasks);
          updateTasksForSelectedDate(date, tasksWithSubtasks);
        } else {
          setTasks([]);
          setTasksForSelectedDate([]);
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Failed to fetch tasks",
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasksForMonth();
  }, [user, date, toast]);

  // Update tasks for selected date when date or tasks change
  const updateTasksForSelectedDate = (selectedDate: Date, allTasks: Task[]) => {
    const filtered = allTasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(parseISO(task.due_date), selectedDate);
    });
    setTasksForSelectedDate(filtered);
  };

  // Handle date selection
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      updateTasksForSelectedDate(selectedDate, tasks);
    }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">Calendar View</h1>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid md:grid-cols-[1fr_350px] gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Task Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <TaskCalendar 
                  date={date}
                  onDateSelect={handleSelect}
                  tasks={tasks}
                />
              )}
            </CardContent>
          </Card>

          {/* Tasks for selected day */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks for {format(date, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasksForSelectedDate.length > 0 ? (
                  tasksForSelectedDate.map((task) => (
                    <div key={task.id} className="max-w-full">
                      <TaskCardWrapper task={task} showActions={false} />
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks scheduled for this day
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </motion.div>
  );
};

export default CalendarPage;
