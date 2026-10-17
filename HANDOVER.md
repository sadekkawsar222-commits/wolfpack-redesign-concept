# WolfPack Advising redesign: client handover checklist

This walks through the "15 things to fix before you hand a vibe-coded website to a client" list, one item at a time. **Done** means it's handled in the code. **Client / agency action** means a person has to do it with their own accounts; code can't do it.

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Domain in their name | Client / agency action | The preview runs on a `*.vercel.app` / `github.io` address. Point WolfPack's own domain, registered in WolfPack's name, at the final host. |
| 2 | Transfer the repo | Ready | The repo is self-contained. Transfer it with GitHub → Settings → Transfer ownership → WolfPack's org. |
| 3 | Hosting on their card | Client / agency action | Re-import the transferred repo into **WolfPack's own** Vercel account (vercel.com/new). No build step is needed. |
| 4 | Payments to their account | N/A in code | The site takes no payments. The form isn't connected to anything (see #8). |
| 5 | Owner logins | Client / agency action | GitHub, Vercel and the domain registrar should all be owned by a WolfPack email, with the agency added as a collaborator. |
| 6 | Remove your email | **Done** | Scanned every file: no personal or agency emails, names or contact details. The only phone and address are WolfPack's public ones. |
| 7 | Rotate every key | **Done (none exist)** | No API keys, tokens or secrets anywhere. It's a static site and every library loads from a public CDN. |
| 8 | Document env vars | **Done (none needed)** | Zero env vars. To make the Get Started form live, point it at WolfPack's existing form/CRM endpoint (HubSpot or ActiveCampaign); see "Editing content" below. |
| 9 | Hand over analytics | Client action | No tracking is installed in the preview. Paste WolfPack's own GA4 / WhatConverts snippet before `</head>` on each page. |
| 10 | Their business email | Client action | Use a WolfPack address for every account in #5. |
| 11 | How to edit content | **Done** | See "Editing content" below. |
| 12 | Walkthrough video | To do | Record a 3–5 minute screen recording of the site and the edit steps below once the content is final. |
| 13 | Legal pages | **Done (linked)** | The footer links to WolfPack's existing Privacy Policy, Terms of Use and Disclaimer. The concept notice and `noindex` tag must be removed when this goes live as the real site. |
| 14 | Who fixes bugs | Agreement needed | Agree a support window in writing, e.g. 30 days of bug fixes, then a retainer. |
| 15 | Get paid first | Agency action | Collect the final payment before transferring the repo and domain. |

## Editing content
- **Text**: every page is plain HTML. Open the page (`index.html`, `services.html`, …) and edit the words between the tags.
- **Header, footer and closing call-to-action** on the inner pages live in one place: `assets/js/layout.js`. The homepage has its own copy in `index.html`.
- **Team carousel** (homepage): the `window.WP_TEAM` list near the bottom of `index.html`. **Team grid** (About): the `team` list near the bottom of `about.html`.
- **Case studies** (Results page): the `cases` list near the bottom of `results.html`.
- **Industry blurbs** in the hero personalizer: the `IND` list in `assets/js/main.js`.
- **Colours and fonts**: the `:root` tokens at the top of `assets/css/style.css`. These are WolfPack's official brand values; don't change them.
- **Particle shapes per section**: add `data-shape="wolf|gem|funnel|knot|bars|sphere|cluster|scatter"` to a section. `data-x`, `data-y` and `data-s` set position and size; `data-mx`, `data-my`, `data-ms` and `data-mo` are the mobile equivalents.
- **Images** are currently loaded from wolfpackadvising.com. Before launch, copy them into `assets/img/` and update the paths.

## Before it replaces the live site
1. Remove the "Concept redesign" notice in `assets/js/main.js` (search for `concept notice`).
2. Remove `<meta name="robots" content="noindex, nofollow">` from every page.
3. Connect the Get Started form and add analytics (#8, #9).
4. Move the images to local files.
