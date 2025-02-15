# Baby Tracker

A Next.js application for tracking baby activities, milestones, and development.

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Prisma with SQLite
- TailwindCSS for styling

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Setup the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js app router pages and components
- `/db` - SQLite database and Prisma schema
- `/components` - Reusable UI components
- `/lib` - Utility functions and shared logic
- `/types` - TypeScript type definitions

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
