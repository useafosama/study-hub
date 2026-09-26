import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCleanSupabaseUrl, getCleanAnonKey } from "@/lib/supabase/utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname === "/offline.html" ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg"
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = getCleanSupabaseUrl();
  const supabaseAnonKey = getCleanAnonKey();

  // If running with placeholder keys in local preview, allow graceful fallback
  if (supabaseUrl.includes("placeholder")) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isRootPage = pathname === "/";

  // If user is not logged in
  if (!user) {
    if (!isLoginPage) {
      const redirectUrl = new URL("/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Fetch profile to verify role and active state
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  // If profile is disabled
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    const loginUrl = new URL("/login?error=account_disabled", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting login or root page
  if (isLoginPage || isRootPage) {
    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If student trying to access admin routes
  if (isAdminRoute && profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|icon.svg|icons).*)",
  ],
};
