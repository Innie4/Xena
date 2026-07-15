/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#F7F1E8',
        terracotta: {
          DEFAULT: '#C1552C',
          dark: '#A4441F',
        },
        olive: {
          DEFAULT: '#3F4B2B',
          dark: '#2F3A20',
        },
        ink: '#1C2129',
        gold: '#D9A441',
        brick: '#9C3B2E',
        card: '#FFFDF8',
        warmgray: '#E4DCCB',
      },
      fontFamily: {
        serif: ['Fraunces', 'Lora', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(28, 33, 41, 0.08), 0 1px 2px rgba(28, 33, 41, 0.04)',
      },
    },
  },
  plugins: [],
}
