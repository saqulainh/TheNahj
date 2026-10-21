import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const DEFAULT_BACKGROUND =
  'linear-gradient(135deg, #181a1f 0%, #111315 100%)';

function truncateAtWord(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const characters = Array.from(normalized);

  if (characters.length <= maxLength) {
    return normalized;
  }

  const slice = characters.slice(0, maxLength - 1).join('');
  const lastSpace = slice.lastIndexOf(' ');
  const end =
    lastSpace > maxLength * 0.65 ? slice.slice(0, lastSpace) : slice;

  return `${end.trimEnd()}…`;
}

function getAllowedBackgroundUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const isAllowedHost =
      url.hostname === 'supabase.co' ||
      url.hostname.endsWith('.supabase.co') ||
      url.hostname === 'images.unsplash.com';

    if (
      url.protocol !== 'https:' ||
      !isAllowedHost ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const safeTitle = truncateAtWord(
      searchParams.get('title') || 'Wisdom from Nahjul Balagha',
      90,
    );
    const safeCategory = truncateAtWord(searchParams.get('category') || 'TheNahj', 40);
    const safeText = truncateAtWord(
      searchParams.get('text') ||
        'Discover authentic teachings and spiritual reflections for modern life.',
      220,
    );
    const bgUrl = getAllowedBackgroundUrl(searchParams.get('bgUrl'));

    const titleFontSize =
      safeTitle.length > 60 ? 42 : safeTitle.length > 36 ? 50 : 60;
    const textFontSize =
      safeText.length > 160 ? 24 : safeText.length > 100 ? 27 : 30;

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
            padding: '64px 88px',
            backgroundColor: '#111315',
            backgroundImage: bgUrl ? `url(${bgUrl})` : DEFAULT_BACKGROUND,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
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

          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              right: '40px',
              bottom: '40px',
              border: '1px solid rgba(198, 161, 91, 0.3)',
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
              gap: '16px',
            }}
          >
            <div
              style={{
                color: '#C6A15B', // Gold
                fontSize: 24,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                maxWidth: '900px',
                overflow: 'hidden',
              }}
            >
              {safeCategory}
            </div>

            <div
              style={{
                color: '#F9F6F0',
                fontSize: titleFontSize,
                fontWeight: 700,
                lineHeight: 1.15,
                maxWidth: '900px',
                maxHeight: '140px',
                overflow: 'hidden',
              }}
            >
              {safeTitle}
            </div>

            <div
              style={{
                color: '#A09D96',
                fontSize: textFontSize,
                lineHeight: 1.35,
                maxWidth: '850px',
                maxHeight: '126px',
                overflow: 'hidden',
              }}
            >
              “{safeText}”
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  color: '#C6A15B',
                  fontSize: 24,
                  borderTop: '2px solid rgba(198, 161, 91, 0.5)',
                  paddingTop: '12px',
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
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
      },
    );
  } catch (error) {
    console.error('Failed to generate OG image', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
