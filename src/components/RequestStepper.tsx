import React from "react";
import { RequestStatus } from "@/types";

const steps: { key: RequestStatus | "rejected"; label: string }[] = [
  { key: "pending", label: "ממתין לאישור" },
  { key: "scheduled", label: "מתוזמן" },
  { key: "ended", label: "הסתיים - ממתין לסיכום" },
  { key: "completed", label: "הושלם" },
  { key: "rejected", label: "נדחה" },
];

interface RequestStepperProps {
  status: RequestStatus;
}

export const RequestStepper: React.FC<RequestStepperProps> = ({ status }) => {
  // If rejected, only show the rejected step
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 mb-6">
        <div className="rounded-full bg-red-200 text-red-700 px-4 py-2 font-bold">נדחה</div>
      </div>
    );
  }

  const activeIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-4 mb-6">
      {steps.slice(0, 4).map((step, idx) => (
        <React.Fragment key={step.key}>
          <div className={`flex flex-col items-center ${idx <= activeIndex ? "text-blue-600" : "text-gray-400"}`}>
            <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold border-2 ${idx <= activeIndex ? "bg-blue-100 border-blue-600" : "bg-gray-100 border-gray-300"}`}>
              {idx + 1}
            </div>
            <span className="text-xs mt-1 whitespace-nowrap">{step.label}</span>
          </div>
          {idx < 3 && (
            <div className={`flex-1 h-1 ${idx < activeIndex ? "bg-blue-600" : "bg-gray-300"}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 