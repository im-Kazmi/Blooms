<div align="center">
  <img src="./icon.png?height=150&width=150" alt="Blooms Logo" width="150" height="150">
  <h1>✨ Blooms ✨</h1>
  <p>An  open-source alternative to LemonSqueezy and Paddle</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-13.4.7-blue)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.2-blue)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-4.15.0-blue)](https://www.prisma.io/)
</div>

## 🌟 Introduction

Blooms is an open-source e-commerce platform designed to empower developers and businesses with a heavenly alternative to LemonSqueezy and Paddle. Our mission is to provide a feature-rich, customizable, and scalable solution for digital product sales, subscriptions, and license management.

## 🚀 Key Features

- 🛒 Digital product sales
- 💳 Subscription management
- 🔑 License key generation and validation
- 📊 Analytics and reporting
- 🌐 Multi-currency support
- 🔒 Secure payment processing
- 🎨 Customizable checkout experiences
- 🔗 API for seamless integrations
- 📱 Mobile-responsive design

## 🛠️ Tech Stack

Blooms is built with a combination of modern technologies:

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Hono.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Payment Processing**: Stripe
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 🌈 Installation

To set up your own instance of Blooms, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/im-Kazmi/Blooms-
   cd
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration details.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the magic!

## 🌟 Usage

Here's a glimpse of how to use Blooms in your project:

SDK is not built yet nor the app but will be used like the following. it is just an example
```typescript
import { Blooms } from 'celestialcommerce';

const cc = new Blooms({
  apiKey: 'your_api_key',
  // other configuration options
});

// Create a new product
const product = await cc.products.create({
  name: 'Stardust Software',
  price: 29.99,
  currency: 'USD',
});

// Generate a license key
const license = await cc.licenses.generate(product.id);

console.log(`New license key: \${license.key}`);
```

## 📜 License

Blooms is open-source software licensed under the MIT license. See the [LICENSE](LICENSE) file for more details.

---

<div align="center">
  <p>Crafted with ❤️ by the kazmi (for now) </p>
</div>
