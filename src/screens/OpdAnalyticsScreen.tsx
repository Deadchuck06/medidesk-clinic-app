import React, { useState, useEffect } from "react";
import { User } from "../types";
import { AnalyticsRepository } from "../repositories/analyticsRepository";
import { AppStorage } from "../database/storage";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  DollarSign,
  Clock,
  Activity,
  Calendar,
  PieChart,
  BarChart3,
  Download,
  Stethoscope,
  Sparkles
} from "lucide-react";

interface OpdAnalyticsScreenProps {
  currentUser: User;
  onNavigate: (tab: string, contextData?: any) => void;
}

export const OpdAnalyticsScreen: React.FC<OpdAnalyticsScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [analytics, setAnalytics] = useState(AnalyticsRepository.getAnalytics());

  const refreshData = () => {
    setAnalytics(AnalyticsRepository.getAnalytics());
  };

  useEffect(() => {
    refreshData();
    const unsub = AppStorage.subscribe(refreshData);
    return unsub;
  }, []);

  const handleExportReport = () => {
    const diagnosesList = analytics.commonDiagnoses || analytics.topDiagnoses || [];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Total Patients Today,${analytics.totalPatientsToday || 0}\n` +
      `Waiting Patients,${analytics.waitingPatients || 0}\n` +
      `In Consultation,${analytics.inConsultationPatients || 0}\n` +
      `Completed Consultations,${analytics.completedPatients || 0}\n` +
      `Today Revenue (INR),${analytics.todayRevenue || 0}\n` +
      `Total Overall Patients,${analytics.totalPatientsOverall || 0}\n` +
      `Total Revenue Overall (INR),${analytics.totalRevenueOverall || 0}\n` +
      `Average Consultation Time,${analytics.averageConsultationTimeMinutes || 12} mins\n\n` +
      "Common Diagnoses,Count\n" +
      diagnosesList.map((d) => `"${d.diagnosis}",${d.count}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MediDesk_OPD_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="opd-analytics-screen" className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              OPD Operational & Clinical Analytics
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              Real-time Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational footfall, patient turnaround time, diagnosis distributions, and daily revenue reconciliation.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Top 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Footfall Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Footfall
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{analytics.totalPatientsToday}</span>
            <span className="text-xs text-slate-500">patients registered</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Total master directory: <strong>{analytics.totalPatientsOverall}</strong>
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Completed OPD
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-950">{analytics.completedPatients}</span>
            <span className="text-xs text-emerald-700 font-medium">consultations</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700">
            {analytics.waitingPatients} waiting in lounge
          </div>
        </div>

        {/* Revenue Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Today's OPD Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-950">₹{analytics.revenueToday}</span>
            <span className="text-xs text-teal-700 font-medium">collected</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Cumulative all-time: <strong>₹{analytics.totalRevenueOverall}</strong>
          </div>
        </div>

        {/* Avg Consultation Time */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Avg Turnaround Time
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-950">
              {analytics.averageConsultationTimeMinutes}
            </span>
            <span className="text-xs text-indigo-700 font-medium">mins / patient</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Based on clinic time stamps
          </div>
        </div>
      </div>

      {/* Breakdown Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Common Diagnoses Bar Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Top Clinical Diagnoses Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">OPD Trends</span>
          </div>

          <div className="space-y-3 pt-2">
            {(!analytics.commonDiagnoses || analytics.commonDiagnoses.length === 0) ? (
              <p className="text-xs text-slate-400">No diagnoses recorded yet.</p>
            ) : (
              analytics.commonDiagnoses.map((item, idx) => {
                const total = analytics.commonDiagnoses.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const percent = Math.round((item.count / total) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.diagnosis}</span>
                      <span className="font-mono text-slate-500">
                        {item.count} cases ({percent}%)
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Hourly OPD Footfall Distribution (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Hourly OPD Load
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Today</span>
          </div>

          <div className="space-y-3 pt-2">
            {(analytics.hourlyFootfall || []).map((hour, idx) => {
              const maxCount = Math.max(...(analytics.hourlyFootfall || []).map((h) => h.count), 1);
              const barWidth = Math.round((hour.count / maxCount) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{hour.hour}</span>
                    <span className="font-bold text-blue-900">{hour.count} arrivals</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${barWidth}%` }}
                    />
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
