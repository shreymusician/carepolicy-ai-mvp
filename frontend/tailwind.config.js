/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      colors: {
        'primary': '#2563eb',
        'secondary': '#14b8a6',
        'accent': '#7c3aed',
        'text': '#0f172a',
        'text-light': '#334155',
        'text-muted': '#64748b',
        'border': '#dbeafe',
        'background': '#f8fbff',
        'background-alt': '#eef6ff',
      },
      spacing: {
        'safe-top': 'max(1rem, var(--safe-area-inset-top))',
        'safe-bottom': 'max(1rem, var(--safe-area-inset-bottom))',
      }
    },
  },
  plugins: [],
}
