import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { taraProvider } from '@/lib/payments/tara';
import { tools } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const { productId, userEmail } = await req.json();

    if (!productId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: productId and userEmail are required.' },
        { status: 400 }
      );
    }

    // 1. Validate Product
    const product = tools.find((t) => t.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Convert price string (e.g. "5 000 FCFA") to number for DB
    const numericPrice = parseInt(product.price.replace(/\D/g, ''), 10) || 0;

    // 2. Upsert User (Using service role key, this bypasses RLS)
    // In a real app with Auth, you'd get the user from the session.
    let userId: string;
    
    // First, try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ email: userEmail }])
        .select('id')
        .single();
        
      if (insertError || !newUser) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Database error creating user' }, { status: 500 });
      }
      userId = newUser.id;
    }

    // 3. Create Order in PENDING status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: userId, 
        total_amount: numericPrice,
        status: 'PENDING'
      }])
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Database error creating order' }, { status: 500 });
    }

    // 4. Add Order Items
    const { error: itemError } = await supabase
      .from('order_items')
      .insert([{
        order_id: order.id,
        product_id: productId,
        price: numericPrice
      }]);

    if (itemError) {
      console.error('Error creating order item:', itemError);
      // Non-blocking error, but good to log
    }

    // 5. Generate Payment Link via Provider
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const paymentResponse = await taraProvider.createPaymentLink({
      orderId: order.id,
      productId: product.id,
      productName: product.title,
      productPrice: numericPrice,
      productDescription: product.desc,
      productPictureUrl: `${baseUrl}${product.image}`,
      userEmail: userEmail
    });

    if (!paymentResponse.success || !paymentResponse.paymentUrl) {
      // Log the failed payment attempt
      await supabase.from('payments').insert([{
        order_id: order.id,
        provider: 'tara',
        status: 'FAILED',
        amount: numericPrice,
        error_message: paymentResponse.error || 'Failed to generate link'
      }]);

      return NextResponse.json(
        { error: 'Payment provider failed to generate link', details: paymentResponse.error },
        { status: 502 }
      );
    }

    // 6. Record the PENDING payment attempt
    const { error: paymentError } = await supabase.from('payments').insert([{
      order_id: order.id,
      provider: 'tara',
      status: 'PENDING',
      amount: numericPrice,
    }]);

    if (paymentError) {
      console.error('Error recording payment attempt:', paymentError);
    }

    // 7. Return the checkout URL to the client
    return NextResponse.json({ 
      success: true, 
      paymentUrl: paymentResponse.paymentUrl,
      orderId: order.id
    });

  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout process' },
      { status: 500 }
    );
  }
}
