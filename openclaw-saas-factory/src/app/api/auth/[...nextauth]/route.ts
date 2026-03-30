import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/login', // Redirect default sign-in to our custom page
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
          params: { scope: "repo user" } // Specifically request repo access
      }
    }),
    CredentialsProvider({
        name: "Email and Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials, req) {
          if (!credentials?.email || !credentials?.password) {
              throw new Error("Invalid credentials");
          }

          const user = await prisma.user.findUnique({
              where: { email: credentials.email }
          });

          if (!user || !user.password) {
             throw new Error("User does not exist or invalid login method.");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
             throw new Error("Invalid password");
          }

          return { id: user.id, email: user.email, name: user.name, plan: user.plan };
        }
      })
  ],
  callbacks: {
    async jwt({ token, account }) {
        if (account && account.provider === 'github') {
            token.githubToken = account.access_token;

            // Save it securely to the DB if we have a user
            if (token.sub) {
                await prisma.user.update({
                    where: { id: token.sub },
                    data: { githubToken: account.access_token }
                });
            }
        }
        return token;
    },
    async session({ session, user, token }: any) {
      if (session.user) {
        session.user.id = user?.id || token?.sub;
        session.user.plan = user?.plan || "FREE";
        session.user.hasGithubToken = !!token?.githubToken;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
