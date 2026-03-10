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
    // Gunakan any untuk menghindari konflik tipe di Next.js 16 dengan library versi lama
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore as any,
    });
    // Tukar auth code menjadi session (login user)
    const {
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code);

    // Jika user baru (Google) belum punya username, buatkan otomatis dari email
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

      // Sinkronisasi ke tabel public.profiles
      await supabase.from("profiles").upsert({
        id: user.id,
        username: emailUsername,
        display_name: displayName,
        avatar_url: avatarUrl,
      });
    } else if (user) {
      // Pastikan data profil sinkron jika sudah ada username
      await supabase.from("profiles").upsert({
        id: user.id,
        username: user.user_metadata.username,
        display_name: user.user_metadata.display_name,
        avatar_url: user.user_metadata.avatar_url,
      });
    }
  }

  // Redirect user ke halaman tujuan (misal: /update-password)
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
