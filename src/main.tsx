import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GTA VI Platform] Production Runtime Exception caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090D] text-[#F4F1ED] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-[#121318] border border-[#24262B] p-8 rounded-2xl shadow-2xl space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#FF4FA3]">
              Grand Theft Auto VI
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              An unexpected display issue occurred. Click below to refresh and restore state.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-[#F4F1ED] text-[#08090D] font-bold text-xs uppercase tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
            >
              Refresh Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Ensure active Service Workers are updated to current build without unhandled InvalidStateError rejections
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.allSettled(
          registrations.map((registration) => {
            if (registration.active || registration.waiting || registration.installing) {
              return registration.update().catch(() => undefined);
            }
            return Promise.resolve();
          })
        )
      )
      .catch(() => {});
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </React.StrictMode>
  );
}
