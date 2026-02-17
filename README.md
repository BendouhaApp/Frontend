# Bendouha Frontend (Next.js)

This project is now built with **Next.js App Router** for improved SEO and better production rendering behavior.

## Requirements

- Node.js 20+
- npm 10+

## Environment Variables

Create `.env` from `.env.example`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Scripts

- `npm run dev` - start local development server
- `npm run build` - build for production
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Notes

- Store and admin routes were migrated to Next.js routes while keeping the same URLs.
- Landing page (`/`) now includes SEO metadata and structured data.
- Admin image uploads (categories and products) now compress images client-side before upload.
