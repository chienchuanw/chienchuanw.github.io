This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Setting up the database

1. Copy the `.env.local.example` file to `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Edit the `.env.local` file to add your PostgreSQL database credentials.

3. Generate database migrations:

```bash
npm run db:generate
```

4. Apply the migrations to your database:

```bash
npm run db:migrate
```

5. (Optional) Run Drizzle Studio to view and manage your database:

```bash
npm run db:studio
```

### Running the development server

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

## Authentication

This project uses custom authentication with PostgreSQL and Drizzle ORM.

### Important Note on Authentication

For security reasons, user registration has been disabled. Only administrators can create new user accounts through database operations. To access the system:

- **Login URL**: `/login` (must be accessed directly via URL, e.g., `http://localhost:3000/login` or `https://yourdomain.com/login`)
- **Profile**: `/profile` (only accessible after login)

There are no login buttons or indicators on the website interface. All authentication must be performed by visiting the login URL directly.

### Creating New Users

Administrators can create new users using the script provided in the `scripts` directory:

```bash
npx tsx scripts/create-user.ts
```

Follow the prompts to create a new user account. See `scripts/README.md` for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

To learn more about Drizzle ORM:

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - comprehensive guide to Drizzle ORM.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Environment Variables for Production

Make sure to set the following environment variables in your Vercel project:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT token generation
