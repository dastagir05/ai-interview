import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await db.select().from(UserTable);
  return NextResponse.json({ users });
}
