// =============================================================================
// Friendly error messages — maps technical errors to user-facing messages.
// Pattern-based matching converts cryptic errors into actionable feedback.
// =============================================================================

interface ErrorMapping {
  pattern: RegExp;
  message: string;
  action?: string;
}

const errorMappings: ErrorMapping[] = [
  // Network errors
  {
    pattern: /network|fetch|connection/i,
    message:
      "No pudimos conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.",
    action: "Verifica tu conexión",
  },
  {
    pattern: /timeout/i,
    message: "La solicitud tardó demasiado. Intenta de nuevo en un momento.",
    action: "Intenta de nuevo",
  },

  // Authentication errors
  {
    pattern: /unauthorized|401/i,
    message: "Tu sesión ha expirado. Inicia sesión nuevamente.",
    action: "Iniciar sesión",
  },
  {
    pattern: /forbidden|403/i,
    message: "No tienes permiso para realizar esta acción.",
    action: "Contacta a tu administrador",
  },

  // Validation errors
  {
    pattern: /required|requerido/i,
    message: "Completa todos los campos requeridos.",
    action: "Revisa los campos marcados",
  },
  {
    pattern: /invalid.*email|email.*invalid/i,
    message:
      "El correo electrónico no parece válido. Ejemplo: juan@empresa.com",
    action: "Verifica el formato del correo",
  },

  // Not found errors
  {
    pattern: /not found|404|no encontrado/i,
    message:
      "No pudimos encontrar lo que buscas. Puede que haya sido eliminado.",
    action: "Verifica la información",
  },

  // Server errors
  {
    pattern: /server error|500|internal error/i,
    message:
      "Ocurrió un problema en el servidor. Nuestro equipo ha sido notificado.",
    action: "Intenta de nuevo en unos minutos",
  },

  // Database errors
  {
    pattern: /duplicate|ya existe|already exists/i,
    message:
      "Este registro ya existe. Verifica que no estés duplicando información.",
    action: "Busca el registro existente",
  },
  {
    pattern: /constraint|foreign key/i,
    message:
      "No se puede realizar esta acción porque hay información relacionada.",
    action: "Elimina primero los registros relacionados",
  },

  // Rate limit
  {
    pattern: /rate.?limit|too many|429/i,
    message: "Demasiadas solicitudes. Espera un momento antes de intentar.",
    action: "Espera unos segundos",
  },

  // Generic fallback — must be last
  {
    pattern: /error|fallo|failed/i,
    message: "No pudimos completar la acción. Intenta de nuevo.",
    action: "Intenta de nuevo",
  },
];

/**
 * Convert a technical error to a user-friendly message.
 */
export function getFriendlyErrorMessage(error: unknown): {
  message: string;
  action?: string;
} {
  if (!error) {
    return {
      message: "Ocurrió un error inesperado. Intenta de nuevo.",
      action: "Intenta de nuevo",
    };
  }

  const errorString =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error);

  for (const mapping of errorMappings) {
    if (mapping.pattern.test(errorString)) {
      return {
        message: mapping.message,
        action: mapping.action,
      };
    }
  }

  return {
    message:
      "No pudimos completar la acción. Si el problema persiste, contacta a soporte.",
    action: "Contactar soporte",
  };
}

/**
 * Get a user-friendly error message for HTTP responses.
 */
export function getApiErrorMessage(
  status: number,
  defaultMessage?: string
): string {
  if (status === 401) return "Tu sesión ha expirado. Inicia sesión nuevamente.";
  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 404) return "No pudimos encontrar lo que buscas.";
  if (status === 429) return "Demasiadas solicitudes. Espera un momento.";
  if (status >= 500)
    return "Ocurrió un problema en el servidor. Intenta de nuevo.";
  return defaultMessage || "No pudimos completar la acción. Intenta de nuevo.";
}
