import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Wisdom from Nahjul Balagha';
    const category = searchParams.get('category') || 'TheNahj';
    const text = searchParams.get('text') || 'Discover authentic teachings and spiritual reflections for modern life.';
    
    // Optional background URL from admin media
    const bgUrl = searchParams.get('bgUrl');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 100px',
            backgroundColor: '#111315', // Dark sleek background
            backgroundImage: bgUrl 
              ? `url(${bgUrl})` 
              : 'linear-gradient(135deg, #181a1f 0%, #111315 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for better text readability if a background image is used */}
          {bgUrl && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(17, 19, 21, 0.75)',
              }}
            />
          )}

          {/* Decorative Border */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '40px',
              bottom: '40px',
              border: '1px solid rgba(198, 161, 91, 0.3)', // Gold border
              borderRadius: '24px',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 10,
              gap: '24px',
            }}
          >
            <div
              style={{
                color: '#C6A15B', // Gold
                fontSize: 32,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              {category}
            </div>

            <div
              style={{
                color: '#F9F6F0',
                fontSize: title.length > 40 ? 56 : 72,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                color: '#A09D96',
                fontSize: 32,
                lineHeight: 1.5,
                marginTop: '16px',
                maxWidth: '850px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              "{text}"
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '40px',
              }}
            >
              {/* Fake a small logo or brand mark here */}
              <div
                style={{
                  color: '#C6A15B',
                  fontSize: 24,
                  borderTop: '2px solid rgba(198, 161, 91, 0.5)',
                  paddingTop: '16px',
                  letterSpacing: '0.1em',
                }}
              >
                TheNahj.live
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
