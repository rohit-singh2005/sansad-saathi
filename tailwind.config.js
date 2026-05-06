/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'saffron': '#FF9933',
        'white': '#FFFFFF',
        'green': '#138808',
        'chakra-blue': '#000080',
      },
      fontFamily: {
        'tiro': ['"Tiro Devanagari Hindi"', 'serif'],
        'noto': ['"Noto Sans"', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'marquee': 'marquee 60s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
