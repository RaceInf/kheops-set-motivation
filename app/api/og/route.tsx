import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title')?.slice(0, 80) || 'KHEOPS SET MOTIVATION';
    const type = searchParams.get('type') || 'ORDRE DU BÂTISSEUR';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#000000',
            padding: '80px',
            fontFamily: 'Inter, sans-serif',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Subtle Grid / Technical Lines in background */}
          <div style={{ position: 'absolute', top: '0px', left: '0px', right: '0px', bottom: '0px', border: '8px solid rgba(238, 177, 73, 0.4)', margin: '30px' }}></div>
          <div style={{ position: 'absolute', top: '150px', left: '30px', right: '30px', height: '1px', backgroundColor: 'rgba(238, 177, 73, 0.2)' }}></div>
          <div style={{ position: 'absolute', top: '30px', bottom: '30px', left: '150px', width: '1px', backgroundColor: 'rgba(238, 177, 73, 0.2)' }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', zIndex: 10, maxWidth: '900px', flex: 1, justifyContent: 'center', marginLeft: '100px' }}>
            <span style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '8px', color: '#eeb149', marginBottom: '30px', fontWeight: 'bold' }}>
              {type}
            </span>
            <h1 style={{ fontSize: 72, textTransform: 'uppercase', letterSpacing: '-2px', color: '#ffffff', lineHeight: 1.1, margin: 0, fontWeight: 900 }}>
              {title}
            </h1>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '40px', alignItems: 'center', zIndex: 10, paddingLeft: '100px' }}>
            <span style={{ fontSize: 28, letterSpacing: '6px', textTransform: 'uppercase', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>
              KHEOPSETMOTIVATION.COM
            </span>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#eeb149', transform: 'rotate(45deg)' }}></div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
