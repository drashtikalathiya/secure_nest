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
  const user = process.env.MAIL_USER;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!user || !clientId || !clientSecret || !refreshToken) {
    throw new InternalServerErrorException(
      'Email service is not configured.',
    );
  }

  const appName = process.env.MAIL_FROM_NAME || 'SecureNest';
  const from = process.env.MAIL_FROM || user;
  const supportEmail = process.env.SUPPORT_EMAIL || from;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const frontendDomain = new URL(frontendUrl).host;

  return {
    user,
    clientId,
    clientSecret,
    refreshToken,
    appName,
    from,
    supportEmail,
    frontendUrl,
    frontendDomain,
  };
};

export const createTransporter = (config: {
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.user,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
    },
  });
