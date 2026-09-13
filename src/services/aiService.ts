import { AIDraftConsultation, ReportAnalysis, Vitals, Patient } from "../types";

export class AIService {
  public static async summarizeConsultation(
    rawNotes: string,
    patientInfo?: Partial<Patient>,
    vitals?: Vitals
  ): Promise<{ draft: AIDraftConsultation; isSimulated: boolean }> {
    const res = await fetch("/api/ai/summarize-consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawNotes, patientInfo, vitals }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      draft: data.draft,
      isSimulated: data.isSimulated ?? false,
    };
  }

  public static async analyzeReport(
    reportText?: string,
    reportType?: string,
    imageBase64?: string,
    imageMimeType?: string
  ): Promise<{ analysis: Omit<ReportAnalysis, "id" | "visitId" | "patientId" | "reportTitle" | "reportType" | "inputContent" | "doctorApproved" | "createdAt">; isSimulated: boolean }> {
    const res = await fetch("/api/ai/analyze-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportText, reportType, imageBase64, imageMimeType }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      analysis: data.analysis,
      isSimulated: data.isSimulated ?? false,
    };
  }

  public static async explainInteraction(
    drugA: string,
    drugB: string,
    ruleDescription: string,
    mechanism?: string
  ): Promise<{ explanation: string; isSimulated: boolean }> {
    const res = await fetch("/api/ai/explain-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drugA, drugB, ruleDescription, mechanism }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      explanation: data.explanation,
      isSimulated: data.isSimulated ?? false,
    };
  }
}
