import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  selectedDate,
  onDateChange,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate || new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={cn("p-3 bg-white", className)}>
      <div className="calendar-header flex items-center justify-between">
        <button
          className="h-7 w-7 bg-white text-primary p-0 opacity-100 hover:opacity-100"
          aria-label="Go to the Previous Month"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-xl md:text-2xl font-semibold text-center capitalize">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h2>
        <button
          className="h-7 w-7 bg-white text-primary p-0 opacity-100 hover:opacity-100"
          aria-label="Go to the Next Month"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        showOutsideDays={showOutsideDays}
        classNames={{
          day: "text-center h-9 w-9 p-0 font-normal bg-transparent hover:bg-gray-100 text-gray-700",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary-dark",
          nav: "hidden",
          caption_label: "hidden",
          ...classNames,
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
