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

- `index.html` — page structure: mint hero card, collection, dedicated product view, sweetness calculator, 27-feature panels, nutrition, story, reviews, FAQ, contact, cart drawer and floating enquiry form.
- `src/main.js` — hash routing, product view + 360° toggle, scroll reveals, feature panel rendering, cart, delivery PIN check and forms.
- `src/scene.js` — Three.js product models, loaded on demand only for the product 360° view.
- `src/data.js` — products, the 27 features, reviews and FAQ content.
- `src/style.css` — design system and the mint/turquoise redesign layer at the end of the file.
- `public/assets/` — logo and product photography used by the site.

## Routes

- Product details open at `#/product/<id>` (`jar`, `sachet`, `drops`). This is an in-page hash route, so the shared header, cart and toasts keep working without a page reload.
- The 360° view loads `src/scene.js` lazily the first time it is selected; the home page no longer initialises WebGL.

## Content notes

- **Prices are placeholders:** Powder ₹499, Sachets ₹349, Drops ₹599. Replace these in `src/data.js` with real pricing before launch.
- **Ingredient copy needs a final label check.** The website lists allulose, high-purity steviol glycosides and dietary fibre. The supplied label artwork still contains conflicting erythritol wording, so the ingredient panel, product view, calculator notes and packaging should be reconciled before publishing.
- Contact details are live: `naturalsweetsolutions@gmail.com`, `+91 94273 18047`, F/3 Pooja Apartment, T.B. Hospital Road, Mehsana, Gujarat 384002.
- Checkout is a front-end demo. No payment gateway or order API is connected; the cart opens a pre-filled email order.
- The cart delivery PIN check is a front-end estimate only. It confirms the PIN format and serviceable region prefixes, and the team still confirms delivery before dispatch. Real availability needs a courier API.

## Asset credits

Product photography, logo artwork and the Sugar-0% label designs are supplied brand assets. Fonts are Manrope and Cormorant Garamond via `@fontsource`.
