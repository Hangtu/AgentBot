// =============================================================================
// SWR fetcher — configured fetch wrapper with error handling
// =============================================================================

/**
 * Custom error for fetch failures with status code access.
 */
export class FetchError extends Error {
  readonly status: number;
  readonly info: unknown;

  constructor(status: number, message: string, info?: unknown) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
  }
}

/**
 * Generic typed fetcher for SWR.
 *
 * @example
 * ```tsx
 * const { data, error } = useSWR<User[]>("/api/users", fetcher);
 * ```
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    let info: unknown;
    try {
      info = await res.json();
    } catch {
      info = await res.text();
    }

    throw new FetchError(
      res.status,
      `Fetch failed: ${res.status} ${res.statusText}`,
      info
    );
  }

  return res.json() as Promise<T>;
}
