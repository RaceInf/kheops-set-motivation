/**
 * Utilitaire d'envoi d'emails via l'API Brevo (Sendinblue)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
}

export async function sendEmail({ to, subject, htmlContent, tags }: SendEmailParams) {
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

/**
 * Envoie le livre numérique au client
 */
export async function sendProductDeliveryEmail(customerEmail: string, productName: string, downloadUrl: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: 5px; color: #eeb149; text-transform: uppercase; margin-bottom: 10px; }
        .card { background-color: #0a0a0a; border: 1px solid #1a1a1a; padding: 40px; border-radius: 4px; }
        h1 { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 24px; color: #ffffff; line-height: 1.1; }
        p { font-size: 16px; color: #a1a1aa; margin-bottom: 24px; }
        .highlight { color: #ffffff; font-weight: bold; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 18px 36px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 2px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; }
        .footer-text { font-size: 11px; color: #52525b; text-transform: uppercase; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">KHEOPS SET</div>
        </div>
        <div class="card">
          <h1>ORDRE VALIDÉ.</h1>
          <p>Bâtisseur,</p>
          <p>Ton accès au protocole <span class="highlight">${productName}</span> a été déverrouillé avec succès.</p>
          <p>Tu peux maintenant télécharger ton matériel en cliquant sur le bouton ci-dessous :</p>
          
          <div class="button-container">
            <a href="${downloadUrl}" class="button">TÉLÉCHARGER L'OUTIL</a>
          </div>
          
          <p style="font-size: 13px; text-align: center;">Ce lien est sécurisé et restera actif pendant <span class="highlight">24 heures</span>.</p>
        </div>
        <div class="footer">
          <div class="footer-text">BÂTIR SON EMPIRE. SANS CONCESSION.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Livraison : ${productName}`,
    htmlContent,
  });
}

/**
 * Notifie l'admin d'une nouvelle vente
 */
export async function sendAdminNotification(customerEmail: string, productName: string, amount: number) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 18px; color: #000; font-weight: bold; }
        .success { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="margin-top: 0;">NOUVELLE VENTE ! 🚀</h2>
        <div class="stat">
          <div class="label">Produit</div>
          <div class="value">${productName}</div>
        </div>
        <div class="stat">
          <div class="label">Montant</div>
          <div class="value">${amount} FCFA</div>
        </div>
        <div class="stat">
          <div class="label">Client</div>
          <div class="value">${customerEmail}</div>
        </div>
        <p class="success">✓ Lien de téléchargement envoyé automatiquement.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: 'kheopset@gmail.com',
    subject: `NOUVELLE VENTE : ${productName} (${amount} FCFA)`,
    htmlContent,
  });
}

/**
 * Email Marketing : Relance H+1 (Le Rappel)
 */
export async function sendMarketingReminderH1(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', Arial, sans-serif; color: #e4e4e7; }
        .wrapper { background-color: #000000; padding: 40px 20px; }
        .main { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-top: 4px solid #eeb149; padding: 50px 40px; border-radius: 4px; }
        .header { font-size: 11px; font-weight: 900; letter-spacing: 6px; color: #eeb149; text-transform: uppercase; margin-bottom: 40px; text-align: center; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 48px; line-height: 1.1; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 30px 0; font-weight: normal; }
        p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #d4d4d8; }
        .highlight { color: #ffffff; font-weight: 700; border-bottom: 1px solid #eeb149; }
        .btn-box { margin-top: 40px; text-align: center; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 20px 40px; text-decoration: none; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 2px; }
        .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #1f1f22; text-align: center; font-size: 10px; color: #52525b; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">KHEOPS SET MOTIVATION</div>
          <h1>INTERRUPTION <span style="color: #eeb149;">DÉTECTÉE.</span></h1>
          <p>Bâtisseur,</p>
          <p>Le destin n'attend pas les indécis. Ton accès au protocole <span class="highlight">${productName}</span> est resté sur le seuil de la Forge.</p>
          <p>L'infrastructure est prête. Les outils sont affûtés. Il ne manque que ta validation pour lancer l'exécution.</p>
          <div class="btn-box">
            <a href="${checkoutUrl}" class="button">REPRENDRE L'ACCÈS</a>
          </div>
          <div class="footer">LE SUCCÈS EST UNE DISCIPLINE.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Interruption détectée : ${productName}`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h1'] : ['marketing_h1']
  });
}

export async function sendMarketingReminderH24(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', Arial, sans-serif; color: #e4e4e7; }
        .wrapper { padding: 40px 20px; }
        .main { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-left: 6px solid #eeb149; padding: 50px 40px; border-radius: 0 4px 4px 0; }
        .header { font-size: 11px; font-weight: 900; letter-spacing: 6px; color: #71717a; text-transform: uppercase; margin-bottom: 30px; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 42px; line-height: 1.1; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 30px 0; font-weight: normal; }
        p { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: #d4d4d8; }
        .quote { background-color: #18181b; border-left: 2px solid #eeb149; padding: 20px; font-style: italic; color: #a1a1aa; margin: 30px 0; font-size: 15px; }
        .button { background-color: #ffffff; color: #000000 !important; padding: 20px 40px; text-decoration: none; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; margin-top: 20px; border-radius: 2px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main">
          <div class="header">RAPPEL H+24</div>
          <h1>LE PRIX DE<br/><span style="color: #eeb149;">L'HÉSITATION.</span></h1>
          <p>Pendant que tu doutes, d'autres bâtissent.</p>
          <p>Le protocole <strong style="color: #ffffff;">${productName}</strong> n'est pas une option, c'est une nécessité pour ceux qui visent le sommet.</p>
          <div class="quote">
            "L'indécision est le voleur de l'opportunité. La stagnation est le salaire de la peur."
          </div>
          <p>Hier, tu as failli franchir le pas. Qu'est-ce qui t'a arrêté ? Le doute ? La complaisance ?</p>
          <a href="${checkoutUrl}" class="button">ÉCRASER LE DOUTE</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Le prix de l'hésitation...`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h24'] : ['marketing_h24']
  });
}

export async function sendMarketingReminderH72(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', Arial, sans-serif; }
        .wrapper { padding: 40px 20px; }
        .outer { max-width: 600px; margin: 0 auto; background-color: #eeb149; padding: 4px; border-radius: 4px; }
        .inner { background-color: #0a0a0a; padding: 60px 40px; text-align: center; border-radius: 2px; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 60px; line-height: 1; color: #eeb149; text-transform: uppercase; margin: 0 0 30px 0; letter-spacing: 1px; font-weight: normal; }
        p { font-size: 18px; color: #e4e4e7; line-height: 1.5; margin-bottom: 24px; font-weight: 600; text-transform: uppercase; }
        .subtext { font-size: 15px; color: #a1a1aa; text-transform: none; font-weight: normal; margin-bottom: 40px; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 22px 50px; text-decoration: none; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 3px; display: inline-block; border-radius: 2px; }
        .warning { color: #eeb149; font-size: 12px; margin-top: 40px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="outer">
          <div class="inner">
            <h1>DERNIER<br/>APPEL.</h1>
            <p>Ton accès prioritaire au ${productName} expire dans quelques heures.</p>
            <div class="subtext">Demain, le système réinitialisera ton lien sécurisé. Tu seras de retour à la case départ, avec ceux qui observent au lieu d'agir.</div>
            <a href="${checkoutUrl}" class="button">SÉCURISER L'ACCÈS</a>
            <div class="warning">C'EST MAINTENANT OU JAMAIS.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[FINAL] Ton accès au ${productName} expire.`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h72'] : ['marketing_h72']
  });
}

export async function sendMarketingAdminNotification(customerEmail: string, productName: string, reminderType: string) {
  const typeLabel = reminderType === 'h1' ? 'H+1 (Le Rappel)' : reminderType === 'h24' ? 'H+24 (La Preuve)' : 'H+72 (L\'Urgence)';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #0a0a0a; border: 1px solid #eeb149; padding: 40px; }
        h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #eeb149; margin-bottom: 20px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .item { margin-bottom: 15px; }
        .label { font-size: 10px; font-weight: bold; color: #3f3f46; text-transform: uppercase; letter-spacing: 2px; }
        .value { font-size: 14px; color: #ffffff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1>⚡ ACTIVITÉ MARKETING</h1>
          <div class="item">
            <div class="label">Action</div>
            <div class="value">Envoi d'un email de relance ${typeLabel}</div>
          </div>
          <div class="item">
            <div class="label">Produit</div>
            <div class="value">${productName}</div>
          </div>
          <div class="item">
            <div class="label">Cible</div>
            <div class="value">${customerEmail}</div>
          </div>
          <div style="margin-top: 30px; font-size: 11px; color: #27272a;">
            Système de récupération automatique KSM.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: 'ybaopportun@gmail.com', // Adresse de notification admin
    subject: `[KSM ADMIN] Relance ${reminderType.toUpperCase()} envoyée à ${customerEmail}`,
    htmlContent,
  });
}
