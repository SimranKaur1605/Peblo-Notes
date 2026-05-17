import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const shareId = randomUUID();
  await prisma.note.update({
    where: { id, userId: session.user.id },
    data: { isPublic: true, shareId },
  });

  const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${shareId}`;
  return NextResponse.json({ shareUrl });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.note.update({
    where: { id, userId: session.user.id },
    data: { isPublic: false, shareId: null },
  });

  return NextResponse.json({ success: true });
}
