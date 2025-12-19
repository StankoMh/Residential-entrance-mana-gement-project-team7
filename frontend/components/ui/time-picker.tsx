import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "./utils";

interface TimePickerProps {
  value: string; // "HH:mm" format
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, minutes] = value ? value.split(":").map(Number) : [0, 0];

  const updateTime = (newHours: number, newMinutes: number) => {
    const h = Math.max(0, Math.min(23, newHours));
    const m = Math.max(0, Math.min(59, newMinutes));
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateTime(0, minutes);
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      updateTime(num, minutes);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateTime(hours, 0);
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      updateTime(hours, num);
    }
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      updateTime(hours + 1, minutes);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      updateTime(hours - 1, minutes);
    }
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      updateTime(hours, minutes + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      updateTime(hours, minutes - 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Hours */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => updateTime(hours + 1, minutes)}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          tabIndex={-1}
        >
          <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={String(hours).padStart(2, "0")}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-11 text-center border border-gray-300 rounded py-1 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={2}
        />
        <button
          type="button"
          onClick={() => updateTime(hours - 1, minutes)}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          tabIndex={-1}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>

      <span className="text-xl font-medium text-gray-600">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => updateTime(hours, minutes + 1)}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          tabIndex={-1}
        >
          <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={String(minutes).padStart(2, "0")}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-11 text-center border border-gray-300 rounded py-1 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={2}
        />
        <button
          type="button"
          onClick={() => updateTime(hours, minutes - 1)}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          tabIndex={-1}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}