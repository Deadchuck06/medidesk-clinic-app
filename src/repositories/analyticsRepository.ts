import { OPDAnalytics } from "../types";
import { AppStorage } from "../database/storage";
import { VisitRepository } from "./visitRepository";

export class AnalyticsRepository {
  public static getAnalytics(): OPDAnalytics {
    const today = VisitRepository.getTodayDateString();
    const allVisits = AppStorage.getVisits();
    const allPatients = AppStorage.getPatients();
    const todayVisits = allVisits.filter((v) => v.visitDate === today);

    let waitingPatients = 0;
    let inConsultationPatients = 0;
    let completedPatients = 0;

    todayVisits.forEach((v) => {
      if (v.status === "WAITING") waitingPatients++;
      else if (v.status === "IN_CONSULTATION") inConsultationPatients++;
      else if (v.status === "COMPLETED") completedPatients++;
    });

    let todayRevenue = 0;
    let totalRevenueOverall = 0;
    let pendingBillingAmount = 0;
    let paidBillingCount = 0;
    let pendingBillingCount = 0;

    const modeMap: Record<string, { amount: number; count: number }> = {
      Cash: { amount: 0, count: 0 },
      UPI: { amount: 0, count: 0 },
      Card: { amount: 0, count: 0 },
      Other: { amount: 0, count: 0 },
    };

    allVisits.forEach((v) => {
      if (v.billing && v.billing.paymentStatus === "Paid") {
        totalRevenueOverall += v.billing.total;
      }
    });

    todayVisits.forEach((v) => {
      if (v.billing) {
        if (v.billing.paymentStatus === "Paid") {
          todayRevenue += v.billing.total;
          paidBillingCount++;
          const mode = v.billing.paymentMode || "Cash";
          if (!modeMap[mode]) modeMap[mode] = { amount: 0, count: 0 };
          modeMap[mode].amount += v.billing.total;
          modeMap[mode].count += 1;
        } else {
          pendingBillingAmount += v.billing.total;
          pendingBillingCount++;
        }
      }
    });

    // Diagnoses frequency across all recorded visits
    const diagnosisCounts: Record<string, number> = {};
    allVisits.forEach((v) => {
      const diag = v.consultation?.diagnosis || v.prescription?.diagnosis;
      if (diag && diag.trim()) {
        const cleanDiag = diag.split(/[,;\n]/)[0].trim();
        diagnosisCounts[cleanDiag] = (diagnosisCounts[cleanDiag] || 0) + 1;
      }
    });

    const topDiagnoses = Object.entries(diagnosisCounts)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly flow calculation for today's visits
    const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    const hourlyPatientFlow = hours.map((hour) => {
      const hInt = parseInt(hour.split(":")[0], 10);
      const count = todayVisits.filter((v) => {
        try {
          const vDate = new Date(v.createdAt);
          return vDate.getHours() === hInt;
        } catch {
          return false;
        }
      }).length;
      return { hour, count };
    });

    const paymentModeBreakdown = Object.entries(modeMap).map(([mode, data]) => ({
      mode,
      amount: data.amount,
      count: data.count,
    }));

    return {
      totalPatientsToday: todayVisits.length,
      waitingPatients,
      inConsultationPatients,
      completedPatients,
      totalVisitsAllTime: allVisits.length,
      totalPatientsOverall: allPatients.length,
      todayRevenue,
      totalRevenueToday: todayRevenue,
      revenueToday: todayRevenue,
      totalRevenueOverall,
      pendingBillingAmount,
      paidBillingCount,
      pendingBillingCount,
      pendingBillsCount: pendingBillingCount,
      averageConsultationTimeMinutes: 12,
      topDiagnoses,
      commonDiagnoses: topDiagnoses,
      hourlyPatientFlow,
      hourlyFootfall: hourlyPatientFlow,
      paymentModeBreakdown,
    };
  }
}
