import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalNotes,
    archivedNotes,
    recentNotes,
    aiNotes,
    notesWithTags,
    weeklyNotes,
  ] = await Promise.all([
    prisma.note.count({ where: { userId, isArchived: false } }),
    prisma.note.count({ where: { userId, isArchived: true } }),
    prisma.note.findMany({
      where: { userId, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.note.count({ where: { userId, aiUsed: true } }),
    prisma.note.findMany({
      where: { userId },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.note.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  // Tags count karo
  const tagCount = {};
  notesWithTags.forEach((note) => {
    note.tags.forEach(({ tag }) => {
      tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const dailyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = weeklyNotes.filter(
      (n) => n.createdAt.toISOString().split("T")[0] === dateStr,
    ).length;
    dailyActivity.push({
      date: dateStr,
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      count,
    });
  }

  return NextResponse.json({
    totalNotes,
    archivedNotes,
    aiUsageCount: aiNotes,
    recentNotes,
    topTags,
    dailyActivity,
  });
}
