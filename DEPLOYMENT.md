# Safer Charging website — deployment & go-live guide

This is a **static website** (plain HTML/CSS/JS — no build step, no server). That
makes it cheap and simple to host. It currently lives at
`https://safercharging-website.vercel.app` and is deployed automatically by Vercel.

This guide covers three things:

1. Move the code into the Safer Charging repo (`SaferChargingLimited/website-`)
2. Deploy it on Vercel from that repo
3. Point the live domain **safercharging.co.uk** (currently on Wix/Squarespace) at it

---

## 1. Move the code into `SaferChargingLimited/website-`

Run these from your own computer (you need Git installed and access to the
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

## 2. Deploy on Vercel (free, recommended)

Vercel hosts static sites for free and redeploys automatically on every push.

1. Go to https://vercel.com and sign in (use the account that should own the site —
   ideally a Safer Charging Google/GitHub login, not a personal one).
2. **Add New… → Project**.
3. **Import** the `SaferChargingLimited/website-` repo. (You may need to click
   "Adjust GitHub App Permissions" and grant Vercel access to the SaferChargingLimited
   org.)
4. Framework preset: **Other** (it's a static site). Leave build & output settings
   empty. Click **Deploy**.
5. After ~30 seconds you'll get a live `*.vercel.app` URL. Confirm the site looks
   right there before touching the domain.

> Alternative host: this site also runs as-is on Netlify, Cloudflare Pages, or GitHub
> Pages. Vercel is what it's already set up for, so it's the least effort.

---

## 3. Point safercharging.co.uk at the new site

The domain currently serves the Wix/Squarespace site. Going live = changing two DNS
records so the domain resolves to Vercel instead. **Do this only when you're happy
with the Vercel preview**, as it switches the live site over.

### Step 3a — Add the domain in Vercel
In your Vercel project: **Settings → Domains → Add** and enter:
- `safercharging.co.uk`
- `www.safercharging.co.uk`

Vercel will show you the exact DNS records it needs. They are normally:

| Type  | Name / Host | Value                     |
|-------|-------------|---------------------------|
| A     | `@`         | `76.76.21.21`             |
| CNAME | `www`       | `cname.vercel-dns.com`    |

**Use whatever Vercel's Domains screen shows** — treat the table above as the typical
values, but Vercel's dashboard is the source of truth.

### Step 3b — Find where the domain's DNS is managed
This is the part people get wrong. The DNS is controlled wherever the domain's
**nameservers** point — that's usually the same place the domain was bought:
- **Wix**: Wix Dashboard → your site → **Settings → Domains** → select the domain →
  **DNS Records** / "Advanced".
- **Squarespace**: Account → **Domains** → select the domain → **DNS Settings**
  (or **DNS → Custom Records**).
- **Somewhere else** (GoDaddy, 123-Reg, etc.): if Wix/Squarespace say the domain is
  "connected" but not "registered/managed" by them, the records live at the actual
  registrar. Log in there instead.

### Step 3c — Update the records
In the DNS manager for the domain:
1. Find the existing **A record** for `@` (the root) that points at Wix/Squarespace —
   **edit it** to `76.76.21.21` (or delete and re-add).
2. Find the existing **CNAME** for `www` — point it to `cname.vercel-dns.com`.
3. If Wix/Squarespace shows the site as "connected" to their builder, you may also need
   to **disconnect** it from their site so their records stop overriding yours.

### Step 3d — ⚠️ Do NOT touch email
**Leave every `MX` record and any `TXT` records (SPF/DKIM/DMARC) exactly as they are.**
Those run Safer Charging's email. Only change the `A` (@) and `CNAME` (www) records
above. Touching MX will break email.

### Step 3e — Wait & verify
- DNS changes take anywhere from a few minutes to ~24–48 hours to propagate (usually
  under an hour).
- Vercel auto-issues a free SSL certificate once it sees the records — the domain in
  Vercel's Domains list will flip to a green "Valid Configuration".
- Test `https://safercharging.co.uk` and `https://www.safercharging.co.uk` in an
  incognito window.

---

## Rollback

If anything looks wrong after the switch, set the `A`/`CNAME` records back to the
Wix/Squarespace values (screenshot them **before** you change anything) and the old
site returns once DNS propagates.

## Updating the site later

Any push to the `main` branch of `SaferChargingLimited/website-` redeploys production
automatically. No manual steps.
