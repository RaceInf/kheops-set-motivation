import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Basic but strict email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Format d\'email invalide' }, { status: 400 });
    }

    const API_KEY = process.env.BREVO_API_KEY;

    if (!API_KEY) {
      console.error('BREVO_API_KEY is not defined in environment variables');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    // Brevo API call to create a contact
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify({
        email: email,
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return NextResponse.json({ message: errorData.message || 'Subscription failed' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Successfully subscribed' }, { status: 201 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
