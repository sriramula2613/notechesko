
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface KanbanBoardHeaderProps {
  onAddTask: () => void;
}

export function KanbanBoardHeader({ onAddTask }: KanbanBoardHeaderProps) {
  return (
    <div className="mb-6 flex justify-end">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          onClick={onAddTask} 
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md"
        >
          <Plus className="h-5 w-5 mr-1" /> Add Task
        </Button>
      </motion.div>
    </div>
  );
}
