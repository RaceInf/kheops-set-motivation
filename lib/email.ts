/**
 * Utilitaire d'envoi d'emails via l'API Brevo (Sendinblue)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
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
