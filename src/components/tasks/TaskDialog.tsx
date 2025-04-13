
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatus } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  initialStatus?: TaskStatus;
  onSave: (task: Partial<Task>) => Promise<void>;
}

export function TaskDialog({ open, onOpenChange, task, initialStatus = "todo", onSave }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    } else if (open) {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
    }
  }, [open, task, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        ...(task && { id: task.id }),
        title: title.trim(),
        description: description.trim(),
        status,
      };

      await onSave(taskData);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to save task",
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl">
                  {task ? "Edit Task" : "Create New Task"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="border-gray-200 dark:border-gray-700 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task details"
                    className="border-gray-200 dark:border-gray-700 focus:ring-primary resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                    <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:ring-primary">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-todo-foreground"></span>
                        <span>To Do</span>
                      </SelectItem>
                      <SelectItem value="progress" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-progress-foreground"></span>
                        <span>In Progress</span>
                      </SelectItem>
                      <SelectItem value="completed" className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-completed-foreground"></span>
                        <span>Completed</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter className="pt-2">
                  <Button
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                  >
                    {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
