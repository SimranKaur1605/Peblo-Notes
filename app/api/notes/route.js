import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content } = await req.json();

    const note = await prisma.note.create({
      data: {
        title: title || "Untitled Note",
        content: content || "",
        userId: session.user.id,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
