type BrandHeaderCellParams = {
  brandName?: string;
  brandTagline?: string;
};

export const renderSecureNestBrandTd = (
  params: BrandHeaderCellParams = {},
): string => {
  const brandName = params.brandName || 'SecureNest';
  const brandTagline = params.brandTagline || 'Family Security Vault';

  return `
    <td style="background:#1f56cf;padding:14px 18px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="vertical-align:middle;">
            <div style="padding: 9px;border-radius:100%;background:#ffffff;display:flex;align-items:center;justify-content:center;color:#8ec5ff;font-size:18px;">
              &#128737;
            </div>
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <div style="font-size:20px;line-height:1.1;font-weight:700;color:#ffffff;margin:0;">
              ${brandName}
            </div>
            <div style="font-size:15px;line-height:1.2;color:#ffffff;margin-top:4px;">
              ${brandTagline}
            </div>
          </td>
        </tr>
      </table>
    </td>
  `;
};

type InvitationEmailTemplateParams = {
  appName: string;
  ownerName: string;
  inviteLink: string;
  expiresAtUtc: string;
  supportEmail: string;
  frontendDomain: string;
};

export const renderInvitationEmailHtml = (
  params: InvitationEmailTemplateParams,
): string => {
  return `
    <div style="margin:0;padding:20px 10px;background:#f3f6fb;font-family:Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;border:1px solid #dbe5f0;border-radius:6px;overflow:hidden;background:#ffffff;">
        <tr>
          ${renderSecureNestBrandTd({
            brandName: params.appName,
            brandTagline: 'Family Security Vault',
          })}
        </tr>
        <tr>
          <td style="padding:24px 24px 20px 24px;background:#ffffff;">
            <p style="margin:0;text-align:center;font-size:28px;line-height:1.35;font-weight:700;color:#1e293b;">
              ${params.ownerName} has invited you to join the Family Vault
            </p>
            <div style="width:58px;height:3px;background:#2f78ff;margin:12px auto 18px auto;border-radius:2px;"></div>

            <div style="margin:0 0 18px 0;padding:14px 14px;border-left:3px solid #2f78ff;background:#f4f8ff;">
              <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;font-style:italic;">
                "Hey, I've set up a secure vault for us to keep all our important documents and passwords in one place."
              </p>
            </div>

            <p style="margin:0 0 10px 0;font-size:24px;line-height:1.35;font-weight:700;color:#1e293b;">
              What is Securenest?
            </p>
            <p style="margin:0 0 12px 0;font-size:15px;color:#475569;">
              Securenest is a highly encrypted, private digital safe designed specifically for families.
              It provides a central, shared location to protect:
            </p>

            <p style="margin:0 0 7px 0;font-size:15px;line-height:1.5;color:#334155;">&#9989; Shared Family Passwords &amp; Logins</p>
            <p style="margin:0 0 7px 0;font-size:15px;line-height:1.5;color:#334155;">&#9989; Medical Records &amp; Insurance Cards</p>
            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.5;color:#334155;">&#9989; Legal Documents &amp; Birth Certificates</p>

            <p style="margin:0;text-align:center;">
              <a href="${params.inviteLink}" style="display:inline-block;background:#1f56cf;color:#ffffff;text-decoration:none;font-weight:700;font-size:18px;padding:8px 16px;border-radius:6px;">
                Join Family Vault
              </a>
            </p>
            <p style="margin:12px 0 0 0;text-align:center;font-size:12px;line-height:1.5;color:#64748b;">
              This invitation link expires on ${params.expiresAtUtc}.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #dbe5f0;padding:14px 18px 18px 18px;text-align:center;">
            <p style="margin:0 0 10px 0;font-size:11px;line-height:1.5;color:#64748b;">
              SecureNest uses end-to-end encryption. Only you and your family members hold the keys to decrypt your data.
              Even SecureNest employees cannot see your stored files.
            </p>
            <p style="margin:0;font-size:10px;line-height:1.5;color:#64748b;">
              Need help? <a href="mailto:${params.supportEmail}" style="color:#1f56cf;text-decoration:none;">${params.supportEmail}</a> &nbsp;|&nbsp; Trust only links on ${params.frontendDomain}
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
