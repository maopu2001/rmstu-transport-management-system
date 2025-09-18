import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (
          pathname.startsWith("/auth") ||
          pathname === "/" ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Protected routes require authentication
        if (!token) return false;

        // Check if user is active (allow access only for active users)
        if (token.status !== "ACTIVE") return false;

        // Role-based access control
        if (pathname.startsWith("/admin") && token.role !== "ADMIN")
          return false;

        if (pathname.startsWith("/driver") && token.role !== "DRIVER")
          return false;

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|details).*)"],
};
