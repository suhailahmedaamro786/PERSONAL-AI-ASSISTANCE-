# Fix: Users can't log in on Vercel

Suhail AI login is failing on the deployed Vercel site. The auth **code** is correct
(email/password JWT, session persistence). A Vercel-only failure is almost always one of
three **Supabase dashboard** settings that restrict the production domain.

Do these in order. Each is a click or two in the Supabase dashboard
(https://supabase.com/dashboard → your project `ckvosasqbagppolvkcfm`).

---

## 1. Allow the Vercel domain on the publishable API key  (most likely fix)

Your client uses the Supabase **publishable** key (`sb_publishable_…`). Publishable keys are
restricted to a list of allowed domains — by default only `localhost` is allowed. If the
Vercel URL isn't on that list, **every** Supabase call returns an error on the live site.

1. **Project Settings → API → Publishable API keys** (or **Dashboard → Connect → API keys**).
2. Find the key `sb_publishable_…` (the one in your Vercel env / `.env`).
3. Open **Allowed domains** and **Add**:
   - `https://personal-ai-assistance-pearl.vercel.app`
   - `personal-ai-assistance-pearl.vercel.app` (no scheme, if the field wants a bare host)
4. **Save**. Redirects normally return you — wait ~30s and test again.

---

## 2. Set the Auth Site URL + Redirect URLs to the Vercel URL

Confirmation email links redirect back to the app. If the Vercel host isn't authorized, the
link lands on a blocked/unknown URL and the account never confirms → login says
"Email not confirmed".

1. **Authentication → URL Configuration → Site URL**: set to
   `https://personal-ai-assistance-pearl.vercel.app`
2. **Redirect URLs → Add URL**:
   - `https://personal-ai-assistance-pearl.vercel.app/auth/callback`
   - `https://personal-ai-assistance-pearl.vercel.app` (plain root, if allowed)
3. **Save**.

---

## 3. Configure an SMTP sender (so confirmation emails actually send)

Email confirmation emails won't be delivered unless a custom SMTP provider is set.

1. **Authentication → Settings → SMTP** — fill in your sender (Gmail app password / Resend /
   Postmark, etc.) or your domain's SMTP credentials.
2. **Save**.

If you'd rather skip email confirmation entirely (instant signup), also do:
- **Authentication → Provider → Email → toggle "Confirm email" OFF** and **Save**.

> The code already handles both modes: with confirmation ON it tells the user to check their
> email; with confirmation OFF it signs them in immediately. So this toggle is safe either way.

---

## 4. Confirm Vercel env vars are set

Your Vercel project needs the same Supabase vars the local `.env` has. In **Vercel → project →
Settings → Environment Variables**, make sure both exist (for Production):

- `VITE_SUPABASE_URL` = `https://ckvosasqbagppolvkcfm.supabase.com`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_…`

Then **Redeploy** (Deployments → ⋯ → Redeploy) so the new vars get baked into the build.

---

## Still failing?

- Open the browser DevTools **Network** tab, hit Sign In, and read the actual response
  (status + message). It usually names the exact problem (e.g. `api key not authorized for
  this host`, `email not confirmed`, `smtp`, `429`).
- Confirm the published Supabase key's allowed domains were actually saved.
- Paste the error message here and I'll chase it from there.