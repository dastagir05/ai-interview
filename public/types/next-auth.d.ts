import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      imageUrl?: string | null;
      role?: string;
      adminId?: string;
      permissions?: string[];
      isAdmin?: boolean;
    };
  }

  interface User {
    id?: string;
    role?: string;
    adminId?: string;
    permissions?: string[];
    isAdmin?: boolean;
  }
}
