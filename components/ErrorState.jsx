import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function ErrorState({
  message = 'Something went wrong while loading data. Please check your connection.',
  onRetry,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-neutral-900 px-4 py-3 mb-6">
        <p className="text-sm text-neutral-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-900 border border-neutral-800 mb-5">
        <AlertTriangle className="w-9 h-9 text-neutral-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
      <p className="text-neutral-400 max-w-sm leading-relaxed mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
