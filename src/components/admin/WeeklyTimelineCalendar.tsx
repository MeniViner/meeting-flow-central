import React, { useState, useMemo } from "react";
import { he } from "date-fns/locale";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Clock } from "lucide-react";

export type MeetingSlot = {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  label: string; // e.g. "AM 8:30"
  id?: string; // optional unique ID
};

interface WeeklyTimelineCalendarProps {
  meetingSlots: MeetingSlot[];
  onSlotClick?: (slot: MeetingSlot) => void;
}

export const WeeklyTimelineCalendar: React.FC<WeeklyTimelineCalendarProps> = ({ meetingSlots, onSlotClick }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const slotsByDate: Record<string, MeetingSlot[]> = useMemo(() => {
    const map: Record<string, MeetingSlot[]> = {};
    weekDates.forEach(date => {
      const key = format(date, "yyyy-MM-dd");
      map[key] = meetingSlots
        .filter(slot => slot.date === key)
        .sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [meetingSlots, weekDates]);

  return (
    <div className="flex flex-row gap-8 w-full" dir="rtl">
      {/* Calendar */}
      <div className="min-w-[320px]">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={date => date && setSelectedDate(date)}
          locale={he}
          weekStartsOn={0}
          showOutsideDays
          modifiersClassNames={{
            selected: "bg-blue-500 text-white",
            today: "border border-blue-500"
          }}
        />
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-x-auto max-w-[800px]">
        <div className="rounded-lg border p-4 flex flex-col gap-4 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">פגישות מתוזמנות להשבוע</span>
            <span className="text-sm text-muted-foreground">שעון ישראל (GMT+03:00)</span>
          </div>

          <div className="flex flex-row gap-4 w-full justify-between">
            {weekDates.map((date) => {
              const key = format(date, "yyyy-MM-dd");
              const isSelected = isSameDay(date, selectedDate);
              return (
                <div key={key} className="flex flex-col items-center min-w-[100px]">
                  <div
                    className={`rounded-full w-10 h-10 flex items-center justify-center mb-2 text-lg font-bold ${isSelected ? "bg-blue-600 text-white" : isToday(date) ? "border border-blue-500 text-blue-600" : "bg-gray-100 text-gray-800"}`}
                  >
                    {format(date, "d")}
                  </div>
                  <div className="text-xs mb-2 font-medium">
                    {format(date, "EEE", { locale: he })}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {slotsByDate[key]?.length ? (
                      slotsByDate[key].map(slot => (
                        <button
                          key={`${slot.date}-${slot.time}`}
                          role="button"
                          aria-label={`Meeting at ${slot.time}`}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
                          onClick={() => {
                            setSelectedSlot(slot);
                            if (onSlotClick) onSlotClick(slot);
                          }}
                        >
                          <Clock className="w-4 h-4" /> {slot.label}
                        </button>
                      ))
                    ) : (
                      // <p className="text-sm text-gray-400 italic text-center mt-3">אין פגישות ליום זה</p>
                      <div className="text-center font-bold text-muted-foreground mr-10 mt-4 ">—</div>

                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
