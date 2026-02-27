import { Injectable } from '@nestjs/common';
import { getMailHealth, sendTestEmail } from '../utils/email';

@Injectable()
export class MailService {
  async getHealth() {
    return getMailHealth();
  }

  async sendTestEmail(to: string, requestedBy?: string) {
    return sendTestEmail({ to, requestedBy });
  }
}
