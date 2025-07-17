// src // compo //ProfessionalTimePicker
import React from 'react';

const pickerWrapperStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  background: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  padding: '8px 12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  width: 'fit-content',
};

const selectStyle: React.CSSProperties = {
  fontSize: '1rem',
  padding: '6px 10px',
  border: '1px solid #d0d0d0',
  borderRadius: '8px',
  background: '#f9f9f9',
  outline: 'none',
  transition: 'border 0.2s',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#333',
  marginRight: '4px',
};

const optionStyle: React.CSSProperties = {
  borderRadius: '8px',
  padding: '8px',
};

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function getNowHHMM5() {
  const now = new Date();
  let minutes = now.getMinutes();
  let roundedMinutes = Math.ceil(minutes / 5) * 5;
  let hour = now.getHours();
  if (roundedMinutes === 60) {
    hour += 1;
    roundedMinutes = 0;
  }
  return `${pad(hour)}:${pad(roundedMinutes)}`;
}

interface ProfessionalTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disablePastTimes?: boolean;
  minTime?: string; // e.g. '08:00'
  maxTime?: string; // e.g. '20:00'
  label?: string;
  id?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => pad(i));
const minutes = Array.from({ length: 12 }, (_, i) => pad(i * 5));

const ProfessionalTimePicker: React.FC<ProfessionalTimePickerProps> = ({
  value,
  onChange,
  disablePastTimes = false,
  minTime,
  maxTime,
  label,
  id
}) => {
  // Parse value
  const [selectedHour, selectedMinute] = value.split(':');

  // Calculate min/max hour/minute if needed
  let minHour = 0, maxHour = 23, minMinute = 0, maxMinute = 55;
  if (minTime) {
    const [h, m] = minTime.split(':').map(Number);
    minHour = h;
    minMinute = m;
  }
  if (maxTime) {
    const [h, m] = maxTime.split(':').map(Number);
    maxHour = h;
    maxMinute = m;
  }
  // If disablePastTimes, set minTime to now (rounded up to next 5 min)
  let effectiveMinTime = minTime;
  if (disablePastTimes) {
    effectiveMinTime = getNowHHMM5();
  }
  // Filter hours and minutes
  const filteredHours = hours.filter(h => {
    if (!effectiveMinTime && !maxTime) return true;
    if (effectiveMinTime && h < effectiveMinTime.slice(0,2)) return false;
    if (maxTime && h > maxTime.slice(0,2)) return false;
    return true;
  });
  const filteredMinutes = (hour: string) => {
    if (!effectiveMinTime && !maxTime) return minutes;
    let minM = 0, maxM = 55;
    if (effectiveMinTime && hour === effectiveMinTime.slice(0,2)) {
      minM = Number(effectiveMinTime.slice(3,5));
    }
    if (maxTime && hour === maxTime.slice(0,2)) {
      maxM = Number(maxTime.slice(3,5));
    }
    return minutes.filter(m => Number(m) >= minM && Number(m) <= maxM);
  };

  // Handlers
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    let newMinute = selectedMinute;
    // If new hour is min hour, clamp minute
    const mins = filteredMinutes(newHour);
    if (!mins.includes(newMinute)) newMinute = mins[0];
    onChange(`${newHour}:${newMinute}`);
  };
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${selectedHour}:${e.target.value}`);
  };

  return (
    <div style={pickerWrapperStyle}>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <select
        id={id ? `${id}-hour` : undefined}
        aria-label="שעה"
        value={selectedHour}
        onChange={handleHourChange}
        style={selectStyle}
      >
        {filteredHours.map(h => (
          <option key={h} value={h} style={optionStyle}>{h}</option>
        ))}
      </select>
      <span>:</span>
      <select
        id={id ? `${id}-minute` : undefined}
        aria-label="דקות"
        value={selectedMinute}
        onChange={handleMinuteChange}
        style={selectStyle}
      >
        {filteredMinutes(selectedHour).map(m => (
          <option key={m} value={m} style={optionStyle}>{m}</option>
        ))}
      </select>
    </div>
  );
};

export default ProfessionalTimePicker; 