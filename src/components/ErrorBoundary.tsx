import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { AppStorage } from "../database/storage";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("MediDesk Application Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetApp = () => {
    try {
      AppStorage.resetToDemoData();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-center space-y-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-1">
                The application encountered an unexpected state. You can reload or reset to initial demo data.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-slate-950/60 p-3.5 rounded-xl border border-slate-700/50 text-[11px] font-mono text-rose-300 max-h-32 overflow-auto break-all">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-600 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                <Home className="h-4 w-4" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


