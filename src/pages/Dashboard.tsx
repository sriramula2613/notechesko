
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Column, Task } from "@/types";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample data for demonstration
const sampleColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "todo-foreground",
    tasks: [
      {
        id: "task-1",
        title: "Design landing page",
        description: "Create wireframes and mockups for the landing page",
        status: "todo",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "task-2",
        title: "Set up Supabase",
        description: "Configure authentication and database schemas",
        status: "todo",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: "progress",
    title: "In Progress",
    color: "progress-foreground",
    tasks: [
      {
        id: "task-3",
        title: "Implement drag and drop",
        description: "Add dnd-kit for drag and drop functionality",
        status: "progress",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  },
  {
    id: "completed",
    title: "Completed",
    color: "completed-foreground",
    tasks: [
      {
        id: "task-4",
        title: "Set up project",
        description: "Initialize React app with Vite and install dependencies",
        status: "completed",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]
  }
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, this would call Supabase auth.signOut()
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">TaskMate</h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Task Board</h2>
          <p className="text-muted-foreground">Drag and drop tasks to change their status</p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <KanbanBoard initialColumns={sampleColumns} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
