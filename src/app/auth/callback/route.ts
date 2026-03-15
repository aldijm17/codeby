  import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as any,
    });
    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    if (user && !user.user_metadata?.username) {
      const emailUsername =
        user.email?.split("@")[0] ||
        `user_${Math.random().toString(36).substring(2, 7)}`;

      const displayName = user.user_metadata?.full_name || emailUsername;
      const avatarUrl = user.user_metadata?.avatar_url || "";

      await supabase.auth.updateUser({
        data: {
          username: emailUsername,
          display_name: displayName,
        },
      });

      const { error: upsertError1 } = await supabase.from("profiles").upsert({
        id: user.id,
        username: emailUsername,
        display_name: displayName,
        avatar_url: avatarUrl,
        role: "user",
        is_approved: true,
        email: user.email,
      });
      if (upsertError1) console.error("Error creating profile:", upsertError1);
    } else if (user) {
      const { error: upsertError2 } = await supabase.from("profiles").upsert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0],
        display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split("@")[0],
        avatar_url: user.user_metadata?.avatar_url || "",
        email: user.email,
      });
      if (upsertError2) console.error("Error updating profile:", upsertError2);
    }

  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
