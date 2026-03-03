# Localization Testing Guide (FI / EN)

## Quick verification

### 1. Start the dev server

```bash
npm run dev
```

### 2. Test Finnish (default)

- Visit **http://localhost:3000** → redirects to **http://localhost:3000/fi**
- Or go directly to **http://localhost:3000/fi**
- Check:
  - Navbar: "Reitit", "Sisältö", "Tietoa"
  - Hero: "Find. Plan. Run." + Finnish subheadline
  - CTAs: "Tutustu reitteihin", "Lue oppaita"
  - Why Verter: "Miksi Verter", "Reitit nousulla", "Talvikunto", "Juoksijoiden tekemä"
  - Featured: "Suositellut reitit", "Uusin sisältö"
  - Footer: Finnish tagline

### 3. Test English

- Visit **http://localhost:3000/en**
- Or use the **EN** link in the Navbar (language switcher)
- Check:
  - Navbar: "Routes", "Content", "About"
  - Hero: "Find. Plan. Run." + English subheadline
  - CTAs: "Explore routes", "Read guides"
  - Why Verter: "Why Verter", "Routes with vertical", "Winter-aware", "Made by runners"
  - Featured: "Featured routes", "Latest content"
  - Footer: English tagline

### 4. Language switcher preserves path

- Go to **/fi/routes**
- Click **EN** → should land on **/en/routes**
- Go to **/en/content/winter-hills-paloheina**
- Click **FI** → should land on **/fi/content/winter-hills-paloheina**

### 5. Routes and content pages

- **/fi/routes** – Finnish labels (Sijainti, Harjoitus, Aktiiviset suodattimet, Tyhjennä kaikki)
- **/en/routes** – English labels (Location, Training, Active filters, Clear all)
- **/fi/content** – Finnish type filter (Blogi, Arvostelu, Podcast)
- **/en/content** – English type filter (Blog, Review, Podcast)
- Winter badges: "Hyvä" / "Riskialtista" / "Ei suositella" (FI) vs "Good" / "Risky" / "Not Recommended" (EN)

### 6. SEO metadata

- View page source or use DevTools → Elements → `<head>`
- **/fi**: `<html lang="fi">`, `<meta name="description" content="...">` in Finnish
- **/en**: `<html lang="en">`, description in English

### 7. Default locale redirect

- **/** → redirects to **/fi**
- **/routes** → redirects to **/fi/routes**
- **/about** → redirects to **/fi/about**
