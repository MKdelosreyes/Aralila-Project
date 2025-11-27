import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const accessToken = url.searchParams.get('access_token')
  const refreshToken = url.searchParams.get('refresh_token')

  const supabase = await createClient()

  try {
    if (code) {
      // PKCE / email verification with ?code=...
      await supabase.auth.exchangeCodeForSession(code)
    } else if (accessToken && refreshToken) {
      // Magic link style callback ?access_token=...&refresh_token=...
      await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    }

    // Optional: sync Django user (triggers SupabaseAuthentication to upsert CustomUser)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token && process.env.NEXT_PUBLIC_BACKEND_URL) {
      // Adjust the path to your actual Django route (trailing slash if your urls.py requires it)
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {}) // best-effort; ignore failures for UX
    }

    return NextResponse.redirect(new URL('/student/dashboard', request.url))
  } catch {
    // Fall back to login with a message if anything goes wrong
    return NextResponse.redirect(new URL('/login?message=auth_error', request.url))
  }
}