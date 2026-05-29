/**
 * @fileoverview Local bot configuration loader.
 * Reads config/agent.json, config/system_prompt.txt, and config/knowledge.txt
 * from the filesystem to initialize or override bot settings.
 */

import fs from "fs";
import path from "path";

import type { BotConfig, LLMProviderName, ResponseMode } from "@/types/agent";

export interface LocalConfigResult {
  bot: BotConfig;
  responseMode: ResponseMode;
  platformConfig: Record<string, unknown>;
}

/**
 * Check if the core local configuration files exist.
 */
export function hasLocalConfig(): boolean {
  const agentPath = path.join(process.cwd(), "config", "agent.json");
  const promptPath = path.join(process.cwd(), "config", "system_prompt.txt");
  return fs.existsSync(agentPath) && fs.existsSync(promptPath);
}

/**
 * Load and combine local configuration files.
 */
export function loadLocalBotConfig(): LocalConfigResult | null {
  try {
    if (!hasLocalConfig()) {
      return null;
    }

    const agentPath = path.join(process.cwd(), "config", "agent.json");
    const promptPath = path.join(process.cwd(), "config", "system_prompt.txt");
    const knowledgePath = path.join(process.cwd(), "config", "knowledge.txt");

    const agentJsonRaw = fs.readFileSync(agentPath, "utf-8");
    const agentData = JSON.parse(agentJsonRaw) as Record<string, unknown>;

    const systemPromptText = fs.readFileSync(promptPath, "utf-8");
    let knowledgeText = "";
    if (fs.existsSync(knowledgePath)) {
      knowledgeText = fs.readFileSync(knowledgePath, "utf-8");
    }

    let combinedPrompt = systemPromptText;
    if (knowledgeText.trim()) {
      combinedPrompt += `\n\n=== INFORMACIÓN DE RESPALDO / CONOCIMIENTO DEL NEGOCIO ===\n${knowledgeText}`;
    }

    // Map properties with sensible defaults
    const llmProvider = (agentData.llm_provider || "groq") as LLMProviderName;
    const llmModel = (agentData.llm_model || "llama-3.3-70b-versatile") as string;
    const temperature = typeof agentData.temperature === "number" ? agentData.temperature : 0.7;
    const maxTokens = typeof agentData.max_tokens === "number" ? agentData.max_tokens : 1024;
    const contextWindow = typeof agentData.context_window === "number" ? agentData.context_window : 20;

    const bot: BotConfig = {
      id: "00000000-0000-0000-0000-000000000000", // Dummy local ID
      tenant_id: "00000000-0000-0000-0000-000000000000", // Dummy local ID
      name: (agentData.name || "Local Agent") as string,
      system_prompt: combinedPrompt,
      llm_provider: llmProvider,
      llm_model: llmModel,
      temperature,
      max_tokens: maxTokens,
      context_window: contextWindow,
      is_active: true,
    };

    // Chatwoot channel config
    const channels = (agentData.channels || {}) as Record<string, unknown>;
    const chatwootConfig = (channels.chatwoot || {}) as Record<string, unknown>;
    const responseMode = (chatwootConfig.response_mode || "sync") as ResponseMode;
    const platformConfig = { ...((chatwootConfig.platform_config || {}) as Record<string, unknown>) };

    // Support reading sensitive platform credentials from env variables
    for (const key in platformConfig) {
      const val = platformConfig[key];
      if (typeof val === "string" && val.startsWith("process.env.")) {
        const envVarName = val.replace("process.env.", "");
        platformConfig[key] = process.env[envVarName] || val;
      }
    }

    return {
      bot,
      responseMode,
      platformConfig,
    };
  } catch (error) {
    console.error("❌ Failed to load local bot configuration:", error);
    return null;
  }
}
