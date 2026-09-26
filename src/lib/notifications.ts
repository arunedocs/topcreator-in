import type { NotificationType } from "@prisma/client";
import { prisma } from "./prisma";

export interface NotificationPayload {
  creatorId: string;
  type: NotificationType;
  title: string;
  body: string;
  meta?: Record<string, string | number | boolean | null>;
}

export interface NotificationChannel {
  send(payload: NotificationPayload): Promise<void>;
}

export class InAppNotificationChannel implements NotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    await prisma.notification.create({
      data: {
        creatorId: payload.creatorId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        meta: payload.meta,
      },
    });
  }
}

/** Provider-ready stubs. Wire email/WhatsApp/SMS without changing callers. */
export class NoopExternalNotificationChannel implements NotificationChannel {
  async send(payload: NotificationPayload): Promise<void> {
    void payload;
  }
}

const inApp = new InAppNotificationChannel();
const external = new NoopExternalNotificationChannel();

export async function dispatchNotification(payload: NotificationPayload): Promise<void> {
  await Promise.all([inApp.send(payload), external.send(payload)]);
}
