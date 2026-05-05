import Link from "next/link";
import { APP_CONFIG } from "@/lib/constants";

export default function NotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="w-full max-w-lg text-center">
          {/* Error badge */}
          <span className="mb-6 inline-block rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Error 404
          </span>

          {/* Large 404 */}
          <h1 className="mb-2 bg-gradient-to-b from-gray-900 to-gray-400 bg-clip-text text-[120px] leading-none font-bold text-transparent md:text-[160px]">
            404
          </h1>

          {/* Heading */}
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
            Página no encontrada
          </h2>

          {/* Separator */}
          <div className="mx-auto mb-6 h-1 w-16 rounded-full bg-violet-500" />

          {/* Description */}
          <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-gray-500 md:text-lg">
            La página que buscas no está disponible. Puede que haya sido
            eliminada o que la URL sea incorrecta.
          </p>

          {/* CTA */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            ← Volver al inicio
          </Link>

          {/* Footer */}
          <p className="mt-12 text-xs text-gray-400">
            © {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </body>
    </html>
  );
}
