// /app/api/auth/create-user/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../../drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { name, email, imageUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email missing" }, { status: 400 });
    }

    // Check existing user
    const existing = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    if (existing.length > 0) {
      return NextResponse.json({ user: existing[0] });
    }

    // Insert user
    const id = randomUUID();

    const user = await db
      .insert(UserTable)
      .values({
        id,
        name,
        email,
        imageUrl,
      })
      .returning();

    return NextResponse.json({ user: user[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
