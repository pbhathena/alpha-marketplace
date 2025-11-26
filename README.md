# Alpha Marketplace

A modern marketplace application built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Backend**: Supabase
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pbhathena/alpha-marketplace.git
   cd alpha-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Stripe credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
alpha-marketplace/
├── src/
│   ├── App.tsx          # Main application component with routing
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind imports
├── public/              # Static assets
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## License

MIT
