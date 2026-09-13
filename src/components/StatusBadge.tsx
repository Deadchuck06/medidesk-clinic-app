import React from "react";
import { QueueStatus, PaymentStatus } from "../types";

interface StatusBadgeProps {
  status: QueueStatus | PaymentStatus | string;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "WAITING":
      return (
        <span
          id="status-badge-waiting"
          className="inline-flex items-center bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight"
        >
          WAITING
        </span>
      );

    case "IN_CONSULTATION":
      return (
        <span
          id="status-badge-in-consultation"
          className="inline-flex items-center bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight animate-pulse"
        >
          CONSULTING
        </span>
      );

    case "COMPLETED":
      return (
        <span
          id="status-badge-completed"
          className="inline-flex items-center bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight"
        >
          COMPLETED
        </span>
      );

    case "Paid":
      return (
        <span
          id="status-badge-paid"
          className="inline-flex items-center bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight"
        >
          PAID
        </span>
      );

    case "Pending":
      return (
        <span
          id="status-badge-pending"
          className="inline-flex items-center bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight"
        >
          PENDING
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">
          {status}
        </span>
      );
  }
};
