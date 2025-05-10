/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          100: '#1E1E1E',
          200: '#2D2D2D',
          300: '#3D3D3D',
          400: '#4D4D4D',
          500: '#5C5C5C',
        },
        accent: {
          100: '#7F39FB',
          200: '#6B2FD8',
          300: '#5729B5',
          400: '#452392',
          500: '#331D6F',
        },
        light: {
          100: '#FFFFFF',
          200: '#F5F5F5',
          300: '#E5E5E5',
          400: '#D4D4D4',
          500: '#C4C4C4',
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(127, 57, 251, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 
