"use server";

import { ReportReason } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { track } from "@/lib/analytics";
import { REPORT_REASONS } from "@/lib/constants";

export async function recordShare(slug: string, channel: string) {
  const creator = await prisma.creator.findUnique({ where: { slug } });
  if (!creator) return { error: "Creator not found." };

  await prisma.$transaction([
    prisma.shareEvent.create({ data: { creatorId: creator.id, channel } }),
    prisma.creator.update({
      where: { id: creator.id },
      data: { shareCount: { increment: 1 } },
    }),
  ]);

  track({ name: "profile_shared", properties: { slug, channel } });
  return { success: true };
}

export async function submitReport(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const reasonRaw = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").slice(0, 500);

  const reason = REPORT_REASONS.find((item) => item.id === reasonRaw)?.id;
  if (!reason) return { error: "Choose a valid reason." };

  const creator = await prisma.creator.findUnique({ where: { slug } });
  if (!creator) return { error: "Creator not found." };

  await prisma.report.create({
    data: {
      creatorId: creator.id,
      reason: reason as ReportReason,
      details,
    },
  });

  revalidatePath("/admin/reports");
  return { success: true };
}
