import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "./auth.config";

export const {
  auth,
  signIn,
  signOut,
  handlers,
} = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        const adminEmail =
          process.env.ADMIN_EMAIL?.trim() ?? "";

        const adminPasswordHashBase64 =
          process.env.ADMIN_PASSWORD_HASH_BASE64 ?? "";

        const adminPasswordHash =
          adminPasswordHashBase64
            ? Buffer.from(
                adminPasswordHashBase64,
                "base64"
              ).toString("utf8")
            : "";

        if (
          !email ||
          !password ||
          !adminEmail ||
          !adminPasswordHash
        ) {
          return null;
        }

        if (email !== adminEmail) {
          return null;
        }

        const passwordMatches =
          await bcrypt.compare(
            password,
            adminPasswordHash
          );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: "nexus-admin",
          name: "Nexus Admin",
          email: adminEmail,
        };
      },
    }),
  ],
});