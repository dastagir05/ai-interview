import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

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
        console.log("Initial JWT callback - user:", user);
        
        token.backendAccessToken = (user as any).backendAccessToken;
        token.backendRefreshTokenId = (user as any).backendRefreshTokenId;
        token.id = user.id;
        token.role = (user as any).role || "USER";
        token.permissions = (user as any).permissions || [];
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        console.log("Initial SESSION callback - token:", token);
        
        session.backendAccessToken = token.backendAccessToken as string;
        session.backendRefreshTokenId = token.backendRefreshTokenId as string;
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];

      }
      return session;
    },
    async signIn({ user, account }) {
      try {
        console.log("SIGN IN USER:", user, process.env.BACKEND_URL);
        const response = await fetch(`${process.env.BACKEND_URL}/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            profilePictureUrl: user.image,
            oauthId: account?.providerAccountId,
            oauthProvider: account?.provider,
          }),
        }).then((res) => res.json());
        if (!response.ok) {
          console.error("Backend verification failed");
          return false;
        }

        const data = await response.json();
        console.log("BACKEND RESPONSE:", data);

        // Store backend data in user object (will be passed to jwt callback)
        user.id = data.user.id;
        (user as any).role = data.user.role;
        (user as any).backendAccessToken = data.accessToken;
        (user as any).backendRefreshTokenId = data.refreshTokenId;
        (user as any).permissions = data.user.permissions || [];

      } catch (err) {
        console.error("CREATE USER ERROR:", err);
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};
