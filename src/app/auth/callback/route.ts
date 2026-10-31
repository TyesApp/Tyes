import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      const role = profile?.role || "client"
      const isAdmin = ["admin", "superAdmin", "super_admin"].includes(role)
      // Country can live on the profile row or in the auth user metadata
      // (complete-profile and email sign-up both write it to user_metadata).
      const hasCountry = Boolean(profile?.country || user.user_metadata?.country)

      if (!hasCountry && !isAdmin) {
        // Missing required profile info (like for new Google Auth signups)
        return NextResponse.redirect(`${requestUrl.origin}/auth/complete-profile`)
      }
      return NextResponse.redirect(`${requestUrl.origin}${isAdmin ? '/dashboard/admin' : '/dashboard/client'}`)
    }
  }

  // Fallback if no code or user
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
