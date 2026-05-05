"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Algo salió mal
          </h2>
          <p className="mb-6 text-gray-500">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
