# Safer Charging website — deployment & go-live guide

This is a **static website** (plain HTML/CSS/JS — no build step, no server, no
`package.json`). That makes it cheap and simple to host anywhere, including
**AWS Amplify Hosting**.

The repo includes `amplify.yml` at the root, so Amplify needs **zero configuration**
— it deploys the files as-is with no build step.

This guide covers:

1. Move the code into the Safer Charging repo (`SaferChargingLimited/website-`)
2. Deploy it on **AWS Amplify**
3. Point the live domain **safercharging.co.uk** (currently on Wix/Squarespace) at it
4. (Optional) Vercel, as an alternative/backup host

---

## 1. Move the code into `SaferChargingLimited/website-`

Run these from your own computer (you need Git installed and push access to the
SaferChargingLimited org). The source repo is public, so this copies everything —
**full history included**.

```bash
git clone https://github.com/mcox1001-sudo/safercharging-website.git website
cd website
git remote add safer https://github.com/SaferChargingLimited/website-.git
git push safer main
```

Notes:
- Create the `website-` repo on GitHub **empty** first (no README, no .gitignore,
  no licence). If it already has a commit, the push is rejected — either recreate it
  empty, or append `--force`: `git push safer main --force`.
- Double-check the repo name. Your URL has a trailing hyphen (`website-`); if that
  was a typo for `website`, use the correct one.

---

## 2. Deploy on AWS Amplify

1. Sign in to the **AWS Console** with the account that should own this (ideally a
   Safer Charging company AWS account, not a personal one) → search for **Amplify** →
   open **AWS Amplify**.
2. **Amplify Hosting → Create app → Host web app** (or "New app → Host web app" on
   older console versions).
3. Choose **GitHub** as the source, authorize AWS Amplify's GitHub App if prompted,
   and grant it access to the **SaferChargingLimited** organization (and specifically
   the `website-` repo, if GitHub asks you to scope it).
4. Select repository `SaferChargingLimited/website-` and branch `main`.
5. **Build settings**: Amplify will detect `amplify.yml` in the repo root
   automatically — you should see a build spec with empty build commands and
   `baseDirectory: /`. Leave it as detected. No environment variables are needed.
