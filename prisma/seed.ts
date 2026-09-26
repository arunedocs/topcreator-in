import { Category, PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { getAvatarUrl } from "../src/lib/utils";
import { extractHandleFromUrl } from "../src/lib/youtube";
import { slugify } from "../src/lib/slug";
import { generateVerificationCode } from "../src/lib/youtube";

const prisma = new PrismaClient();

const seedData = [
  { channelName: "TechWala India", channelUrl: "https://youtube.com/@techwala", subscriberCount: 2_400_000, category: Category.TECH, bidAmount: 499 },
  { channelName: "CodeWithRaj", channelUrl: "https://youtube.com/@codewithraj", subscriberCount: 890_000, category: Category.TECH, bidAmount: 349 },
  { channelName: "GadgetGuru Hindi", channelUrl: "https://youtube.com/@gadgetguru", subscriberCount: 1_200_000, category: Category.TECH, bidAmount: 249 },
  { channelName: "Desi Gamer Pro", channelUrl: "https://youtube.com/@desigamer", subscriberCount: 3_100_000, category: Category.GAMING, bidAmount: 799 },
  { channelName: "Mumbai Streams", channelUrl: "https://youtube.com/@mumbaistreams", subscriberCount: 650_000, category: Category.GAMING, bidAmount: 399 },
  { channelName: "Daily Vlog India", channelUrl: "https://youtube.com/@dailyvlog", subscriberCount: 4_500_000, category: Category.VLOGS, bidAmount: 999 },
  { channelName: "Street Food Diaries", channelUrl: "https://youtube.com/@streetfood", subscriberCount: 1_800_000, category: Category.VLOGS, bidAmount: 549 },
  { channelName: "Hasi Factory", channelUrl: "https://youtube.com/@hasifactory", subscriberCount: 5_200_000, category: Category.COMEDY, bidAmount: 1299 },
  { channelName: "StandUp Desi", channelUrl: "https://youtube.com/@standupdesi", subscriberCount: 920_000, category: Category.COMEDY, bidAmount: 449 },
  { channelName: "Paisa Talks", channelUrl: "https://youtube.com/@paisatalks", subscriberCount: 1_600_000, category: Category.FINANCE, bidAmount: 699 },
  { channelName: "Invest Karo", channelUrl: "https://youtube.com/@investkaro", subscriberCount: 780_000, category: Category.FINANCE, bidAmount: 399 },
  { channelName: "Learn With Ananya", channelUrl: "https://youtube.com/@learnananya", subscriberCount: 540_000, category: Category.EDUCATION, bidAmount: 299 },
  { channelName: "AI Studio India", channelUrl: "https://youtube.com/@aistudioindia", subscriberCount: 410_000, category: Category.AI, bidAmount: 359 },
] as const;

async function main() {
  await prisma.notification.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.bidHistory.deleteMany();
  await prisma.rankingSnapshot.deleteMany();
  await prisma.clickEvent.deleteMany();
  await prisma.shareEvent.deleteMany();
  await prisma.profileView.deleteMany();
  await prisma.report.deleteMany();
  await prisma.creatorBadge.deleteMany();
  await prisma.creatorVerification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.creatorBid.deleteMany();
  await prisma.creator.deleteMany();

  for (const entry of seedData) {
    const handle = extractHandleFromUrl(entry.channelUrl);
    const avatarUrl = getAvatarUrl(entry.channelName, entry.channelUrl);
    const creator = await prisma.creator.create({
      data: {
        slug: slugify(handle),
        channelName: entry.channelName,
        channelUrl: entry.channelUrl,
        handle,
        avatarUrl,
        subscriberCount: entry.subscriberCount,
        category: entry.category,
        claimToken: randomBytes(16).toString("hex"),
        verificationCode: generateVerificationCode(),
        highestBid: entry.bidAmount,
      },
    });

    const bid = await prisma.creatorBid.create({
      data: {
        ...entry,
        avatarUrl,
        creatorId: creator.id,
        slug: creator.slug,
        handle,
      },
    });

    await prisma.bidHistory.create({
      data: {
        creatorId: creator.id,
        creatorBidId: bid.id,
        category: entry.category,
        amount: entry.bidAmount,
        rankAfter: 1,
      },
    });

    await prisma.activityEvent.create({
      data: {
        type: "JOINED",
        message: `🎉 @${handle} joined TopCreator`,
        creatorId: creator.id,
        category: entry.category,
        bidAmount: entry.bidAmount,
      },
    });
  }

  console.log(`Seeded ${seedData.length} creators, bids, history, and activity.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
