"use client";

import { useCallback, useState, useTransition } from "react";

import type { ActionResponse } from "@/types";

/**
 * Custom hook for calling server actions with loading and error state.
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useAction(createUser);
 *
 * const handleSubmit = async (data: FormValues) => {
 *   const result = await execute(data);
 *   if (result?.success) {
 *     // success
 *   }
 * };
 * ```
 */
export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResponse<TOutput>>
) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    async (input: TInput): Promise<ActionResponse<TOutput> | undefined> => {
      setError(undefined);
      setData(undefined);

      return new Promise((resolve) => {
        startTransition(async () => {
          try {
            const result = await action(input);

            if (!result.success) {
              setError(result.error);
            } else {
              setData(result.data);
            }

            resolve(result);
          } catch (err) {
            const errorMessage =
              err instanceof Error
                ? err.message
                : "An unexpected error occurred.";
            setError(errorMessage);
            resolve({
              success: false,
              error: errorMessage,
            });
          }
        });
      });
    },
    [action]
  );

  return {
    execute,
    isLoading: isPending,
    error,
    data,
  };
}
