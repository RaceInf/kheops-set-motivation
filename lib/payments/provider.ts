// lib/payments/provider.ts

export interface OrderDetails {
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  productDescription: string;
  productPictureUrl?: string;
  userEmail: string;
}

export interface PaymentLinkResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
  error?: string;
}

export interface WebhookValidationResult {
  isValid: boolean;
  payload: any;
  error?: string;
}

export interface PaymentEvent {
  providerReference: string; // ID de transaction côté provider
  orderId: string;           // Notre ID de commande (passé dans le metadata ou le return/webhook url)
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  rawPayload: any;
}

export interface PaymentProvider {
  /**
   * Génère un lien de paiement via l'API du prestataire.
   */
  createPaymentLink(order: OrderDetails): Promise<PaymentLinkResponse>;

  /**
   * Valide la signature cryptographique d'un webhook entrant.
   */
  verifyWebhookSignature(req: Request): Promise<WebhookValidationResult>;

  /**
   * Parse et standardise le payload du webhook pour le traitement interne.
   */
  parseWebhookPayload(payload: any): PaymentEvent;
}
