/**
 * @fileoverview Admin API — Test Chatwoot connection.
 * POST /api/v1/admin/integrations/test-chatwoot
 * Body: { base_url, api_token, account_id }
 *
 * Pings the Chatwoot API to verify the credentials are valid.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      base_url?: string;
      api_token?: string;
      account_id?: string;
    };

    const baseUrl = body.base_url ?? "https://app.chatwoot.com";
    const apiToken = body.api_token;
    const accountId = body.account_id;

    if (!apiToken || !accountId) {
      return NextResponse.json(
        { success: false, error: "api_token and account_id are required" },
        { status: 400 }
      );
    }

    // Hit the Chatwoot profile endpoint — lightest authenticated call
    const url = `${baseUrl}/auth/sign_in`;
    const profileUrl = `${baseUrl}/api/v1/profile`;

    const response = await fetch(profileUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        api_access_token: apiToken,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as { name?: string; email?: string };
      return NextResponse.json({
        success: true,
        message: `✅ Conexión exitosa${data.name ? ` — usuario: ${data.name}` : ""}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `❌ Error ${response.status}: token o account_id inválido`,
      });
    }
  } catch (err) {
    console.error("[admin/integrations/test-chatwoot]", err);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo conectar con el servidor de Chatwoot. Verifica la URL.",
      },
      { status: 500 }
    );
  }
}
