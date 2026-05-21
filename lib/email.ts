/**
 * KSM Premium Email Design System
 * Utilitaire d'envoi d'emails via l'API Brevo avec un design system brut et luxe.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
  bcc?: string;
}

export async function sendEmail({ to, subject, htmlContent, tags, bcc }: SendEmailParams) {
  if (!API_KEY) {
    console.error('BREVO_API_KEY is missing. Email not sent.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Kheops Set Motivation',
          email: 'kheopset@gmail.com',
        },
        to: [{ email: to }],
        ...(bcc ? { bcc: [{ email: bcc }] } : {}),
        subject: subject,
        htmlContent: htmlContent,
        tags: tags
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

/* ==========================================================================
   EMAIL DESIGN SYSTEM COMPONENTS
   ========================================================================== */

const getHead = (title: string) => `
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;900&display=swap');
    body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; display: block; }
    p { margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #d4d4d8; }
    a { color: #eeb149; text-decoration: none; }
    .anton { font-family: 'Anton', Impact, sans-serif; font-weight: normal; }
    .inter { font-family: 'Inter', Helvetica, Arial, sans-serif; }
    .highlight { color: #ffffff; font-weight: 600; }
    .gold { color: #eeb149; }
    .muted { color: #71717a; }
  </style>
</head>
`;

const getContainer = (content: string, maxWidth = 600, borderLeft = '', borderAll = '', title = "KSM Communication") => `
<!DOCTYPE html>
<html lang="fr">
${getHead(title)}
<body style="margin: 0; padding: 0; background-color: #000000;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 15px;">
        <!--[if mso]>
        <table role="presentation" width="${maxWidth}" border="0" cellspacing="0" cellpadding="0" align="center"><tr><td>
        <![endif]-->
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: ${maxWidth}px; background-color: #0a0a0a; border-radius: 4px; ${borderLeft ? `border-left: ${borderLeft};` : ''} ${borderAll ? `border: ${borderAll};` : ''} overflow: hidden;">
          ${content}
        </table>
        <!--[if mso]>
        </td></tr></table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getHeader = (preheaderText: string, minimal = false) => `
<tr>
  <td align="center" style="padding: ${minimal ? '30px' : '45px'} 40px 10px 40px;">
    <!-- Preheader -->
    <div style="display: none; max-height: 0px; overflow: hidden; color: #000000;">${preheaderText}</div>
    <div style="font-size: 11px; font-weight: 900; letter-spacing: 8px; color: #eeb149; text-transform: uppercase; margin-bottom: 0;">KHEOPS SET</div>
  </td>
</tr>
`;

const getDivider = () => `
<tr>
  <td style="padding: 10px 40px;">
    <div style="border-top: 1px solid #1f1f22; width: 100%;"></div>
  </td>
</tr>
`;

const getFooter = () => `
<tr>
  <td align="center" style="padding: 30px 40px 45px 40px;">
    <div style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 3px; font-weight: 900; margin-bottom: 12px;">Bâtir son empire. Sans concession.</div>
    <div style="font-size: 9px; color: #3f3f46; letter-spacing: 1px;">Kheops Set Motivation © ${new Date().getFullYear()}</div>
  </td>
</tr>
`;

const getButton = (text: string, url: string, inverse = false) => {
  const bg = inverse ? '#ffffff' : '#eeb149';
  const color = '#000000';
  return `
<tr>
  <td align="center" style="padding: 20px 40px 30px 40px;">
    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="background-color: ${bg}; border-radius: 2px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 22px 50px; font-family: 'Inter', Helvetica, sans-serif; font-size: 14px; color: ${color}; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${text}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>
  `;
};

const getTitle = (main: string, accent: string = '', align = 'center') => `
<tr>
  <td style="padding: 20px 40px 30px 40px; text-align: ${align};">
    <h1 class="anton" style="margin: 0; font-size: 42px; line-height: 1.1; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; font-weight: normal;">
      ${main} ${accent ? `<br/><span style="color: #eeb149;">${accent}</span>` : ''}
    </h1>
  </td>
</tr>
`;

const getSubLabel = (text: string, align = 'center', color = '#71717a') => `
<tr>
  <td style="padding: 0 40px 10px 40px; text-align: ${align};">
    <p style="margin: 0; font-size: 10px; font-weight: 900; letter-spacing: 4px; color: ${color}; text-transform: uppercase;">${text}</p>
  </td>
