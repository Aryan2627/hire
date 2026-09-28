const fs = require('fs');

// Vercel auto-injects POSTGRES_PRISMA_URL or POSTGRES_URL if using Vercel Postgres.
// If the user manually added DATABASE_URL, we use that.
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

if (dbUrl) {
  console.log("Database connection string detected. Configuring Prisma...");
  fs.writeFileSync('.env', `DATABASE_URL="${dbUrl}"\n`);
} else {
  console.warn("WARNING: No Database URL detected in Vercel Environment Variables!");
  console.warn("Injecting a dummy URL so the frontend can compile successfully.");
  // Prisma requires a syntactically valid URL to run `prisma generate`
  fs.writeFileSync('.env', `DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"\n`);
}
