"use server";

import { revalidatePath } from "next/cache";
import { getOwnedClaimTokens } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { getYouTubeVerificationProvider } from "@/lib/verification";
import { generateVerificationCode } from "@/lib/youtube";
import { track } from "@/lib/analytics";

export async function requestVerification(slug: string) {
  const creator = await prisma.creator.findUnique({ where: { slug } });
  if (!creator) return { error: "Creator not found." };

  const tokens = await getOwnedClaimTokens();
  if (!tokens.includes(creator.claimToken)) {
    return { error: "You can only verify a creator you own." };
  }

  const code = creator.verificationCode || generateVerificationCode();
  const provider = getYouTubeVerificationProvider();
  const auto = await provider.checkDescriptionContains(creator.channelUrl, code);

  await prisma.creator.update({
    where: { id: creator.id },
    data: {
      verificationCode: code,
      verificationSubmittedAt: new Date(),
    },
  });

  await prisma.creatorVerification.create({
    data: {
      creatorId: creator.id,
      code,
      status: auto === true ? "VERIFIED" : "PENDING",
      method: "DESCRIPTION_CODE",
    },
  });

  if (auto === true) {
    await prisma.creator.update({
      where: { id: creator.id },
      data: { verified: true },
    });
    await prisma.creatorBadge.upsert({
      where: { creatorId_type: { creatorId: creator.id, type: "VERIFIED" } },
      update: {},
      create: { creatorId: creator.id, type: "VERIFIED" },
    });
    track({ name: "creator_verified", properties: { slug } });
    revalidatePath(`/creator/${slug}`);
    return { success: true, verified: true, code };
  }

  revalidatePath(`/creator/${slug}`);
  return { success: true, verified: false, code };
}
