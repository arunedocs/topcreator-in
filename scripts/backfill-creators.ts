import { PrismaClient } from "@prisma/client";
import { findOrCreateCreator } from "../src/lib/creators";
import type { CategoryId } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const orphans = await prisma.creatorBid.findMany({
    where: { creatorId: null },
  });

  for (const bid of orphans) {
    const creator = await findOrCreateCreator({
      channelName: bid.channelName,
      channelUrl: bid.channelUrl,
      avatarUrl: bid.avatarUrl,
      subscriberCount: bid.subscriberCount,
      category: bid.category as CategoryId,
    });

    await prisma.creatorBid.update({
      where: { id: bid.id },
      data: {
        creatorId: creator.id,
        slug: creator.slug,
        handle: creator.handle,
      },
    });
  }

  console.log(`Backfilled ${orphans.length} creator listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
