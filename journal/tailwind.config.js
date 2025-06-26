/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg-darker': '#1f2937',
        'brand-bg-light': '#374151',
        'brand-text': '#f9fafb',
        'brand-text-muted': '#9ca3af',
        'brand-accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
