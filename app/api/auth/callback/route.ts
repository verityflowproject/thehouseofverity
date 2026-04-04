/**
 * app/api/auth/callback/route.ts — Supabase OAuth code exchange
 *
 * Supabase Auth redirects here after Google OAuth (or any OAuth provider).
 * We exchange the one-time code for a session, then redirect the user to
 * their destination (default: /dashboard).
 *
 * After exchanging the code we also ensure a vf_users profile row exists
 * for the authenticated user. The DB trigger (trg_provision_vf_user) handles
 * this automatically, but we provision here as a reliable fallback in case
 * the trigger has not been deployed or silently failed.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { table } from '@/lib/db/supabase-server'
import { SIGNUP_FREE_CREDITS } from '@/lib/credit-costs'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate next is a relative path to prevent open-redirect attacks
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure a vf_users profile exists for this user. The DB trigger should
      // handle this, but we provision here as a fallback so authentication is
      // never broken by a missing trigger or a transient DB error.
      try {
        const { data: { user } } = await supabase.auth.getUser()
        // #region agent log
        fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdd754'},body:JSON.stringify({sessionId:'fdd754',location:'callback/route.ts:getUser',message:'Auth user resolved',data:{userId:user?.id,email:user?.email,hasUser:!!user},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        if (user) {
          const { data: existing } = await table('vf_users')
            .select('id')
            .eq('auth_user_id', user.id)
            .maybeSingle()

          // #region agent log
          fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdd754'},body:JSON.stringify({sessionId:'fdd754',location:'callback/route.ts:profileCheck',message:'Profile existence check',data:{existingProfileId:existing?.id,profileExists:!!existing},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
          // #endregion

          if (!existing) {
            const now = new Date().toISOString()
            const cycleStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
            const cycleEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()

            // Use table() helper (returns any) to avoid Supabase untyped-schema TS error
            const { data: newProfile, error: insertError } = await table('vf_users')
              .insert({
                auth_user_id:           user.id,
                email:                  (user.email ?? '').toLowerCase(),
                name:                   user.user_metadata?.full_name ?? null,
                image:                  user.user_metadata?.avatar_url ?? null,
                plan:                   'free',
                credits:                SIGNUP_FREE_CREDITS,
                daily_credits_used:     0,
                daily_credits_reset_at: now,
                model_calls_used:       0,
                model_calls_limit:      50,
                billing_cycle_start:    cycleStart,
                billing_cycle_end:      cycleEnd,
                email_verified:         user.email_confirmed_at != null,
                provider:               user.app_metadata?.provider ?? null,
                project_ids:            [],
                created_at:             now,
                updated_at:             now,
              })
              .select('id')
              .single()

            // #region agent log
            fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdd754'},body:JSON.stringify({sessionId:'fdd754',location:'callback/route.ts:insertProfile',message:'vf_users insert result',data:{newProfileId:newProfile?.id,insertError:insertError?.message??null},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
            // #endregion

            if (insertError) {
              console.error('[Auth Callback] Failed to provision vf_users:', insertError)
            } else if (newProfile) {
              // Record the signup credit grant
              const { error: txError } = await table('vf_credit_transactions')
                .insert({
                  user_id:       newProfile.id,
                  type:          'signup_grant',
                  amount:        SIGNUP_FREE_CREDITS,
                  balance_after: SIGNUP_FREE_CREDITS,
                  description:   `Welcome bonus — ${SIGNUP_FREE_CREDITS} free credits to get started`,
                  created_at:    now,
                  updated_at:    now,
                })
              // #region agent log
              fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdd754'},body:JSON.stringify({sessionId:'fdd754',location:'callback/route.ts:creditTx',message:'Signup credit grant result',data:{txError:txError?.message??null,credits:SIGNUP_FREE_CREDITS},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
              // #endregion
            }
          }
        }
      } catch (provisionError) {
        // Do not block the redirect if provisioning fails — the user still has
        // a valid Supabase session and the dashboard will surface any issue.
        console.error('[Auth Callback] Profile provisioning error:', provisionError)
        // #region agent log
        fetch('http://127.0.0.1:7821/ingest/a44fed3a-03ca-4e9d-ba79-bbb326c6d144',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fdd754'},body:JSON.stringify({sessionId:'fdd754',location:'callback/route.ts:catch',message:'Provisioning caught exception',data:{error:String(provisionError)},hypothesisId:'C',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }

      return NextResponse.redirect(`${origin}${safeNext}`)
    }

    console.error('[Auth Callback] Code exchange error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
