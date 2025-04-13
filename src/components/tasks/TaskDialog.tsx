
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, TaskStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<"high" | "medium" | "low" | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setPriority(task.priority || undefined);
      setTags(task.tags || []);
    } else if (open) {
      setTitle("");
      setDescription("");
      setStatus(initialStatus);
      setDueDate(undefined);
      setPriority(undefined);
      setTags([]);
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
        due_date: dueDate ? dueDate.toISOString() : null,
        priority: priority || null,
        tags: tags.length > 0 ? tags : null,
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

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

                <div className="space-y-2">
                  <Label htmlFor="due_date" className="text-sm font-medium">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="due_date"
                        className={cn(
                          "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Set due date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-2 flex justify-between items-center border-b">
                        <span className="text-sm font-medium">Select date</span>
                        {dueDate && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-muted-foreground"
                            onClick={() => setDueDate(undefined)}
                          >
                            <X className="h-4 w-4 mr-1" /> Clear
                          </Button>
                        )}
                      </div>
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                  <Select 
                    value={priority || "none"} 
                    onValueChange={(value) => setPriority(value === "none" ? undefined : value as "high" | "medium" | "low")}
                  >
                    <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:ring-primary">
                      <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-muted-foreground">None</SelectItem>
                      <SelectItem value="high" className="text-red-600 font-medium">High</SelectItem>
                      <SelectItem value="medium" className="text-amber-600 font-medium">Medium</SelectItem>
                      <SelectItem value="low" className="text-green-600 font-medium">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="border-gray-200 dark:border-gray-700 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleRemoveTag(tag)} 
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
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
