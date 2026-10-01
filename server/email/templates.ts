import type { TransactionalEmailMessage } from "./provider.js";

type TemplateInput = {
  to: string;
  token: string;
  publicAppUrl: string;
  requestId?: string | undefined;
};

export function verificationEmail(input: TemplateInput): TransactionalEmailMessage {
  const link = securityLink(input.publicAppUrl, "/verify-email", input.token);
  return {
    to: input.to,
    type: "VERIFY_EMAIL",
    subject: "Verify your FibreConnect SA email",
    text: [
      "Verify your FibreConnect SA email address.",
      "",
      `Open this link within 24 hours: ${link}`,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: emailHtml(
      "Verify your email",
      "Confirm your email address to finish setting up your FibreConnect SA account.",
      "Verify email",
      link,
      "This link expires in 24 hours. If you did not create this account, you can ignore this email.",
    ),
    metadata: { requestId: input.requestId },
  };
}

export function passwordResetEmail(input: TemplateInput): TransactionalEmailMessage {
  const link = securityLink(input.publicAppUrl, "/reset-password", input.token);
  return {
    to: input.to,
    type: "RESET_PASSWORD",
    subject: "Reset your FibreConnect SA password",
    text: [
      "A password reset was requested for your FibreConnect SA account.",
      "",
      `Open this link to reset your password: ${link}`,
      "This link expires in 1 hour and can be used once.",
      "",
      "If you did not request this reset, ignore this email and keep your password unchanged.",
    ].join("\n"),
    html: emailHtml(
      "Reset your password",
      "Use the secure link below to choose a new FibreConnect SA password.",
      "Reset password",
      link,
      "This link expires in 1 hour and can be used once. If you did not request it, ignore this email.",
    ),
    metadata: { requestId: input.requestId },
  };
}

function securityLink(publicAppUrl: string, path: string, token: string): string {
  const url = new URL(path, publicAppUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

function emailHtml(title: string, purpose: string, action: string, link: string, guidance: string): string {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#172033;line-height:1.5"><h1 style="font-size:22px">FibreConnect SA</h1><h2 style="font-size:18px">${escapeHtml(title)}</h2><p>${escapeHtml(purpose)}</p><p><a href="${escapeHtml(link)}">${escapeHtml(action)}</a></p><p style="font-size:13px;color:#526076">${escapeHtml(guidance)}</p></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]!);
}