</tr>
`;

const getQuote = (quote: string) => `
<tr>
  <td style="padding: 10px 40px 30px 40px;">
    <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
      <tr>
        <td style="background-color: #111111; border-left: 3px solid #eeb149; padding: 25px 30px;">
          <p style="margin: 0; font-size: 15px; font-style: italic; color: #a1a1aa; line-height: 1.7;">"${quote}"</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

const getParagraphs = (texts: string[], align = 'left') => `
<tr>
  <td style="padding: 0 40px 10px 40px; text-align: ${align};">
    ${texts.map(t => `<p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; color: #d4d4d8;">${t}</p>`).join('\n')}
  </td>
</tr>
`;

/* ==========================================================================
   EMAIL TEMPLATES
   ========================================================================== */

/**
 * Envoie le livre numérique au client (Post-Achat)
 */
export async function sendProductDeliveryEmail(customerEmail: string, productName: string, downloadUrl: string, customerName?: string) {
  const greeting = customerName ? `${customerName},` : 'Bâtisseur,';
  const htmlContent = getContainer(
    getHeader("Ton accès au Protocole est déverrouillé.") +
    getSubLabel("Confirmation d'accès", "center") +
    getTitle("ORDRE", "VALIDÉ.", "center") +
    getParagraphs([
      greeting,
      `Ton accès au protocole <span class="highlight">${productName}</span> a été déverrouillé avec succès.`,
      "Tu peux maintenant télécharger ton matériel brut et commencer l'exécution en cliquant sur le lien sécurisé ci-dessous :"
    ]) +
    getButton("Télécharger le protocole", downloadUrl) +
    `<tr><td align="center" style="padding: 0 40px 30px 40px;"><p style="font-size: 12px; color: #71717a; margin: 0;">Ce lien est hautement sécurisé et restera actif pendant <span class="highlight">7 jours</span>.</p></td></tr>` +
    getDivider() +
    getFooter(),
    600, '', '', "Livraison de ton protocole"
  );

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Livraison : ${productName}`,
    htmlContent,
    bcc: 'kheopset@gmail.com',
  });
}

/**
 * Notifie l'admin d'une nouvelle vente (Tableau de bord Vibe)
 */
export async function sendAdminNotification(customerEmail: string, productName: string, amount: number) {
  const htmlContent = getContainer(
    `
    <tr>
      <td style="padding: 40px;">
        <h1 class="anton" style="margin: 0 0 30px 0; font-size: 32px; color: #10b981; text-transform: uppercase; letter-spacing: 1px;">NOUVELLE VENTE</h1>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Produit</div>
              <div style="font-size: 18px; color: #ffffff; font-weight: 600;">${productName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Montant</div>
              <div style="font-size: 18px; color: #eeb149; font-weight: 900;">${amount} FCFA</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Client</div>
              <div style="font-size: 16px; color: #ffffff; font-family: monospace;">${customerEmail}</div>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0; font-size: 12px; color: #10b981; font-weight: 600;">✓ Lien de téléchargement envoyé automatiquement.</p>
      </td>
    </tr>
    `,
    600, '', '', "Notification Vente"
  );

  return sendEmail({
    to: 'kheopset@gmail.com',
    subject: `NOUVELLE VENTE : ${productName} (${amount} FCFA)`,
    htmlContent,
  });
}

/**
 * Email Marketing : Relance H+1 (L'Interruption)
 */
export async function sendMarketingReminderH1(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string, customerName?: string) {
  const greeting = customerName || 'Bâtisseur';
  const htmlContent = getContainer(
    getHeader("Le destin n'attend pas les indécis.") +
    getSubLabel("Relance Automatique", "center") +
    getTitle("TON OUTIL", "T'ATTEND.", "center") +
    getParagraphs([
      `${greeting},`,
      `Il y a quelques instants, tu étais à un clic de transformer ta trajectoire. Le protocole <span class="highlight">${productName}</span> est resté sur le seuil de la Forge.`,
      `L'infrastructure est prête. Les outils sont affûtés. <span class="highlight">Il ne manque que ta décision.</span>`
    ]) +
    getButton("Reprendre l'accès ➔", checkoutUrl) +
    getDivider() +
    getFooter(),
    600, '', '', "L'Interruption KSM"
  );

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] ${productName} — ton outil t'attend, ${greeting}.`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h1'] : ['marketing_h1'],
    bcc: 'kheopset@gmail.com',
  });
}

/**
 * Email Marketing : Relance H+24 (Le Prix de l'Hésitation)
 */
