import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config({ path: ".env.local" });

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features will run in fallback simulation mode if not provided.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Endpoint: Summarize Consultation / Notes / Voice transcript
  app.post("/api/ai/summarize-consultation", async (req, res) => {
    try {
      const { rawNotes, patientInfo, vitals } = req.body;
      if (!rawNotes || typeof rawNotes !== "string" || !rawNotes.trim()) {
        return res.status(400).json({ error: "rawNotes text is required" });
      }

      const ai = getGenAI();
      if (!ai) {
        // Safe intelligent fallback for development/demo when key is absent
        const simulated = {
          chiefComplaint: rawNotes.slice(0, 100).trim() || "Unspecified symptoms",
          relevantHistory: "Patient reports onset over recent days. No reported drug allergies in provided notes.",
          examinationFindings: vitals ? `BP: ${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg, Pulse: ${vitals.pulse} bpm, Temp: ${vitals.temperature}°F, SpO2: ${vitals.spo2}%. Chest clear, abdomen soft.` : "General physical examination reveals stable vitals as recorded.",
          diagnosisMentioned: "Clinical impression based on reported symptoms; requires doctor confirmation.",
          investigations: "Routine CBC, ESR if symptoms persist.",
          advice: "Adequate hydration, warm saline gargles/rest as appropriate, monitor temperature.",
          followUp: "Review after 3-5 days if symptoms do not improve.",
          isSimulated: true
        };
        return res.json({ draft: simulated });
      }

      const prompt = `You are a medical scribe assistant for an outpatient clinic doctor (MediDesk OPD).
Analyze the following doctor consultation transcript/rough notes and return a structured clinical draft.
PATIENT CONTEXT: ${patientInfo ? JSON.stringify(patientInfo) : "OPD Patient"}
RECORDED VITALS: ${vitals ? JSON.stringify(vitals) : "Not recorded"}
DOCTOR NOTES / TRANSCRIPT:
${rawNotes}

SAFETY RULES:
- Only summarize what is stated or strongly implied by the notes.
- Do NOT invent ungrounded diagnoses or fabricated lab tests.
- Formulate a clear, concise, structured consultation draft.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          systemInstruction: "You are an AI Clinical Scribe assistant. Produce structured outpatient consultation drafts for doctor review. All output is draft decision-support only.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chiefComplaint: { type: Type.STRING, description: "Primary reason for visit / main symptoms with duration" },
              relevantHistory: { type: Type.STRING, description: "History of present illness, past history, and allergies" },
              examinationFindings: { type: Type.STRING, description: "Physical examination findings & relevant vitals observations" },
              diagnosisMentioned: { type: Type.STRING, description: "Provisional or suspected diagnosis mentioned in the encounter" },
              investigations: { type: Type.STRING, description: "Recommended laboratory, radiology, or point-of-care tests" },
              advice: { type: Type.STRING, description: "Dietary, lifestyle, general patient care instructions" },
              followUp: { type: Type.STRING, description: "Suggested follow-up timeline and alarm signs" }
            },
            required: ["chiefComplaint", "relevantHistory", "examinationFindings", "diagnosisMentioned", "investigations", "advice", "followUp"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI model");
      }
      const draft = JSON.parse(text);
      res.json({ draft, isSimulated: false });
    } catch (err: any) {
      console.error("Error summarizing consultation:", err);
      res.status(500).json({ error: err.message || "Failed to summarize consultation" });
    }
  });

  // AI Endpoint: Analyze Medical Lab/Diagnostic Report
  app.post("/api/ai/analyze-report", async (req, res) => {
    try {
      const { reportText, reportType, imageBase64, imageMimeType } = req.body;
      if (!reportText && !imageBase64) {
        return res.status(400).json({ error: "Report text or image/document is required" });
      }

      const ai = getGenAI();
      if (!ai) {
        const simulated = {
          importantFindings: [
            "Report demonstrates routine hematological and biochemical profile.",
            "Key baseline parameters assessed within standard laboratory variance."
          ],
          abnormalValues: [
            { parameter: "WBC Count (Sample)", value: "11,500 /uL", referenceRange: "4,000 - 10,000 /uL", note: "Mild leukocytosis, correlated clinically with current complaint." }
          ],
          observations: [
            "Hydration markers and standard renal parameters within normal limits.",
            "No critical pan-laboratory panic values observed."
          ],
          conciseSummary: "Sample test reveals mild inflammatory/infectious markers consistent with upper respiratory or localized viral/bacterial episode.",
          attentionPoints: [
            "Correlate WBC elevation with patient's physical temperature and clinical exam.",
            "Re-evaluate if symptoms fail to resolve within expected therapeutic window."
          ],
          isSimulated: true
        };
        return res.json({ analysis: simulated });
      }

      const contents: any[] = [];
      if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType: imageMimeType || "image/jpeg",
            data: imageBase64
          }
        });
      }

  app.post("/api/ai/transcribe-audio", async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        error: "Audio data is required",
      });
    }

    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({
        error: "Gemini API is not configured",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          text: `Transcribe the doctor's spoken clinical notes accurately.

Return ONLY the transcript of what was spoken.

Important:
- Do not summarize.
- Do not diagnose.
- Do not add information.
- Preserve medical terms, medicine names, dosages, symptoms and measurements.
- If a word is unclear, do not invent clinical information.`,
        },
        {
          inlineData: {
            mimeType: mimeType || "audio/webm",
            data: audioBase64,
          },
        },
      ],
    });

    const transcript = response.text?.trim();

    if (!transcript) {
      throw new Error("Gemini returned an empty transcript");
    }

    return res.json({
      transcript,
      isSimulated: false,
    });
  } catch (err: any) {
    console.error("Audio transcription failed:", err);

    return res.status(500).json({
      error: err.message || "Failed to transcribe audio",
    });
  }
});
      contents.push({
        text: `You are an AI Clinical Assistant assisting an outpatient doctor in reviewing an uploaded medical report / lab test.
Report Category: ${reportType || "General Medical Report"}
Provided Text / Metadata:
${reportText || "See attached document/image"}

Analyze ONLY the information contained in the supplied report.

IMPORTANT RULES:
- Compare every numerical result with the reference range printed next to that result.
- Include EVERY value outside its supplied reference range in abnormalValues.
- Check for both HIGH and LOW values.
- Copy parameter names, observed values, units, and reference ranges exactly from the report.
- Do not omit an abnormal value even if it appears clinically minor.
- Do not invent symptoms, diagnoses, patient history, examination findings, causes, or clinical context that are not present in the report.
- If a parameter has no supplied reference range, do not independently classify it as normal or abnormal.
- Summaries and observations must remain grounded only in the supplied report.
- This output is decision-support for doctor review and is not an independent diagnosis.`
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: contents.length === 1 ? contents[0].text : { parts: contents },
        config: {
          systemInstruction: "You are an AI Medical Document Assistant. Extract structured findings, abnormal flags, and summaries from lab/diagnostic reports for licensed doctor review. Never state definitive independent diagnoses.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              importantFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key clinical findings from the report"
              },
              abnormalValues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    parameter: { type: Type.STRING, description: "Test parameter name" },
                    value: { type: Type.STRING, description: "Observed value with units" },
                    referenceRange: { type: Type.STRING, description: "Normal reference range" },
                    note: { type: Type.STRING, description: "Brief clinical interpretation (e.g. elevated, borderline low)" }
                  },
                  required: ["parameter", "value", "referenceRange", "note"]
                },
                description: "Parameters outside normal laboratory reference ranges"
              },
              observations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Relevant clinical observations and patterns"
              },
              conciseSummary: {
                type: Type.STRING,
                description: "A 2-3 sentence overview of the diagnostic report"
              },
              attentionPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specific items requiring direct doctor review or repeat testing"
              }
            },
            required: ["importantFindings", "abnormalValues", "observations", "conciseSummary", "attentionPoints"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI model");
      const analysis = JSON.parse(text);
      res.json({ analysis, isSimulated: false });
    } catch (err: any) {
      console.error("Error analyzing report:", err);
      res.status(500).json({ error: err.message || "Failed to analyze medical report" });
    }
  });

  // AI Endpoint: Explain Stored Interaction Rule
  app.post("/api/ai/explain-interaction", async (req, res) => {
    try {
      const { drugA, drugB, ruleDescription, mechanism } = req.body;
      const ai = getGenAI();
      if (!ai) {
        return res.json({
          explanation: `Combining ${drugA} with ${drugB} carries a known clinical interaction (${ruleDescription}). Mechanism: ${mechanism || "Pharmacokinetic/pharmacodynamic interaction"}. Doctor should consider dose spacing, alternative formulation, or close monitoring.`,
          isSimulated: true
        });
      }

      const prompt = `A clinic doctor is prescribing medications in MediDesk. The system's rule-based database flagged a known interaction:
Drug 1: ${drugA}
Drug 2: ${drugB}
Stored Rule Description: ${ruleDescription}
Stored Mechanism: ${mechanism || "Not specified"}

Provide a concise 2-3 sentence clinical explanation of WHY this interaction occurs and practical precautions (e.g., timing of administration, symptom monitoring, or alternative considerations). Do not fabricate extra interactions beyond these two drugs.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
      });

      res.json({
        explanation: response.text?.trim() || ruleDescription,
        isSimulated: false
      });
    } catch (err: any) {
      console.error("Error explaining interaction:", err);
      res.status(500).json({ error: err.message || "Failed to explain interaction" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MediDesk Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
