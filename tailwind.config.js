/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alpha Brand Colors - RED theme
        alpha: {
          primary: '#AE0721',      // Alpha Red - primary brand
          secondary: '#ce4c47',    // Lighter red
          accent: '#ff6b6b',       // Accent red
          dark: '#1a1a1a',         // Near black
          darker: '#0d0d0d',       // Darker black
          light: '#fafafa',        // Off-white
        },
        // Semantic colors
        primary: {
          DEFAULT: '#AE0721',
          dark: '#8a0519',
          light: '#ce4c47',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#AE0721',
          800: '#8a0519',
          900: '#6b0414',
        },
        // UI Colors - Dark theme
        background: {
          DEFAULT: '#0d0d0d',
          light: '#1a1a1a',
          lighter: '#262626',
          card: '#1f1f1f',
        },
        surface: {
          DEFAULT: '#1a1a1a',
          light: '#262626',
          hover: '#2a2a2a',
        },
        border: {
          DEFAULT: '#333333',
          light: '#404040',
        },
        // Text colors
        foreground: {
          DEFAULT: '#ffffff',
          muted: '#a3a3a3',
          subtle: '#737373',
        },
        // Status colors
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
