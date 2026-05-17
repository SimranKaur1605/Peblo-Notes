import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
    include: { tags: { include: { tag: true } } },
  });

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tags } = await req.json();

  if (tags) {
    await prisma.noteTag.deleteMany({ where: { noteId: id } });
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      });
      await prisma.noteTag.create({ data: { noteId: id, tagId: tag.id } });
    }
  }

  const note = await prisma.note.update({
    where: { id, userId: session.user.id },
    data: { title, content },
    include: { tags: { include: { tag: true } } },
  });

  return NextResponse.json(note);
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.note.delete({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
