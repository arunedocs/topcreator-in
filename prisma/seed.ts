import { Category, PrismaClient } from "@prisma/client";
import { getAvatarUrl } from "../src/lib/utils";

const prisma = new PrismaClient();

const seedData = [
  {
    channelName: "TechWala India",
    channelUrl: "https://youtube.com/@techwala",
    subscriberCount: 2_400_000,
    category: Category.TECH,
    bidAmount: 499,
  },
  {
    channelName: "CodeWithRaj",
    channelUrl: "https://youtube.com/@codewithraj",
    subscriberCount: 890_000,
    category: Category.TECH,
    bidAmount: 349,
  },
  {
    channelName: "GadgetGuru Hindi",
    channelUrl: "https://youtube.com/@gadgetguru",
    subscriberCount: 1_200_000,
    category: Category.TECH,
    bidAmount: 249,
  },
  {
    channelName: "Desi Gamer Pro",
    channelUrl: "https://youtube.com/@desigamer",
    subscriberCount: 3_100_000,
    category: Category.GAMING,
    bidAmount: 799,
  },
  {
    channelName: "Mumbai Streams",
    channelUrl: "https://youtube.com/@mumbaistreams",
    subscriberCount: 650_000,
    category: Category.GAMING,
    bidAmount: 399,
  },
  {
    channelName: "Daily Vlog India",
    channelUrl: "https://youtube.com/@dailyvlog",
    subscriberCount: 4_500_000,
    category: Category.VLOGS,
    bidAmount: 999,
  },
  {
    channelName: "Street Food Diaries",
    channelUrl: "https://youtube.com/@streetfood",
    subscriberCount: 1_800_000,
    category: Category.VLOGS,
    bidAmount: 549,
  },
  {
    channelName: "Hasi Factory",
    channelUrl: "https://youtube.com/@hasifactory",
    subscriberCount: 5_200_000,
    category: Category.COMEDY,
    bidAmount: 1299,
  },
  {
    channelName: "StandUp Desi",
    channelUrl: "https://youtube.com/@standupdesi",
    subscriberCount: 920_000,
    category: Category.COMEDY,
    bidAmount: 449,
  },
  {
    channelName: "Paisa Talks",
    channelUrl: "https://youtube.com/@paisatalks",
    subscriberCount: 1_600_000,
    category: Category.FINANCE,
    bidAmount: 699,
  },
  {
    channelName: "Invest Karo",
    channelUrl: "https://youtube.com/@investkaro",
    subscriberCount: 780_000,
    category: Category.FINANCE,
    bidAmount: 399,
  },
] as const;

async function main() {
  await prisma.creatorBid.deleteMany();

  await prisma.creatorBid.createMany({
    data: seedData.map((entry) => ({
      ...entry,
      avatarUrl: getAvatarUrl(entry.channelName, entry.channelUrl),
    })),
  });

  console.log(`Seeded ${seedData.length} creator bids.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
