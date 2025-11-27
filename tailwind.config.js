/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Alpha Brand Colors - RED theme
        alpha: {
          primary: '#AE0721',
          secondary: '#ce4c47',
          accent: '#ff6b6b',
          dark: '#1a1a1a',
          darker: '#0d0d0d',
          light: '#fafafa',
        },
        // shadcn/ui CSS variable colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: '#8a0519',
          light: '#ce4c47',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Additional UI colors
        'background-light': '#1a1a1a',
        'background-lighter': '#262626',
        'background-card': '#1f1f1f',
        surface: {
          DEFAULT: '#1a1a1a',
          light: '#262626',
          hover: '#2a2a2a',
        },
        'foreground-muted': '#a3a3a3',
        'foreground-subtle': '#737373',
        'border-light': '#404040',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'alpha-gradient': 'linear-gradient(135deg, #AE0721 0%, #ce4c47 50%, #8a0519 100%)',
        'alpha-gradient-dark': 'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)',
        'hero-pattern': "url('/hero-bg.jpg')",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(174, 7, 33, 0.3)',
        'glow-lg': '0 0 40px rgba(174, 7, 33, 0.4)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
