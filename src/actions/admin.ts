"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BadgeType } from "@prisma/client";
import { ADMIN_COOKIE } from "@/lib/constants";
import { createAdminToken, isAdminSession, verifyAdminPassword, writeAdminAudit } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  if (!(await isAdminSession())) {
    throw new Error("Unauthorized");
  }
}

export async function adminLogin(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  const token = createAdminToken();
  if (!token) redirect("/admin/login?error=1");

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function adminSetVerified(creatorId: string, verified: boolean) {
  await requireAdmin();
  await prisma.creator.update({
    where: { id: creatorId },
    data: { verified },
  });
  if (verified) {
    await prisma.creatorBadge.upsert({
      where: { creatorId_type: { creatorId, type: BadgeType.VERIFIED } },
      update: {},
      create: { creatorId, type: BadgeType.VERIFIED },
    });
  }
  await writeAdminAudit(verified ? "verify" : "unverify", creatorId);
  revalidatePath("/admin/creators");
}

export async function adminSetSuspended(creatorId: string, suspended: boolean) {
  await requireAdmin();
  await prisma.creator.update({
    where: { id: creatorId },
    data: { suspended },
  });
  await writeAdminAudit(suspended ? "suspend" : "unsuspend", creatorId);
  revalidatePath("/admin/creators");
}

export async function adminDeleteCreator(creatorId: string) {
  await requireAdmin();
  await prisma.creator.delete({ where: { id: creatorId } });
  await writeAdminAudit("delete_creator", creatorId);
  revalidatePath("/admin/creators");
}

export async function adminResolveReport(
  reportId: string,
  status: "RESOLVED" | "REJECTED" | "REVIEWING"
) {
  await requireAdmin();
  await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolvedAt: status === "REVIEWING" ? null : new Date(),
    },
  });
  await writeAdminAudit("resolve_report", reportId, status);
  revalidatePath("/admin/reports");
}
