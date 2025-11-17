import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const user = await db.select().from(UserTable).where(eq(UserTable.id, id));

  if (!user.length)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user: user[0] });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const data = await req.json(); // { name?, imageUrl? }

  const updated = await db
    .update(UserTable)
    .set({
      name: data.name,
      imageUrl: data.imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(UserTable.id, id))
    .returning();

  return NextResponse.json({ user: updated[0] });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  await db.delete(UserTable).where(eq(UserTable.id, id));

  return NextResponse.json({ success: true });
}
