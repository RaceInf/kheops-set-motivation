import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { tools } from '@/lib/data';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = {
  title: 'Paiement Réussi',
  robots: 'noindex, nofollow',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ order: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { order: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  // Fetch order from Supabase
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('Error fetching order:', error);
    notFound();
  }

  const productId = order.order_items?.[0]?.product_id;
  const tool = tools.find((t) => t.id === productId);
  const productName = tool?.title || 'Outil Digital';

  let downloadUrl = null;

  if (order.status === 'PAID' && tool?.filePath) {
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('arsenal')
      .createSignedUrl(tool.filePath, 86400); // 24h

    if (signedUrlError) {
      console.error('Error generating signed URL:', signedUrlError);
    } else {
      downloadUrl = signedUrlData.signedUrl;
    }
  }

  return (
    <SuccessClient 
      status={order.status} 
      orderId={orderId} 
      amount={order.total_amount} 
      productName={productName}
      downloadUrl={downloadUrl}
    />
  );
}
