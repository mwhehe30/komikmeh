This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Features

- 📚 Browse komik series (Manga, Manhwa, Manhua)
- 🔖 Bookmark favorite series
- 🔔 Push notifications for new chapters
- 📱 Progressive Web App (PWA) support
- 🌙 Responsive design

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing Notifications

### Quick Start
```bash
# Start dev server
npm run dev

# Open test page
http://localhost:3000/test-notifications.html
```

Follow the on-screen instructions to test the notification system.

### Documentation
📚 **[DOCS-INDEX.md](DOCS-INDEX.md)** - Complete documentation index

Quick links:
- [QUICK-TEST.md](QUICK-TEST.md) - 5-minute quick start
- [CHEATSHEET.md](CHEATSHEET.md) - Command reference
- [TESTING-NOTIFIKASI.md](TESTING-NOTIFIKASI.md) - Detailed guide
- [TESTING-PRODUCTION.md](TESTING-PRODUCTION.md) - Production testing
- [API-TEST.md](API-TEST.md) - API testing & debugging

## Troubleshooting

**Notifications not working?**
1. Check browser permission (must be "Allow")
2. Enable notifications in app settings
3. Run initialization (see test page)
4. Check console for errors

**No bookmarks?**
- Add some series to bookmarks first
- Notifications only work for bookmarked series

**History not initialized?**
- Use test page to initialize
- Or wait for automatic initialization (5 seconds after page load)

For more help, see the testing documentation files above.

