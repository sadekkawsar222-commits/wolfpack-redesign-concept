# WolfPack Advising: redesign concept

A concept makeover of wolfpackadvising.com. It keeps the same content and the same brand colours, with a new interactive, scroll-driven 3D experience. **This is not the official WolfPack Advising website.**

- `index.html`: homepage. A WebGL particle field that morphs through a wolf, a diamond, a funnel, a knot, a bar chart, a globe and a cluster as you scroll. Also has the industry personalizer, lead-value calculator, AEO grader prompt, horizontal case-study track, industry constellation and team carousel.
- `services.html`, `about.html`, `results.html`, `industries.html`, `get-started.html`: inner pages.
- `qc-report.html`: the QC audit of the live site, plus two QC rounds on this redesign.
- `HANDOVER.md`: the client handover checklist and how to edit content.

## Run locally
```
node serve.js 5230
```
Then open http://localhost:5230. There's no build step. Libraries (Three.js, GSAP, Lenis) load from public CDNs.

## Deploy
It's a static site. Import the repo on Vercel with no framework, no build command, and output in the repo root. GitHub Pages works the same way.
