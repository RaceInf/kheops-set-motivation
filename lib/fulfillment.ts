/**
 * Logique de livraison produit (email + signed URL).
 * Utilisé par le webhook Tara et le cron de retry.
 */

import { supabase } from '@/lib/supabase';
import { tools } from '@/lib/data';

/**
 * Envoie l'email de livraison du produit et met à jour delivery_status sur l'order.
 * Retourne true si l'envoi a réussi.
 */
export async function deliverProductByEmail(orderId: string): Promise<boolean> {
  try {
    const { data: fullOrder } = await supabase
      .from('orders')
      .select('total_amount, customer_name, users (email), order_items (product_id)')
      .eq('id', orderId)
      .single();

    if (!fullOrder) {
      await supabase.from('orders')
        .update({ delivery_status: 'FAILED', delivery_error: 'Order data not found' })
        .eq('id', orderId);
      return false;
    }

    const customerEmail = (fullOrder.users as any)?.email;
    const customerName = (fullOrder as any)?.customer_name;
    const productId = (fullOrder.order_items as any)?.[0]?.product_id;
    const tool = tools.find(t => t.id === productId);

    if (!customerEmail || !tool?.filePath) {
      await supabase.from('orders')
        .update({ delivery_status: 'FAILED', delivery_error: 'Missing email or product file path' })
        .eq('id', orderId);
      return false;
    }

    // Signed URL valide 7 jours
    const { data: signedUrlData } = await supabase.storage
      .from('arsenal')
      .createSignedUrl(tool.filePath, 604800);

    if (!signedUrlData?.signedUrl) {
      await supabase.from('orders')
        .update({ delivery_status: 'FAILED', delivery_error: 'Failed to generate signed URL' })
        .eq('id', orderId);
      return false;
    }

    const { sendProductDeliveryEmail, sendAdminNotification } = await import('@/lib/email');
    const emailResult = await sendProductDeliveryEmail(customerEmail, tool.title, signedUrlData.signedUrl, customerName);

    if (!emailResult.success) {
      await supabase.from('orders')
        .update({ delivery_status: 'FAILED', delivery_error: 'Brevo send failed' })
        .eq('id', orderId);
      return false;
    }

    await supabase.from('orders').update({
      delivery_status: 'SENT',
      delivery_sent_at: new Date().toISOString(),
      delivery_error: null,
    }).eq('id', orderId);

    // Notification admin (non bloquante)
    sendAdminNotification(customerEmail, tool.title, fullOrder.total_amount).catch(() => null);

    return true;
  } catch (err: any) {
    console.error('[deliverProductByEmail] Exception:', err?.message);
    try {
      await supabase.from('orders')
        .update({ delivery_status: 'FAILED', delivery_error: err?.message ?? 'Unknown error' })
        .eq('id', orderId);
    } catch { /* best-effort */ }
    return false;
  }
}
