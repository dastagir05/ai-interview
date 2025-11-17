import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema/user";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // token.role = user.role || "user";
        // token.adminId = user.adminId;
        // token.permissions = user.permissions;
        // token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // session.user.role = token.role as string;
        // session.user.adminId = token.adminId as string;
        // session.user.permissions = token.permissions as string[];
        // session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        const existing = await db
          .select()
          .from(UserTable)
          .where(eq(UserTable.email, user.email!));

        if (existing.length === 0) {
          // Create new user
          const created = await db
            .insert(UserTable)
            .values({
              id: randomUUID(),
              name: user.name!,
              email: user.email!,
              imageUrl: user.image!,
            })
            .returning();

          user.id = created[0].id;
        } else {
          user.id = existing[0].id;
        }
      } catch (err) {
        console.error("CREATE USER ERROR:", err);
        return false;
      }

      return true;
    },
  },
};
