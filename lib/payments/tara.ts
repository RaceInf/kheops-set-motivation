import { OrderDetails, PaymentEvent, PaymentLinkResponse, PaymentProvider, WebhookValidationResult } from './provider';

// Vérifie une signature HMAC-SHA256 via Web Crypto API (compatible Edge Runtime).
// Tara envoie : HMAC-SHA256(rawBody, webhookSecret) en hex dans x-tara-signature.
async function verifyHmacSignature(signature: string, rawBody: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  // Convertit la signature hex reçue en Uint8Array
  const sigBytes = new Uint8Array(
    signature.replace(/^sha256=/, '').match(/.{1,2}/g)!.map(b => parseInt(b, 16))
  );
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(rawBody));
}

// Implémentation temporaire basée sur l'ancien endpoint DKLO.
// Ce fichier sera le seul à modifier lors du passage à la nouvelle API Tara.

export class TaraProvider implements PaymentProvider {
  private apiKey: string;
  private businessId: string;
  private webhookSecret: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.TARA_API_KEY || '';
    this.businessId = process.env.TARA_BUSINESS_ID || 'AU5F57fcg2';
    this.webhookSecret = process.env.TARA_WEBHOOK_SECRET || '';
    // Nouvel endpoint de production fourni par Tara Money
    this.apiUrl = 'https://www.dklo.co/api/tara/paymentlinks';
  }

  async createPaymentLink(order: OrderDetails): Promise<PaymentLinkResponse> {
    if (!this.apiKey || !this.businessId) {
      return { success: false, error: 'Tara API configuration missing' };
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';
      
      // Tara exige impérativement du HTTPS. 
      // Si on est en local, on utilise le domaine de prod comme fallback pour générer le lien.
      const taraBaseUrl = baseUrl.includes('localhost') 
        ? 'https://kheops-set-motivation.vercel.app' 
        : baseUrl.replace('http://', 'https://');

      // Fonction pour nettoyer les accents car l'API Tara semble avoir des soucis d'encodage (UTF-8 vs Latin-1)
      const cleanString = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      };

      // On passe l'orderId dans l'URL de retour/webhook pour faire le lien plus tard
      const payload = {
        apiKey: this.apiKey,
        businessId: this.businessId,
        productId: `${order.productId}-${order.orderId.substring(0, 8)}`,
        productName: cleanString(order.productName),
        productPrice: order.productPrice,
        productDescription: cleanString(order.productDescription),
        // Fallback si pas d'image ou si image en localhost
        productPictureUrl: order.productPictureUrl?.includes('localhost')
          ? order.productPictureUrl.replace(/http:\/\/localhost:\d+/, 'https://kheops-set-motivation.vercel.app')
          : (order.productPictureUrl?.startsWith('http') 
              ? order.productPictureUrl.replace('http://', 'https://')
              : `${taraBaseUrl}/logo.png`), 
        // On renvoie l'utilisateur vers une page de succès avec l'ID
        returnUrl: `${taraBaseUrl}/arsenal/success?order=${order.orderId}`,
        // Le webhook inclut l'orderId en query param
        webHookUrl: `${taraBaseUrl}/api/webhooks/tara?orderId=${order.orderId}`
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tara API Error:', errorText);
        return { success: false, error: `API HTTP Error: ${response.status}` };
      }

      const data = await response.json();

      if (data.status?.toLowerCase() === 'success' && data.generalLink) {
        return {
          success: true,
          paymentUrl: data.generalLink,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to generate payment link',
        };
      }
    } catch (error) {
      console.error('TaraProvider createPaymentLink exception:', error);
      return { success: false, error: 'Internal Server Error while communicating with Tara' };
    }
  }

  async verifyWebhookSignature(req: Request): Promise<WebhookValidationResult> {
    // Deux modes selon TARA_SIGNATURE_MODE :
    //   "hmac"   → Tara signe le body brut avec HMAC-SHA256 (standard industrie)
    //   "direct" → Tara envoie le secret brut dans le header (mode actuel, défaut)
    //
    // Passer à "hmac" dès que Tara publie la doc officielle HMAC.

    try {
      const rawBody = await req.text();
      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        return { isValid: false, payload: null, error: 'Invalid JSON payload' };
      }

      if (this.webhookSecret) {
        const signature = req.headers.get('x-tara-signature');
        if (!signature) {
          console.warn('[Webhook] Header x-tara-signature absent');
          return { isValid: false, payload: null, error: 'Missing webhook signature header' };
        }

        const mode = process.env.TARA_SIGNATURE_MODE || 'direct';

        if (mode === 'hmac') {
          // HMAC-SHA256 via Web Crypto API (compatible Edge Runtime)
          const isValid = await verifyHmacSignature(signature, rawBody, this.webhookSecret);
          if (!isValid) {
            console.warn('[Webhook] HMAC signature invalide');
            return { isValid: false, payload: null, error: 'Invalid HMAC webhook signature' };
          }
        } else {
          // Mode "direct" : Tara envoie le secret brut dans le header
          if (signature !== this.webhookSecret) {
            console.warn('[Webhook] Signature directe invalide');
            return { isValid: false, payload: null, error: 'Invalid webhook signature' };
          }
        }
      }

      return { isValid: true, payload };
    } catch (error) {
      return { isValid: false, payload: null, error: 'Invalid JSON payload' };
    }
  }

  parseWebhookPayload(payload: any): PaymentEvent {
    // TODO: Mapper exactement selon le payload webhook envoyé par Tara (nouvelle API).
    // Structure hypothétique basée sur les standards du marché.
    
    const taraStatus = payload.status?.toLowerCase();
    const status = taraStatus === 'paid' || taraStatus === 'success' 
      ? 'SUCCESS' 
      : taraStatus === 'failed' 
        ? 'FAILED' 
        : 'PENDING';

    return {
      providerReference: payload.transactionId || payload.id || 'unknown_ref',
      // Dans notre implémentation actuelle, on passe orderId dans l'URL de retour
      // Il faut l'extraire du payload s'il le renvoie (ex: metadata.orderId)
      orderId: payload.metadata?.orderId || payload.orderId || '',
      status: status,
      amount: payload.amount || 0,
      rawPayload: payload
    };
  }
}

export const taraProvider = new TaraProvider();
