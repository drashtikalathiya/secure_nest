import * as nodemailer from 'nodemailer';
import { InternalServerErrorException } from '@nestjs/common';

export const escapeHtml = (value: string): string =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const getMailConfig = () => {
  const config = mailConfigFromEnv();

  if (!isMailConfigured(config)) {
    throw new InternalServerErrorException(
      'Email service is not configured.',
    );
  }

  return config;
};

export const createTransporter = (config: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}) =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

export const mailConfigFromEnv = () => {
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const secure =
    String(process.env.MAIL_SECURE || 'false').toLowerCase() === 'true';
  const appName = process.env.MAIL_FROM_NAME || 'SecureNest';
  const from = process.env.MAIL_FROM || user;
  const supportEmail = process.env.SUPPORT_EMAIL || from || user;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const frontendDomain = new URL(frontendUrl).host;

  return {
    host,
    port,
    user,
    pass,
    secure,
    appName,
    from,
    supportEmail,
    frontendUrl,
    frontendDomain,
  };
};

export const isMailConfigured = (
  config: ReturnType<typeof mailConfigFromEnv>,
) => Boolean(config.host && config.user && config.pass);

export const getMailConfigReason = (
  config: ReturnType<typeof mailConfigFromEnv>,
) => {
  if (!config.host) return 'missing_mail_host';
  if (!config.user) return 'missing_mail_user';
  if (!config.pass) return 'missing_mail_pass';
  return null;
};

export const getTransporter = () => {
  const config = mailConfigFromEnv();
  return createTransporter({
    host: config.host || '',
    port: config.port,
    secure: config.secure,
    user: config.user || '',
    pass: config.pass || '',
  });
};

export const getMailHealth = async () => {
  const config = mailConfigFromEnv();
  const configured = isMailConfigured(config);

  const sanitizedConfig = {
    host: config.host || null,
    port: config.port || null,
    secure: config.secure,
    user: config.user || null,
    from: config.from || null,
    hasPass: Boolean(config.pass),
    nodemailerLoaded: Boolean(nodemailer),
  };

  if (!configured) {
    return {
      configured: false,
      verify: {
        ok: false,
        reason: getMailConfigReason(config) || 'missing_mail_configuration',
      },
      config: sanitizedConfig,
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      configured: true,
      verify: { ok: true },
      config: sanitizedConfig,
    };
  } catch (error) {
    return {
      configured: true,
      verify: {
        ok: false,
        reason: 'smtp_verify_failed',
        detail: error instanceof Error ? error.message : String(error),
      },
      config: sanitizedConfig,
    };
  }
};

export const sendTestEmail = async (params: {
  to: string;
  requestedBy?: string;
}) => {
  if (!params.to) {
    return { sent: false, reason: 'recipient_missing' };
  }

  const health = await getMailHealth();
  if (!health.verify.ok) {
    return {
      sent: false,
      reason: health.verify.reason || 'mail_not_ready',
      detail: health.verify.detail,
      config: health.config,
    };
  }

  const transporter = getTransporter();
  const config = mailConfigFromEnv();
  const subject = 'SecureNest - SMTP Test Email';
  const text = [
    'This is a test email from SecureNest.',
    `Requested by: ${params.requestedBy || 'unknown user'}`,
    `Sent at: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await transporter.sendMail({
      from: config.from,
      to: params.to,
      subject,
      text,
    });

    return {
      sent: true,
      to: params.to,
      config: health.config,
    };
  } catch (error) {
    return {
      sent: false,
      reason: 'smtp_send_failed',
      detail: error instanceof Error ? error.message : String(error),
      to: params.to,
      config: health.config,
    };
  }
};
