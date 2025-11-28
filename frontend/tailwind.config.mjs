/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: {
          50: '#F0FCF8',
          100: '#E0F8F0',
          200: '#B9F1DD',
          300: '#92EAC9',
          400: '#6BE2B6',
          500: '#60DEB1',
          600: '#49D49D',
          700: '#3AA97D',
          800: '#2B7E5E',
          900: '#1C533E',
        },
        'light-blue': '#C6E2E9',
      },
    },
  },
  plugins: [],
};
