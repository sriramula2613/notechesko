
import React from 'react';
import { Calendar as CalendarPrimitive } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Task } from "@/types";

interface TaskCalendarProps {
  date: Date;
  onDateSelect: (date: Date | undefined) => void;
  tasks: Task[];
}

export function TaskCalendar({ date, onDateSelect, tasks }: TaskCalendarProps) {
  // Custom day content to show tasks count
  const renderDay = (day: Date) => {
    const tasksOnDay = tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });

    const count = tasksOnDay.length;
    
    if (count > 0) {
      return (
        <div className="relative">
          <div>{format(day, "d")}</div>
          <Badge 
            className="absolute -bottom-1 -right-1 h-4 min-w-4 flex items-center justify-center text-[10px] bg-primary"
          >
            {count}
          </Badge>
        </div>
      );
    }
    
    return format(day, "d");
  };

  return (
    <CalendarPrimitive
      mode="single"
      selected={date}
      onSelect={onDateSelect}
      className="rounded-md border w-full max-w-full pointer-events-auto"
      components={{
        Day: ({ date: dayDate, ...props }) => (
          <CalendarPrimitive.Day {...props} date={dayDate}>
            {renderDay(dayDate)}
          </CalendarPrimitive.Day>
        )
      }}
      showOutsideDays={true}
    />
  );
}
