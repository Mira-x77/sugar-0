# Sugar-0%

A bright mint-and-turquoise storefront for Sugar-0% pure stevia extract, built with Vite, vanilla JavaScript, GSAP and Three.js.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the site at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

The production output is written to `dist/`.

## What's inside

- `index.html` — page structure: mint hero card, collection, live 3D product studio, sweetness calculator, 27-feature panels, nutrition, story, reviews, FAQ, contact and cart drawer.
- `src/main.js` — hero intro, scroll reveals, product switching, feature panel rendering, cart, forms and modals.
- `src/scene.js` — Three.js product models and the draggable 3D studio scene.
- `src/data.js` — products, the 27 features, reviews and FAQ content.
- `src/style.css` — design system and the mint/turquoise redesign layer at the end of the file.
- `public/assets/` — logo and product photography used by the site.

## Content notes

- **Prices are placeholders:** Powder ₹499, Sachets ₹349, Drops ₹599. Replace these in `src/data.js` with real pricing before launch.
- **Ingredient copy needs a final label check.** The website lists allulose, high-purity steviol glycosides and dietary fibre. The supplied label artwork still contains conflicting erythritol wording, so the ingredient panel, product modal, calculator notes and packaging should be reconciled before publishing.
- Contact details are live: `naturalsweetsolutions@gmail.com`, `+91 94273 18047`, F/3 Pooja Apartment, T.B. Hospital Road, Mehsana, Gujarat 384002.
- Checkout is a front-end demo. No payment gateway or order API is connected.

## Asset credits

Product photography, logo artwork and the Sugar-0% label designs are supplied brand assets. Fonts are Manrope and Cormorant Garamond via `@fontsource`.
