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
        // Alpha Brand Colors
        alpha: {
          primary: '#003087',      // Dark Blue - primary brand
          secondary: '#2b6ab6',    // Medium Blue
          accent: '#5588c4',       // Light Blue accent
          dark: '#22242a',         // Near black
          light: '#fafafa',        // Off-white background
        },
        // Semantic colors
        primary: {
          DEFAULT: '#003087',
          dark: '#002060',
          light: '#2b6ab6',
        },
        secondary: {
          DEFAULT: '#5588c4',
          dark: '#3C77BD',
          light: '#7aa5d4',
        },
        // UI Colors
        background: {
          DEFAULT: '#22242a',
          light: '#2d2f36',
          lighter: '#3a3d45',
        },
        surface: {
          DEFAULT: '#2d2f36',
          light: '#3a3d45',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ce4c47',
        'error-dark': '#AE0721',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
