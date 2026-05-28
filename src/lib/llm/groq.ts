/**
 * @fileoverview Groq LLM provider implementation.
 * Uses the Groq REST API (OpenAI-compatible) to generate chat responses.
 * Supports Llama 3, Mixtral, Gemma, and other models hosted on Groq's LPU hardware.
 *
 * No additional SDK required — Groq's API is 100% OpenAI-compatible,
 * so we call it directly via fetch for zero extra dependencies.
 *
 * @see https://console.groq.com/docs/api-reference#chat
 */

import type { ChatMessage, LLMProvider } from "./types";

// =============================================================================
// Groq API types (OpenAI-compatible subset)
// =============================================================================

interface GroqChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  max_tokens: number;
}

interface GroqChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// =============================================================================
// Groq Provider
// =============================================================================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(params: {
    systemPrompt: string;
    messages: ChatMessage[];
    model: string;
    temperature: number;
    maxTokens: number;
  }): Promise<{ text: string; tokensUsed?: number }> {
    const { systemPrompt, messages, model, temperature, maxTokens } = params;

    // Build OpenAI-compatible messages array
    const apiMessages: GroqChatRequest["messages"] = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const body: GroqChatRequest = {
      model,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Groq API error (${response.status}): ${errorBody}`
      );
    }

    const data = (await response.json()) as GroqChatResponse;

    const text = data.choices?.[0]?.message?.content ?? "";
    const tokensUsed = data.usage?.total_tokens;

    return { text, tokensUsed };
  }
}
