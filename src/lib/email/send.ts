import { resend } from "@/lib/resend";
import { logger } from "@/lib/logger";

// =============================================================================
// Email send function — centralized email dispatch
// =============================================================================

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email via Resend.
 * Uses RESEND_FROM_EMAIL as default sender.
 *
 * @example
 * ```ts
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: welcomeEmailHtml({ name: "John" }),
 * });
 * ```
 */
export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  const sender =
    from ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      logger.error("Failed to send email", error, { to, subject });
      return { success: false as const, error: error.message };
    }

    logger.info("Email sent", { to, subject, id: data?.id });
    return { success: true as const, id: data?.id };
  } catch (error) {
    logger.error("Email send threw", error, { to, subject });
    return { success: false as const, error: "Failed to send email" };
  }
}
