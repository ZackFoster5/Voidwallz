# Voidwallz

Voidwallz is a brutalist wallpaper library built with Next.js 15, TypeScript, and Tailwind CSS v4. It features interactive typography, smooth scroll animations, and responsive light/dark theming for curating high-quality desktop and mobile wallpapers.

## Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the experience.

## Tech Stack

- Next.js App Router with TypeScript
- Tailwind CSS v4 + custom OKLCH design tokens
- Framer Motion based scroll animations
- Prisma ORM (PostgreSQL-ready)

## Project Structure Highlights

- `src/app/page.tsx` – hero landing experience with interactive "CURATED VISUALS" text
- `src/app/gallery/page.tsx` – filterable gallery with responsive grid & preview modal
- `src/app/categories/page.tsx` – curated categories with device-filtered collections
- `src/components/` – reusable brutalist UI elements, theme toggle, and animation primitives

## Environment Variables

Create an `.env` file based on `env.example` when integrating a database:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

## License

MIT
