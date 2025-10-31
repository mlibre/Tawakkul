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
			arabic: ['Amiri', 'serif'],
		 },
	  },
	},
	plugins: [require('@tailwindcss/typography')],
 }
 