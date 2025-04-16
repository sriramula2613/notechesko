
import { useState } from "react";
import { Subtask } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Trash2, Check, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SubtaskItemProps {
  subtask: Subtask;
  onUpdate: (id: string, updates: Partial<Subtask>) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

export function SubtaskItem({ subtask, onUpdate, onDelete, isNew = false }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [title, setTitle] = useState(subtask.title);

  const handleSave = () => {
    if (title.trim()) {
      onUpdate(subtask.id, { title: title.trim() });
      setIsEditing(false);
    }
  };

  const handleToggleComplete = (checked: boolean) => {
    onUpdate(subtask.id, { completed: checked });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 group py-1.5"
    >
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm flex-1"
            placeholder="Subtask title"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              else if (e.key === 'Escape') {
                if (isNew) onDelete(subtask.id);
                else {
                  setTitle(subtask.title);
                  setIsEditing(false);
                }
              }
            }}
          />
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0" 
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 text-destructive" 
            onClick={() => isNew ? onDelete(subtask.id) : setIsEditing(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <Checkbox 
            id={`subtask-${subtask.id}`}
            checked={subtask.completed}
            onCheckedChange={handleToggleComplete}
          />
          <label 
            htmlFor={`subtask-${subtask.id}`}
            className={cn(
              "flex-1 text-sm cursor-pointer transition-colors truncate",
              subtask.completed && "line-through text-muted-foreground"
            )}
          >
            {subtask.title}
          </label>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(subtask.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
