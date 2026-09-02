import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }) {
      const isLoggedIn = !!auth?.user;

      const isAdminRoute =
        nextUrl.pathname.startsWith("/admin");

      const isLoginPage =
        nextUrl.pathname === "/login";

      if (isAdminRoute) {
        return isLoggedIn;
      }

      if (
        isLoggedIn &&
        isLoginPage
      ) {
        return Response.redirect(
          new URL("/admin", nextUrl)
        );
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;