6. Click **Save and deploy**. The first deploy takes 1–2 minutes (there's nothing to
   compile — it's just uploading the files).
7. You'll get a live URL like `https://main.xxxxxxxxxx.amplifyapp.com`. Open it and
   click through a few pages to confirm everything looks right before touching the
   domain.

### ⚠️ Rewrites and redirects — required, not optional

**Do this before pointing the domain at Amplify.** Skipping it breaks the site's
entire search presence on day one.

The published URLs are extensionless — `/plans`, `/about`, `/risk-assessments`.
Every `<link rel="canonical">`, every `og:url` and all 20 entries in
`sitemap.xml` use that form, because it matches the URL structure the live Wix
site already uses. The files on disk are `plans.html`, `about.html` and so on.

Vercel bridges that gap silently through `"cleanUrls": true` in `vercel.json`.
**Amplify has no equivalent.** Without rules, every one of those published URLs
returns 404 — the navigation still works, because internal links use `.html`,
so the problem is invisible when you click around. What breaks is everything
Google sees: canonicals pointing at dead URLs, a sitemap of 404s, and dead link
previews on LinkedIn.

`amplify-redirects.json` in the repo root holds the full rule set. To apply it:

- Amplify app → **App settings → Rewrites and redirects** → **Open text editor**
- Paste the contents of `amplify-redirects.json`, then **Save**

The file contains three groups, and **order matters** — Amplify applies rules top
to bottom and stops at the first match:

1. **Legacy Wix URLs, 301.** `/about-us`, `/service-plan-packages`,
   `/commercial-ev-charging-risk-assessments`, `/arcane-charging-academy`,
   `/blog`, `/bookings` and `/inquiry-services-page` all change slug in this
   build. Without these, every ranking and inbound link built up on the Wix site
   lands on a 404 at cutover.

   Three of them — `/cpo-oem`, `/existing-infrastructure` and
   `/new-project-workflow` — have no equivalent page here and currently point at
   `/services`. **Confirm those with Chris**, or build the pages.

2. **Clean URLs, 200 rewrite.** One explicit rule per page rather than a regex.
   Verbose, but a regex that appends `.html` risks catching `/assets/logo.png`
   and there is no way to test that until it is live. If you add a page, add a
   line here too — `node check-redirects.mjs` (below) will fail the build if you
   forget.

3. **404.** Everything unmatched renders the branded `404.html` with a real 404
   status, so search engines drop it rather than indexing a soft 404.

### Smoke test the first Amplify deploy

The rules above are verified against this repo, but Amplify's rule engine itself
could not be tested from the machine that wrote them. Spend two minutes on the
`*.amplifyapp.com` URL before touching DNS:

| Check | Expect |
|---|---|
| `/plans` | the plans page, address bar still `/plans`, **200** |
| `/plans.html` | the same page (real file) |
| `/assets/sc-logo-horizontal.png` | the image, **not** a 404 |
| `/assets/video/hero-4817951.mp4` | the video streams |
| `/about-us` | **301** to `/about` |
| `/nonsense-page` | branded 404 page, **404** status |

If `/plans` 404s, the rule set was not saved or the order was changed. If assets
404, a rule is matching too broadly — check nothing was replaced with a regex.

### Every push auto-deploys
Once connected, any push to `main` on `SaferChargingLimited/website-` triggers a new
Amplify build+deploy automatically (usually live within a couple of minutes).

---

## 3. Point safercharging.co.uk at Amplify

The domain currently serves the Wix/Squarespace site. Going live = changing DNS so
the domain resolves to Amplify instead. **Do this only once you're happy with the
`amplifyapp.com` preview**, since it switches the live site over.

### Step 3a — Add the domain in Amplify
In your Amplify app → **App settings → Domain management → Add domain**:
- Enter `safercharging.co.uk`.
- Amplify will offer to manage both the root domain and `www` — accept the default
  (root redirects to `www`, or vice versa — either is fine, pick whichever you prefer
  as the canonical version).
- Choose **"I have my own DNS"** if the domain's nameservers are NOT AWS Route 53
  (they're currently on Wix/Squarespace, so this is almost certainly correct).

Amplify will generate the exact DNS records it needs — normally a `CNAME` for `www`
pointing at an Amplify-provided target, and either a `CNAME`/`ALIAS` or Amplify's
provided value for the root `@` record. **Use exactly what the Amplify console
shows you** — the values are unique per app and per AWS region.

### Step 3b — Find where the domain's DNS is managed
This is the part people get wrong. The DNS is controlled wherever the domain's
**nameservers** point — usually the same place the domain was bought:
- **Wix**: Wix Dashboard → your site → **Settings → Domains** → select the domain →
  **DNS Records** / "Advanced".
- **Squarespace**: Account → **Domains** → select the domain → **DNS Settings**
  (or **DNS → Custom Records**).
- **Somewhere else** (GoDaddy, 123-Reg, etc.): if Wix/Squarespace say the domain is
  "connected" but not "registered/managed" by them, the records live at the actual
  registrar. Log in there instead.

### Step 3c — Update the records
In the DNS manager for the domain, add/edit the records Amplify gave you in Step 3a
(typically a `CNAME` for `www` and a record for the root `@`). If Wix/Squarespace
shows the site as "connected" to their builder, you may also need to **disconnect**
it there first so their records stop overriding yours.

### Step 3d — ⚠️ Do NOT touch email
**Leave every `MX` record and any `TXT` records (SPF/DKIM/DMARC) exactly as they
are.** Those run Safer Charging's email. Only add/change the records Amplify asked
for. Touching MX will break email.

### Step 3e — Wait & verify
- DNS changes take anywhere from a few minutes to ~24–48 hours to propagate (usually
  under an hour).
- Amplify auto-issues a free SSL certificate once it verifies the records — the
  domain in Amplify's Domain management screen will flip from "Pending verification"
  to **"Available"**.
- Test `https://safercharging.co.uk` and `https://www.safercharging.co.uk` in an
  incognito window.

---

## Rollback

If anything looks wrong after the switch, set the DNS records back to the
Wix/Squarespace values (screenshot them **before** you change anything) and the old
site returns once DNS propagates.

## Updating the site later

Any push to the `main` branch of `SaferChargingLimited/website-` redeploys
automatically on Amplify. No manual steps, no build to run.

---

## 4. Alternative: Vercel (already live, works today)

This code is also already deployed and live on Vercel, in case you want a second
opinion or a stop-gap while Amplify is being set up:
`https://safercharging-website.vercel.app`

To run this same repo on Vercel instead of/alongside Amplify:
1. https://vercel.com → **Add New… → Project** → import `SaferChargingLimited/website-`.
2. Framework preset: **Other**. Leave build & output settings empty. **Deploy**.
3. **Settings → Domains** → add `safercharging.co.uk` + `www` → Vercel shows you an
   `A` record (`76.76.21.21`) for `@` and a `CNAME` (`cname.vercel-dns.com`) for `www`
   — set those at your DNS host, same MX/email warning as above applies.

Only point the domain at **one** host at a time (Amplify *or* Vercel) — pick
whichever your team prefers to manage long-term.
