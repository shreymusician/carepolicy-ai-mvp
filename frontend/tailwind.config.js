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
        'primary': '#0066CC',  // One accent color only
        'text': '#000000',
        'text-light': '#333333',
        'text-muted': '#666666',
        'border': '#CCCCCC',
        'background': '#FFFFFF',
        'background-alt': '#F5F5F5',
      },
      spacing: {
        'safe-top': 'max(1rem, var(--safe-area-inset-top))',
        'safe-bottom': 'max(1rem, var(--safe-area-inset-bottom))',
      }
    },
  },
  plugins: [],
}
