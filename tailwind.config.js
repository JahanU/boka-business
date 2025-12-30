/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}
