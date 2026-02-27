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
  const host = process.env.MAIL_HOST;
  const port = Number(process.env.MAIL_PORT || 587);
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    throw new InternalServerErrorException(
      'Email service is not configured.',
    );
  }

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