export async function sendMarketingReminderH24(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string, customerName?: string) {
  const htmlContent = getContainer(
    getHeader("Pendant que tu hésites, d'autres bâtissent.", true) +
    getSubLabel("24 heures plus tard", "left") +
    getTitle("PENDANT QUE TU HÉSITES,", "D'AUTRES BÂTISSENT.", "left") +
    getParagraphs([`Hier, tu as failli franchir le pas. Le protocole <span class="highlight">${productName}</span> était à portée de main.`]) +
    getQuote(`L'indécision est le voleur de l'opportunité.<br/>La stagnation est le salaire de la peur.`) +
    getParagraphs([
      `Qu'est-ce qui t'a arrêté ? <span class="highlight">Le doute ? La complaisance ?</span>`,
      `Les bâtisseurs ne réfléchissent pas éternellement. <span class="gold" style="font-weight: 600;">Ils exécutent.</span>`
    ]) +
    getButton("Écraser le doute ➔", checkoutUrl, true) +
    getDivider() +
    getFooter(),
    600,
    "4px solid #eeb149",
    '',
    "Le Prix de l'Hésitation"
  );

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Pendant que tu hésites, d'autres bâtissent...`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h24'] : ['marketing_h24'],
    bcc: 'kheopset@gmail.com',
  });
}

/**
 * Email Marketing : Relance H+72 (L'Urgence)
 */
export async function sendMarketingReminderH72(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string, customerName?: string) {
  const greeting = customerName || 'Bâtisseur';
  const htmlContent = getContainer(
    getHeader("Ton accès prioritaire expire dans quelques heures.") +
    getSubLabel("⚠ Notification Finale", "center", "#eeb149") +
    getTitle("DERNIER", "APPEL.", "center") +
    getParagraphs([
      `${greeting}, ton accès prioritaire au <span class="gold highlight">${productName}</span> expire dans quelques heures.`,
      `<span style="color: #a1a1aa; font-size: 15px;">Demain, le système réinitialisera ton lien sécurisé. Tu seras de retour à la case départ, avec ceux qui observent au lieu d'agir.</span>`
    ], "center") +
    getButton("Sécuriser l'accès ➔", checkoutUrl) +
    `<tr><td align="center" style="padding: 0 40px 30px 40px;"><p style="font-size: 11px; font-weight: 900; letter-spacing: 3px; color: #eeb149; text-transform: uppercase; margin: 0;">C'EST MAINTENANT OU JAMAIS.</p></td></tr>` +
    getDivider() +
    getFooter(),
    600,
    "",
    "3px solid #eeb149",
    "Dernier Appel KSM"
  );

  return sendEmail({
    to: customerEmail,
    subject: `[FINAL] Dernier appel : ton accès au ${productName} expire, ${greeting}.`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h72'] : ['marketing_h72'],
    bcc: 'kheopset@gmail.com',
  });
}

/**
 * Notifie l'admin d'une relance marketing
 */
export async function sendMarketingAdminNotification(customerEmail: string, productName: string, reminderType: string) {
  const typeLabel = reminderType === 'h1' ? 'H+1 (Interruption)' : reminderType === 'h24' ? 'H+24 (Preuve)' : 'H+72 (Urgence)';
  
  const htmlContent = getContainer(
    `
    <tr>
      <td style="padding: 40px;">
        <h1 class="anton" style="margin: 0 0 30px 0; font-size: 24px; color: #eeb149; text-transform: uppercase; letter-spacing: 1px;">⚡ ACTIVITÉ MARKETING</h1>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Action</div>
              <div style="font-size: 15px; color: #ffffff; font-weight: 600;">Envoi Relance ${typeLabel}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Produit</div>
              <div style="font-size: 15px; color: #eeb149; font-weight: 600;">${productName}</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #1f1f22;">
              <div style="font-size: 10px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 5px;">Cible</div>
              <div style="font-size: 14px; color: #ffffff; font-family: monospace;">${customerEmail}</div>
            </td>
          </tr>
        </table>
        
        <p style="margin: 0; font-size: 11px; color: #52525b; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Système de récupération automatique KSM.</p>
      </td>
    </tr>
    `,
    600, '', '', "Marketing Admin"
  );

  return sendEmail({
    to: 'ybaopportun@gmail.com',
    subject: `[KSM ADMIN] Relance ${reminderType.toUpperCase()} envoyée à ${customerEmail}`,
    htmlContent,
  });
}
