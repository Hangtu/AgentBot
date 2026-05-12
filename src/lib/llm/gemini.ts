/**
 * @fileoverview Google Gemini LLM provider implementation.
 * Uses the @google/genai SDK to generate chat responses via Gemini models.
 * Supports gemini-2.0-flash (default), gemini-2.0-flash-lite, gemini-2.5-flash, etc.
 */

import { GoogleGenAI } from "@google/genai";

import type { ChatMessage, LLMProvider } from "./types";

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateResponse(params: {
    systemPrompt: string;
    messages: ChatMessage[];
    model: string;
    temperature: number;
    maxTokens: number;
  }): Promise<{ text: string; tokensUsed?: number }> {
    const { systemPrompt, messages, model, temperature, maxTokens } = params;

    // Build the contents string:
    // Gemini's generateContent accepts a simple contents string or structured parts.
    // For chat-style, we format the conversation history.
    const conversationParts: string[] = [];

    for (const msg of messages) {
      if (msg.role === "user") {
        conversationParts.push(`User: ${msg.content}`);
      } else if (msg.role === "assistant") {
        conversationParts.push(`Assistant: ${msg.content}`);
      }
    }

    const fullPrompt = conversationParts.join("\n\n");

    const response = await this.client.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const text = response.text ?? "";
    const tokensUsed = response.usageMetadata?.totalTokenCount;

    return { text, tokensUsed };
  }
}
