/**
 * @fileoverview LLM Provider factory.
 * Creates the appropriate LLM provider instance based on the provider name.
 * Centralizes API key resolution and provider instantiation.
 */

import type { LLMProvider, LLMProviderName } from "./types";
import { GeminiProvider } from "./gemini";

// =============================================================================
// Provider Factory
// =============================================================================

/**
 * Get the API key for a given LLM provider from environment variables.
 * In the future, tenants can supply their own keys via the dashboard.
 */
function getApiKey(provider: LLMProviderName): string {
  const keyMap: Record<LLMProviderName, string | undefined> = {
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    groq: process.env.GROQ_API_KEY,
  };

  const key = keyMap[provider];
  if (!key) {
    throw new Error(
      `Missing API key for LLM provider "${provider}". ` +
        `Set the corresponding environment variable (e.g., GEMINI_API_KEY).`
    );
  }

  return key;
}

/**
 * Create an LLM provider instance.
 *
 * @param provider - The LLM provider name (gemini, openai, etc.)
 * @param apiKey - Optional override API key. If not provided, reads from env.
 * @returns An LLMProvider instance ready to generate responses.
 *
 * @example
 * ```ts
 * const llm = getLLMProvider("gemini");
 * const { text } = await llm.generateResponse({ ... });
 * ```
 */
export function getLLMProvider(
  provider: LLMProviderName,
  apiKey?: string
): LLMProvider {
  const resolvedKey = apiKey ?? getApiKey(provider);

  switch (provider) {
    case "gemini":
      return new GeminiProvider(resolvedKey);

    case "openai":
      // TODO: Implement OpenAI provider
      throw new Error("OpenAI provider not yet implemented. Use gemini.");

    case "anthropic":
      // TODO: Implement Anthropic provider
      throw new Error("Anthropic provider not yet implemented. Use gemini.");

    case "groq":
      // TODO: Implement Groq provider
      throw new Error("Groq provider not yet implemented. Use gemini.");

    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
