import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				serif: ['var(--font-playfair)'],
				sans: ['var(--font-lato)'],
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['pastel'],
	},
} satisfies Config;
