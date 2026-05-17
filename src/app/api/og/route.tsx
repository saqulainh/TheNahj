import { ImageResponse } from "next/og";
import { getWisdomBySlug } from "@/lib/wisdom";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "og";

    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    const wisdom = await getWisdomBySlug(slug);

    if (!wisdom) {
      return new Response("Wisdom not found", { status: 404 });
    }

    const isStory = type === "story";
    const width = isStory ? 1080 : 1200;
    const height = isStory ? 1920 : 630;

    return new ImageResponse(
      (
        <div
          style={{
            background: "#050505",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: isStory ? "120px 80px" : "80px",
            color: "#F5F5F0",
            position: "relative",
          }}
        >
          {/* Background Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "linear-gradient(to bottom right, #1a1a1a, #050505)",
            }}
          />

          {/* Content Wrapper */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "60px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              borderRadius: "40px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                fontSize: isStory ? 48 : 32,
                color: "#D4AF37",
                textTransform: "uppercase",
                letterSpacing: "12px",
                marginBottom: "60px",
              }}
            >
              TheNahj
            </div>

            <p
              style={{
                fontSize: isStory ? 80 : 54,
                color: "#F5F5F0",
                lineHeight: 1.5,
                margin: 0,
                marginBottom: "60px",
                display: "flex",
              }}
            >
              "{wisdom.english_translation}"
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isStory ? 40 : 28,
                color: "rgba(212, 175, 55, 0.8)",
                marginTop: "auto",
              }}
            >
              <span>{wisdom.source}</span>
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
