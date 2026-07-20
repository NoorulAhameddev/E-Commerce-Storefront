# Shopwave Storefront

A basic e-commerce web application built with Next.js, Prisma, hosted PostgreSQL, and role-based authentication.

## Features

- Product catalog with add-to-cart flow
- Cart and checkout experience
- User registration and login
- Role-based access for Admin and User accounts
- Backend APIs for product and order management
- Hosted PostgreSQL integration through Prisma, including Neon-compatible setups
- Order tracking for signed-in customers
- Admin console for product and order management

## Demo accounts

Created by the seed script:

- Admin: `admin@example.com` / `Admin123!`
- User: `customer@example.com` / `User123!`

## Setup

1. Create a Neon PostgreSQL database, then copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to the Neon connection string.
3. Set `JWT_SECRET` to a long random value.
4. Install dependencies with `npm install`.
5. Run Prisma migrations and seed data.

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Neon MCP integration

If you want VS Code or another MCP client to talk to Neon with OAuth, use the Neon MCP server:

```bash
npx add-mcp https://mcp.neon.tech/mcp -a vscode
```

For a project-level VS Code setup, this repo includes `.vscode/mcp.json` with the Neon MCP server configured through `mcp-remote`.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - generate Prisma client and build the app
- `npm run lint` - run ESLint
- `npm run typecheck` - run the TypeScript compiler without emitting files
- `npm run db:generate` - generate the Prisma client
- `npm run db:seed` - seed demo users and products

## Notes

- The app expects PostgreSQL and works well with Neon or similar hosted providers.
- The checkout flow calculates totals on the server.
- Admin users can create, edit, and delete products, plus update order status.
