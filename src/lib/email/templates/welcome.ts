// =============================================================================
// Email templates — plain HTML functions for Resend
// Replace with React Email components when you need more complex layouts.
// =============================================================================

interface WelcomeEmailProps {
  name: string;
  appName?: string;
}

/**
 * Welcome email sent after user registration.
 */
export function welcomeEmailHtml({
  name,
  appName = "agentBot",
}: WelcomeEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bienvenido a ${appName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="text-align: center; padding-bottom: 24px;">
                            <h1 style="margin: 0; font-size: 24px; color: #18181b;">🚀 ¡Bienvenido, ${name}!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 24px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                            <p style="margin: 0 0 16px 0;">
                                Gracias por registrarte en <strong>${appName}</strong>. Tu cuenta está lista.
                            </p>
                            <p style="margin: 0;">
                                Si tienes alguna pregunta, responde a este correo — estamos para ayudarte.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}" style="display: inline-block; padding: 12px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                Ir a ${appName}
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
}
