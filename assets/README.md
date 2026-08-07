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

Note on permission: the quote itself is published with written permission.
Reproducing force crests is a separate grant and both forces normally require
sign-off on how their identity is used by a supplier. Confirm that before the
artwork goes live.

## Images still hot-linked from Wix — action needed before cutover

14 `<img src>` attributes across index.html, about.html and team.html still
point at `static.wixstatic.com`. Those files live on Wix's CDN and are tied to
the Wix site. They will keep loading for as long as that subscription is
active, and break the moment it lapses — which is likely to be shortly after
the domain is pointed at this build.

Export each from the Wix media manager and commit it here, then update the
`src`. The distinct files are:

    team.html    chris-cheetham.jpg         → assets/team/chris-cheetham.jpg
    team.html    Andy_Edit.jpg              → assets/team/andy-murdy.jpg
    team.html    chris-chandler.jpg         → assets/team/chris-chandler.jpg
    index.html   Office Charge point.png
    index/about  ab875a_428de7a7c5e44d99bd007a6ed07ac839~mv2.png
    index/about  ab875a_7a8e370e904f4d66a77cef3ded16967d~mv2.jpg
    index/about  ab875a_c5add99e2cab4a578adf89ce38b0cc58~mv2.png
    about.html   ab875a_a4551da30aee4397b3152f0c792bf4fd~mv2.png

Every one of these already has an inline `onerror` fallback, so a broken URL
degrades to a placeholder rather than a missing-image icon — but that is a
safety net, not a fix.
