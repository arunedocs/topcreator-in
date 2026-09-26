import { ImageResponse } from "next/og";
import { toCreatorProfile } from "@/lib/creators";
import { APP_NAME } from "@/lib/constants";
import { getCategoryLabel } from "@/lib/utils";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await toCreatorProfile(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #18181b 0%, #09090b 55%, #1c1917 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, color: "#fbbf24", letterSpacing: 4 }}>{APP_NAME}</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 24 }}>
          #{profile?.currentRank ?? "—"}
        </div>
        <div style={{ fontSize: 48, fontWeight: 600, marginTop: 12 }}>
          {profile?.channelName ?? "Creator"}
        </div>
        <div style={{ fontSize: 28, color: "#a1a1aa", marginTop: 16 }}>
          {profile ? getCategoryLabel(profile.category).toUpperCase() : "CREATOR"} · ₹
          {profile?.currentBid.toLocaleString("en-IN") ?? "0"} BID
        </div>
        <div style={{ fontSize: 22, color: "#71717a", marginTop: 28 }}>🇮🇳 INDIA</div>
      </div>
    ),
    size
  );
}
