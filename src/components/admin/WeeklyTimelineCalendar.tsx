import React, { useState, useMemo } from "react";
import { he } from "date-fns/locale";
import { format, startOfWeek, addDays, isSameDay, isToday, parseISO } from "date-fns";
// @ts-ignore
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export type MeetingSlot = {
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  label: string; // e.g. "AM 8:30"
};

interface WeeklyTimelineCalendarProps {
  meetingSlots: MeetingSlot[];
}

export const WeeklyTimelineCalendar: React.FC<WeeklyTimelineCalendarProps> = ({ meetingSlots }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]); // Sunday
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Filter slots for the week
  const slotsByDate: Record<string, MeetingSlot[]> = useMemo(() => {
    const map: Record<string, MeetingSlot[]> = {};
    weekDates.forEach(date => {
      const key = format(date, "yyyy-MM-dd");
      map[key] = meetingSlots.filter(slot => slot.date === key);
    });
    return map;
  }, [meetingSlots, weekDates]);

  // Handle slot selection (optional)
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);

  return (
    <div className="flex flex-row-reverse gap-8 w-full" dir="rtl">
      {/* Calendar on the right */}
      <div className="min-w-[320px]">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={date => date && setSelectedDate(date)}
          locale={he}
          weekStartsOn={0}
          showOutsideDays
          className="rtl"
          modifiersClassNames={{
            selected: "bg-blue-500 text-white",
            today: "border border-blue-500"
          }}
          styles={{
            caption: { direction: "rtl" },
            head_row: { direction: "rtl" },
            row: { direction: "rtl" },
          }}
        />
      </div>
      {/* Weekly timeline on the left */}
      <div className="flex-1 overflow-x-auto">
        <div className="rounded-lg border p-4 flex flex-col gap-4 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold">בחרת שעה לפגישה</span>
            <span className="text-sm text-muted-foreground">שעון ישראל (GMT+03:00)</span>
          </div>
          <div className="flex flex-row-reverse gap-8 w-full justify-between">
            {weekDates.map((date, idx) => {
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
                    {slotsByDate[key] && slotsByDate[key].length > 0 ? (
                      slotsByDate[key].map(slot => (
                        <button
                          key={slot.time}
                          className={`rounded-full border px-4 py-1 text-sm font-medium transition-colors ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.label}
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground">—</div>
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