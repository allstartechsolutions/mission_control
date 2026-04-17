import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const preferredAuthUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      const resolvedBaseUrl = preferredAuthUrl ?? baseUrl;
      const normalizedBaseUrl = new URL(baseUrl);
      const normalizedPreferredBaseUrl = preferredAuthUrl ? new URL(preferredAuthUrl) : null;
      const localhostBaseUrl = "http://localhost:3001";

      if (url.startsWith("/")) {
        return new URL(url, normalizedBaseUrl).toString();
      }

      if (url.startsWith(localhostBaseUrl) && normalizedPreferredBaseUrl) {
        return url.replace(localhostBaseUrl, normalizedPreferredBaseUrl.origin);
      }

      try {
        const targetUrl = new URL(url);

        if (
          targetUrl.origin === normalizedBaseUrl.origin ||
          (normalizedPreferredBaseUrl && targetUrl.origin === normalizedPreferredBaseUrl.origin)
        ) {
          return targetUrl.toString();
        }
      } catch {
        return resolvedBaseUrl;
      }

      return resolvedBaseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
