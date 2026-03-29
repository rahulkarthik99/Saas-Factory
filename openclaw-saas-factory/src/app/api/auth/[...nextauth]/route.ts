import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "mock-client-secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "mock-client-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "mock-client-secret",
    }),
    CredentialsProvider({
        name: "Email and Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          if (!credentials?.email || !credentials?.password) return null;
          // Simulated credential validation against Prisma
          const user = await prisma.user.findUnique({
              where: { email: credentials.email }
          });
          if (user) {
              return { id: user.id, email: user.email, name: user.name, plan: user.plan };
          }
          return null;
        }
      })
  ],
  callbacks: {
    async session({ session, user, token }: any) {
      if (session.user) {
        session.user.id = user?.id || token?.sub;
        session.user.plan = user?.plan || "FREE";
      }
      return session;
    },
  },
  session: { strategy: 'jwt' as const }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
