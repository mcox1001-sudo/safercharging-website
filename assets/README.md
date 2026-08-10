# Media assets

## inspection-evcicr.mp4
Drop the licensed "EV inspection in the service garage" video here as
`inspection-evcicr.mp4` (H.264 MP4, ideally 1920×1080).

The EVCICR inspection article (`article-evcicr-ev-charging-inspection.html`)
already references `assets/inspection-evcicr.mp4` as its first video source.
As soon as this file exists in the repo it will play automatically; until then
the page falls back to a free Pexels clip. iStock/Getty URLs cannot be
hot-linked directly — the file must be licensed and committed here.

## kent-police-logo.png / essex-police-logo.png

Force crests for the Kent and Essex Police client reference, shown on the
homepage (section 05) and the About page case-studies section.

Drop the two files in here at those exact names. Requirements:

- PNG with a transparent background, roughly 300px on the long edge.
- Full-colour artwork. Each crest sits on a white plate, so light or
  transparent-background versions are correct; do not supply the white-out
  reversed versions.

Until the files exist, each slot falls back to an outlined "KENT POLICE" /
"ESSEX POLICE" wordmark, so the block still reads as finished. No layout
change is needed when the artwork lands.

**Source the artwork from the forces, not from the web.** Both Kent and Essex
Police license their crest through a formal IP licence, and the approved
artwork is issued with the licence. Crest files found on logo aggregator sites
are frequently redraws or superseded versions, and using one would misrepresent
a force's identity on a commercial site even where permission has been granted.
Ask the force contact for the crest as supplied under the licence.

## Wix media — migrated, no longer a cutover blocker

All 26 `static.wixstatic.com` references (14 `<img src>`, 7 `og:image` meta
tags and 5 JSON-LD `image` properties, across 9 pages) have been repointed at
files committed in this repo. Nothing on the site now depends on the Wix
subscription staying active.

The committed files, and the Wix media ids they came from:

    assets/team/chris-cheetham.jpg          ab875a_2e9adb4a75e1414b997f005c4dbee987
    assets/team/andy-murdy.jpg              ab875a_9fbd2c46bfa646d2b5b264cb10ac5e16
    assets/team/chris-chandler.jpg          ab875a_b3ce2648eea244e1b6865cea0ccf87b4
    assets/services/office-charge-point.jpg ab875a_040ff05e29df4e23ad017ac9f48b28fa
    assets/accreditations/safecontractor.png ab875a_428de7a7c5e44d99bd007a6ed07ac839
    assets/accreditations/ssip.jpg          ab875a_7a8e370e904f4d66a77cef3ded16967d
    assets/accreditations/gbea-finalist.png ab875a_c5add99e2cab4a578adf89ce38b0cc58
    assets/chargesafe-wordmark-reversed.png ab875a_a4551da30aee4397b3152f0c792bf4fd
    assets/og/engineers-1200x630.jpg        ab875a_c82701258f0e40aeaabf05b0de4dfb68
    assets/og/engineers-1600x900.jpg        ab875a_c82701258f0e40aeaabf05b0de4dfb68

Photos reproduce the crop Wix was serving (cover, centre-aligned) at roughly
1.5x the displayed size so they stay sharp on retina screens. The two social
card sizes match the two transforms that were in use. Total added weight is
about 900KB for all ten files.

The inline `onerror` fallbacks were left in place throughout.

## Still missing

**ChargeSafe logo for light backgrounds.** The repo holds two versions, both
built for dark backgrounds: `chargesafe-logo.png` (navy plate) and
`chargesafe-logo-transparent.png` (white text, thin dark outline).
`chargesafe-wordmark-reversed.png`, pulled from Wix and used in the About page
brand section, is a pure white-out — on a light background the shield and the
word "Charge" disappear entirely and only "Safe" reads. The whole live Wix
site was searched and no light-background version exists anywhere on it. It
needs to come from the original brand artwork.

**Charging Network / Arcane Charging Network logo.** Not present in this repo
and not present anywhere on the live Wix site either. The only Arcane mark
that exists is the Arcane Charging *Academy* logo, already committed as
`arcane-academy-logo.png`. The Network is a different brand and its logo has
never been published.

**Great British Entrepreneur Awards 2026 badge.** The committed badge reads
"Finalist 2025" only. Alt text across the site claims finalist status for both
2025 and 2026, which has been confirmed as correct, so the 2026 artwork is
still needed to match the claim.
