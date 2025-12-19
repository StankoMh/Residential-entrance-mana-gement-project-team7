import * as React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { TimePicker } from "./time-picker";
import { cn } from "./utils";

interface DateTimePickerProps {
  value: string; // datetime-local format: "2025-12-19T14:30"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Изберете дата и час",
  className,
  error = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse value into date and time
  const parseValue = (val: string) => {
    if (!val) return { date: undefined, time: "" };
    const [datePart, timePart] = val.split("T");
    return {
      date: datePart ? new Date(datePart) : undefined,
      time: timePart || "",
    };
  };

  const { date, time } = parseValue(value);

  // Format date for display
  const formatDisplay = () => {
    if (!date) return placeholder;
    
    const dateStr = date.toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    
    const timeStr = time || "00:00";
    return `${dateStr} в ${timeStr}`;
  };

  // Handle date selection
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange("");
      return;
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    
    const timeStr = time || "00:00";
    onChange(`${dateStr}T${timeStr}`);
  };

  // Handle time change
  const handleTimeChange = (newTime: string) => {
    if (!date) {
      // If no date selected, use today
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}T${newTime}`);
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}T${newTime}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-left flex items-center justify-between gap-2",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500 hover:border-gray-400",
            !value && "text-gray-400",
            className
          )}
        >
          <span className="flex-1 truncate">{formatDisplay()}</span>
          <CalendarIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start" side="bottom">
        <div className="flex gap-0">
          {/* Calendar */}
          <div className="border-r">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </div>
          
          {/* Time picker and actions */}
          <div className="flex flex-col justify-between p-3 w-[180px]">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-600" />
                <label className="text-sm text-gray-700">Час:</label>
              </div>
              <TimePicker
                value={time || "00:00"}
                onChange={handleTimeChange}
                className="mb-4"
              />
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Готово
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Изчисти
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}