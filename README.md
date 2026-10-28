# VELORA — luxury womenswear website

A static, editorial landing page built with HTML5, CSS3 and vanilla JavaScript. No build step, no backend, no dependencies.

## Structure

```
index.html          Semantic markup for all sections
style.css           Design tokens + labelled sections (header, hero, collage, …)
script.js           Sticky header, mobile menu, reveal, filters, quick view, bag, search, newsletter
assets/favicon.svg  Text-based favicon
```

## Run

Open `index.html` directly, or serve it locally (recommended):

```
python -m http.server 8123
# then visit http://localhost:8123
```

Fonts (Cormorant Garamond, Inter) load from Google Fonts with serif/sans fallbacks. Photography loads from Unsplash and needs an internet connection.

## Notes

- **Photography:** Unsplash images (Unsplash licence). Every image shares one CSS grade (`.ph`: desaturate, darken, burgundy colour layer) so mixed stock reads as one campaign. Swap any `src` in `index.html` for your own campaign shots; the grade is applied automatically.
- **Newsletter fabric** is a procedural CSS burgundy-satin gradient (no image).
- **Frontend demo only:** newsletter, bag, account and legal links send nothing and go nowhere.
- Hero slide indicators (01/02/03) are decorative.
- Respects `prefers-reduced-motion`; content is visible without JavaScript.
