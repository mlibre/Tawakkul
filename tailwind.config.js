/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  './index.html',
	  './src/**/*.{js,ts,jsx,tsx}',
	  './components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
	  extend: {
		 fontFamily: {
			persian: ['Vazirmatn', 'sans-serif'],
			arabic: ['NotoNaskhArabic', 'serif'],
		 },
	  },
	},
	plugins: [require('@tailwindcss/typography')],
 }
 