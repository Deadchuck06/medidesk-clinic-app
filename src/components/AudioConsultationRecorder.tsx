import React, { useRef, useState } from "react";
import {
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { AIService } from "../services/aiService";

interface AudioConsultationRecorderProps {
  onTranscriptReady: (transcript: string) => void;
  onRequestSummarize?: (transcript: string) => void;
}

export const AudioConsultationRecorder: React.FC<
  AudioConsultationRecorderProps
> = ({ onTranscriptReady, onRequestSummarize }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;

    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];

        if (!base64) {
          reject(new Error("Could not convert audio recording."));
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error("Could not read audio recording."));
      };

      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Audio recording is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event: any) => {
        console.error("MediaRecorder error:", event);

        setError(
          "There was a problem recording audio. Please try again."
        );
      };

      recorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        streamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;

        const actualMimeType =
          recorder.mimeType || mimeType || "audio/webm";

        const audioBlob = new Blob(audioChunksRef.current, {
          type: actualMimeType,
        });

        if (audioBlob.size === 0) {
          setError(
            "No audio was captured. Please try recording again."
          );
          return;
        }

        setIsTranscribing(true);
        setError(null);

        try {
          const audioBase64 = await blobToBase64(audioBlob);

          const result = await AIService.transcribeAudio(
            audioBase64,
            actualMimeType
          );

          const newTranscript = result.transcript.trim();

          if (!newTranscript) {
            throw new Error(
              "No speech could be transcribed from the recording."
            );
          }

          const combinedTranscript = transcript.trim()
            ? `${transcript.trim()} ${newTranscript}`
            : newTranscript;

          setTranscript(combinedTranscript);

          // Send transcript to ConsultationScreen
          onTranscriptReady(combinedTranscript);
        } catch (err: any) {
          console.error("Audio transcription failed:", err);

          setError(
            err.message ||
              "Gemini could not transcribe the recording. Please try again."
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();

      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((previous) => previous + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access failed:", err);

      if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError"
      ) {
        setError(
          "Microphone permission was denied. Please allow microphone access and try again."
        );
      } else {
        setError(
          "Could not access the microphone. Please check your microphone and try again."
        );
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const toggleRecording = () => {
    if (isTranscribing) {
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleReset = () => {
    if (isRecording) {
      stopRecording();
    }

    setTranscript("");
    setRecordingSeconds(0);
    setError(null);

    onTranscriptReady("");
  };

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isTranscribing}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all shadow-xs ${
              isRecording
                ? "bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse"
                : isTranscribing
                ? "bg-slate-400 text-white cursor-wait"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            title={
              isRecording
                ? "Stop Recording"
                : isTranscribing
                ? "Transcribing Audio"
                : "Start Voice Dictation"
            }
          >
            {isTranscribing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-950">
                {isRecording
                  ? "Recording Doctor Dictation..."
                  : isTranscribing
                  ? "Gemini is transcribing audio..."
                  : "Doctor Voice Scribe / Audio Dictation"}
              </span>

              {isRecording && (
                <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-600 animate-ping" />
                  REC {formatTime(recordingSeconds)}
                </span>
              )}
            </div>

            <p className="text-[11px] text-indigo-800">
              Record clinical findings; Gemini will transcribe the audio
              into text for doctor review.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transcript && !isRecording && !isTranscribing && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
                title="Clear transcript"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {onRequestSummarize && (
                <button
                  type="button"
                  onClick={() =>
                    onRequestSummarize(transcript)
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Scribe with Gemini</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {isTranscribing && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-200 bg-white p-3 text-xs font-semibold text-indigo-700">
          <Loader2 className="h-4 w-4 animate-spin" />

          <span>
            Processing recorded audio with Gemini...
          </span>
        </div>
      )}

      {transcript && (
        <div className="mt-3 rounded-lg border border-indigo-100 bg-white p-2.5 text-xs leading-relaxed text-slate-800 font-mono">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            <Volume2 className="h-3 w-3" />

            <span>Captured Voice Transcript</span>
          </div>

          {transcript}
        </div>
      )}
    </div>
  );
};