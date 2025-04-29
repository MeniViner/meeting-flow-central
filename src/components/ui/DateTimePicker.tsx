import React from "react";
import DatePicker from "react-date-picker";
import TimePicker from "react-time-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-time-picker/dist/TimePicker.css";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, minDate }) => {
  const [date, setDate] = React.useState<Date | null>(value || null);
  const [time, setTime] = React.useState<string>(value ? value.toTimeString().slice(0,5) : "");

  React.useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      onChange(newDate);
    } else {
      onChange(undefined);
    }
    // eslint-disable-next-line
  }, [date, time]);

  return (
    <div className="flex gap-2 items-center">
      <DatePicker
        value={date}
        onChange={setDate as any}
        minDate={minDate}
        calendarIcon={null}
        clearIcon={null}
        format="dd/MM/yyyy"
        className="rounded border px-2 py-1"
      />
      <TimePicker
        value={time}
        onChange={setTime as any}
        disableClock
        clearIcon={null}
        format="HH:mm"
        className="rounded border px-2 py-1"
      />
    </div>
  );
}; 