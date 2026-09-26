import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";
import { toCreatorProfile } from "@/lib/creators";
import { formatCurrency, getCategoryLabel } from "@/lib/utils";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await toCreatorProfile(slug);
  const rank = profile?.currentRank ? `#${profile.currentRank}` : "—";
  const category = profile ? getCategoryLabel(profile.category).toUpperCase() : "CREATOR";
  const bid = formatCurrency(profile?.currentBid ?? 0);
  const initials = (profile?.channelName ?? "TC").slice(0, 2).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#09090b",
          color: "white",
          padding: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 28,
            padding: "42px 56px",
          }}
        >
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", color: "#fbbf24", fontSize: 22, letterSpacing: 4 }}>
            <span>{APP_NAME.toUpperCase()}</span>
            <span style={{ color: "#a1a1aa" }}>INDIA</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 120, fontWeight: 600, lineHeight: 1, color: profile?.currentRank === 1 ? "#fbbf24" : "#fafafa" }}>
            {rank}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 22, letterSpacing: 6, color: "#71717a" }}>
            {category}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 28, gap: 18 }}>
            <div
              style={{
                display: "flex",
                width: 72,
                height: 72,
                borderRadius: 36,
                alignItems: "center",
                justifyContent: "center",
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.16)",
                fontSize: 26,
              }}
            >
              {initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 40, fontWeight: 600 }}>{profile?.channelName ?? "Creator"}</div>
              <div style={{ fontSize: 22, color: "#a1a1aa" }}>
                {profile?.handle ? `@${profile.handle}` : "Creator"}
                {profile?.verified ? " · Verified" : ""}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginLeft: "auto", alignItems: "flex-end" }}>
              <div style={{ fontSize: 16, letterSpacing: 4, color: "#71717a" }}>CURRENT BID</div>
              <div style={{ fontSize: 42, fontWeight: 600 }}>{bid}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
