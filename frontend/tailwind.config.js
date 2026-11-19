/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#16324f',
        clinic: {
          50: '#effcf9',
          100: '#d8f6ef',
          500: '#10a88a',
          600: '#0f8b75',
          700: '#0f766e',
          800: '#115e59'
        }
      },
      boxShadow: {
        soft: '0 20px 60px -28px rgba(15, 118, 110, 0.23)'
      }
    }
  },
  plugins: []
};
